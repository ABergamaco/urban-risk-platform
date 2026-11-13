package com.fiap.ec.urban_risk.service;

import java.time.LocalDateTime;
import java.util.Comparator;
import java.util.List;
import java.util.Optional;
import java.util.Set;
import java.util.stream.Collectors;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.fiap.ec.urban_risk.dto.AcaoAgenteRequest;
import com.fiap.ec.urban_risk.dto.NovosAlertasResponse;
import com.fiap.ec.urban_risk.dto.ValidacaoRequest;
import com.fiap.ec.urban_risk.exception.DadosInvalidosException;
import com.fiap.ec.urban_risk.exception.RecursoDuplicadoException;
import com.fiap.ec.urban_risk.exception.RecursoNaoEncontradoException;
import com.fiap.ec.urban_risk.model.Evento;
import com.fiap.ec.urban_risk.model.Origem;
import com.fiap.ec.urban_risk.model.Perfil;
import com.fiap.ec.urban_risk.model.Regiao;
import com.fiap.ec.urban_risk.model.Severidade;
import com.fiap.ec.urban_risk.model.StatusEvento;
import com.fiap.ec.urban_risk.model.TipoRisco;
import com.fiap.ec.urban_risk.model.TipoValidacao;
import com.fiap.ec.urban_risk.model.Usuario;
import com.fiap.ec.urban_risk.model.Validacao;
import com.fiap.ec.urban_risk.repository.EventoRepository;
import com.fiap.ec.urban_risk.repository.RelatoRepository;
import com.fiap.ec.urban_risk.repository.ValidacaoRepository;

/**
 * Regras de negócio dos eventos/alertas:
 * - criar/atualizar eventos a partir das leituras (registrarPorRegra)
 * - encerrar quando a leitura volta ao normal (normalizar)
 * - cruzar fontes: se sensor e comunidade apontam o mesmo risco, a confiança sobe
 * - priorizar alertas (ordenação por prioridade)
 * - confirmações/contestações de moradores e ações de agentes
 */
@Service
public class EventoService {

    /**
     * Só gera NOTIFICAÇÃO o alerta LARANJA ou VERMELHO (prioridade >= 55) com confiança
     * pelo menos MÉDIA (>= 50). Um relato isolado e não confirmado aparece na lista,
     * mas não dispara notificação para todo mundo: isso evita alarme falso.
     */
    public static final double PRIORIDADE_NOTIFICACAO = 55.0;
    public static final int CONFIANCA_NOTIFICACAO = CalculoRisco.CONFIANCA_MEDIA;

    private final EventoRepository eventoRepository;
    private final ValidacaoRepository validacaoRepository;
    private final RelatoRepository relatoRepository;
    private final UsuarioService usuarioService;

    public EventoService(EventoRepository eventoRepository,
                         ValidacaoRepository validacaoRepository,
                         RelatoRepository relatoRepository,
                         UsuarioService usuarioService) {
        this.eventoRepository = eventoRepository;
        this.validacaoRepository = validacaoRepository;
        this.relatoRepository = relatoRepository;
        this.usuarioService = usuarioService;
    }

    // ============================ CONSULTAS ============================

    public List<Evento> listar(TipoRisco tipo, Origem origem, StatusEvento status, Long regiaoId) {
        return eventoRepository.findAllByOrderByAtualizadoEmDesc().stream()
                .filter(e -> tipo == null || e.getTipo() == tipo)
                .filter(e -> origem == null || e.getOrigem() == origem)
                .filter(e -> status == null || e.getStatus() == status)
                .filter(e -> regiaoId == null || e.getRegiao().getId().equals(regiaoId))
                .toList();
    }

    public Evento buscarPorId(Long id) {
        return eventoRepository.findById(id)
                .orElseThrow(() -> new RecursoNaoEncontradoException("Evento não encontrado."));
    }

    /** Alertas ativos ORDENADOS POR PRIORIDADE (maior primeiro). */
    public List<Evento> alertasPriorizados(TipoRisco tipo, Long regiaoId, Integer confiancaMinima, Integer limite) {
        int max = (limite == null || limite <= 0) ? 100 : Math.min(limite, 200);
        return eventoRepository.findByStatus(StatusEvento.ATIVO).stream()
                .filter(e -> tipo == null || e.getTipo() == tipo)
                .filter(e -> regiaoId == null || e.getRegiao().getId().equals(regiaoId))
                .filter(e -> confiancaMinima == null || e.getConfianca() >= confiancaMinima)
                .sorted(Comparator.comparingDouble(Evento::getPrioridade).reversed())
                .limit(max)
                .toList();
    }

    /**
     * Alertas que ficaram graves desde a última consulta do app.
     * O app chama a cada ~15 s e dispara notificação para cada item retornado.
     */
    public NovosAlertasResponse novosAlertas(LocalDateTime desde) {
        LocalDateTime agora = LocalDateTime.now();
        if (desde == null) {
            // Primeira chamada: só devolve a referência de horário, sem notificar o que já existia.
            return new NovosAlertasResponse(agora, List.of());
        }
        List<Evento> novos = eventoRepository.findByStatusAndEscaladoEmAfter(StatusEvento.ATIVO, desde).stream()
                .filter(e -> e.getPrioridade() >= PRIORIDADE_NOTIFICACAO)
                .filter(e -> e.getConfianca() >= CONFIANCA_NOTIFICACAO)
                .sorted(Comparator.comparingDouble(Evento::getPrioridade).reversed())
                .toList();
        return new NovosAlertasResponse(agora, novos);
    }

    /** Relatos da comunidade que ainda aguardam validação de um agente. */
    public List<Evento> pendentesDeValidacao() {
        return eventoRepository
                .findByStatusAndOrigemAndValidadoPorAgenteFalseOrderByCriadoEmDesc(StatusEvento.ATIVO, Origem.COMUNIDADE)
                .stream()
                .sorted(Comparator.comparingDouble(Evento::getPrioridade).reversed())
                .toList();
    }

    // ===================== EVENTOS GERADOS PELAS REGRAS =====================

    /**
     * Cria um evento novo ou atualiza o evento ativo da mesma região/tipo/origem.
     * Assim, um sensor que manda leitura a cada 15 s não gera 4 alertas por minuto.
     */
    @Transactional
    public Evento registrarPorRegra(Regiao regiao, TipoRisco tipo, Origem origem, String fonte,
                                    int pesoSeveridade, String titulo, String descricao) {
        LocalDateTime agora = LocalDateTime.now();
        Severidade severidade = Severidade.dePeso(pesoSeveridade);

        Optional<Evento> existente = eventoRepository.findFirstByStatusAndRegiaoIdAndTipoAndOrigem(
                StatusEvento.ATIVO, regiao.getId(), tipo, origem);

        if (existente.isPresent()) {
            Evento evento = existente.get();
            int pesoMaximo = evento.getPesoMaximo() == null ? evento.getSeveridade().getPeso() : evento.getPesoMaximo();
            if (pesoSeveridade > pesoMaximo) {
                // Ficou mais grave do que já esteve: conta como alerta "novo" (gera notificação)
                evento.setEscaladoEm(agora);
                evento.setPesoMaximo(pesoSeveridade);
            }
            evento.setSeveridade(severidade);
            evento.setTitulo(titulo);
            evento.setDescricao(descricao);
            evento.setFonte(fonte);
            evento.setAtualizadoEm(agora);
            evento.setDesatualizado(false);
            evento.recalcularConfianca();
            return eventoRepository.save(evento);
        }

        Evento evento = new Evento();
        evento.setTipo(tipo);
        evento.setRegiao(regiao);
        evento.setTitulo(titulo);
        evento.setDescricao(descricao);
        evento.setSeveridade(severidade);
        evento.setPesoMaximo(pesoSeveridade);
        evento.setOrigem(origem);
        evento.setFonte(fonte);
        evento.setStatus(StatusEvento.ATIVO);
        evento.setLatitude(regiao.getLatitude());
        evento.setLongitude(regiao.getLongitude());
        evento.setCriadoEm(agora);
        evento.setAtualizadoEm(agora);
        evento.setEscaladoEm(agora);
        evento.recalcularConfianca();
        Evento salvo = eventoRepository.save(evento);
        recalcularCorroboracao(regiao.getId(), tipo);
        return salvo;
    }

    /** Leitura voltou ao normal: encerra o evento ativo daquela origem. */
    @Transactional
    public void normalizar(Regiao regiao, TipoRisco tipo, Origem origem, String motivo) {
        eventoRepository.findFirstByStatusAndRegiaoIdAndTipoAndOrigem(StatusEvento.ATIVO, regiao.getId(), tipo, origem)
                .ifPresent(evento -> {
                    encerrar(evento, StatusEvento.RESOLVIDO, "Normalizado automaticamente: " + motivo);
                    recalcularCorroboracao(regiao.getId(), tipo);
                });
    }

    /**
     * CRUZAMENTO DE FONTES: para cada evento ativo de uma região/tipo, conta quantas
     * OUTRAS origens também estão apontando o mesmo risco. Cada uma soma +15 de confiança.
     * Ex.: sensor de nível + relato de morador sobre alagamento no mesmo bairro.
     */
    @Transactional
    public void recalcularCorroboracao(Long regiaoId, TipoRisco tipo) {
        List<Evento> ativos = eventoRepository.findByStatusAndRegiaoIdAndTipo(StatusEvento.ATIVO, regiaoId, tipo);
        Set<Origem> origens = ativos.stream().map(Evento::getOrigem).collect(Collectors.toSet());
        for (Evento e : ativos) {
            int outras = origens.contains(e.getOrigem()) ? origens.size() - 1 : origens.size();
            e.setFontesCorroborando(outras);
            e.recalcularConfianca();
        }
        eventoRepository.saveAll(ativos);
    }

    // ===================== VALIDAÇÕES (moradores e agentes) =====================

    @Transactional
    public Evento validar(Long eventoId, ValidacaoRequest req) {
        if (req.tipo() == null) {
            throw new DadosInvalidosException("Informe o tipo: CONFIRMAR ou CONTESTAR.");
        }
        Usuario usuario = usuarioService.buscarPorId(req.usuarioId());
        Evento evento = buscarPorId(eventoId);
        if (evento.getStatus() != StatusEvento.ATIVO) {
            throw new DadosInvalidosException("Este evento já foi encerrado.");
        }

        if (usuario.getPerfil() == Perfil.AGENTE) {
            return validarComoAgente(evento, req.tipo());
        }

        // ---- Morador ----
        if (validacaoRepository.existsByEventoIdAndUsuarioId(eventoId, usuario.getId())) {
            throw new RecursoDuplicadoException("Você já avaliou este evento.");
        }
        if (relatoRepository.existsByEventoIdAndAutorId(eventoId, usuario.getId())) {
            throw new DadosInvalidosException("Você não pode avaliar o seu próprio relato.");
        }
        validacaoRepository.save(new Validacao(evento, usuario, req.tipo(), LocalDateTime.now()));

        if (req.tipo() == TipoValidacao.CONFIRMAR) {
            evento.setConfirmacoes(evento.getConfirmacoes() + 1);
        } else {
            evento.setContestacoes(evento.getContestacoes() + 1);
        }
        evento.setAtualizadoEm(LocalDateTime.now());
        evento.recalcularConfianca();

        // Muitas contestações e confiança mínima: a própria comunidade derruba o relato
        if (evento.getOrigem() == Origem.COMUNIDADE
                && evento.getContestacoes() >= 3
                && evento.getConfianca() <= CalculoRisco.CONFIANCA_MIN) {
            encerrar(evento, StatusEvento.DESCARTADO, "Descartado por contestações da comunidade.");
            recalcularCorroboracao(evento.getRegiao().getId(), evento.getTipo());
        }
        return eventoRepository.save(evento);
    }

    private Evento validarComoAgente(Evento evento, TipoValidacao tipo) {
        if (tipo == TipoValidacao.CONFIRMAR) {
            evento.setValidadoPorAgente(true);
            evento.setObservacaoAgente("Confirmado por agente local.");
            evento.setAtualizadoEm(LocalDateTime.now());
            evento.setEscaladoEm(LocalDateTime.now()); // confiança subiu muito: avisa os moradores
            evento.recalcularConfianca();
            return eventoRepository.save(evento);
        }
        encerrar(evento, StatusEvento.DESCARTADO, "Descartado por agente local (ocorrência não confirmada).");
        Evento salvo = eventoRepository.save(evento);
        recalcularCorroboracao(evento.getRegiao().getId(), evento.getTipo());
        return salvo;
    }

    /** Agente encerra a ocorrência (água baixou, energia voltou, etc.). */
    @Transactional
    public Evento resolver(Long eventoId, AcaoAgenteRequest req) {
        usuarioService.exigirAgente(req.usuarioId());
        Evento evento = buscarPorId(eventoId);
        if (evento.getStatus() != StatusEvento.ATIVO) {
            throw new DadosInvalidosException("Este evento já foi encerrado.");
        }
        String obs = (req.observacao() == null || req.observacao().isBlank())
                ? "Resolvido por agente local."
                : "Resolvido por agente local: " + req.observacao().trim();
        encerrar(evento, StatusEvento.RESOLVIDO, obs);
        Evento salvo = eventoRepository.save(evento);
        recalcularCorroboracao(evento.getRegiao().getId(), evento.getTipo());
        return salvo;
    }

    // ===================== DADOS DESATUALIZADOS =====================

    /** Sensor parou de mandar dados: o alerta continua, mas com confiança menor e marcado como desatualizado. */
    @Transactional
    public int marcarDesatualizados(int limiteMinutos) {
        LocalDateTime limite = LocalDateTime.now().minusMinutes(limiteMinutos);
        List<Evento> parados = eventoRepository
                .findByStatusAndOrigemAndAtualizadoEmBefore(StatusEvento.ATIVO, Origem.SENSOR, limite)
                .stream()
                .filter(e -> !Boolean.TRUE.equals(e.getDesatualizado()))
                .toList();
        for (Evento e : parados) {
            e.setDesatualizado(true);
            e.recalcularConfianca();
        }
        eventoRepository.saveAll(parados);
        return parados.size();
    }

    private void encerrar(Evento evento, StatusEvento status, String observacao) {
        evento.setStatus(status);
        evento.setEncerradoEm(LocalDateTime.now());
        evento.setAtualizadoEm(LocalDateTime.now());
        evento.setObservacaoAgente(observacao);
        eventoRepository.save(evento);
    }
}
