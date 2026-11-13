package com.fiap.ec.urban_risk.service;

import java.time.LocalDateTime;
import java.util.Optional;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.fiap.ec.urban_risk.dto.RelatoRequest;
import com.fiap.ec.urban_risk.exception.DadosInvalidosException;
import com.fiap.ec.urban_risk.exception.RecursoDuplicadoException;
import com.fiap.ec.urban_risk.exception.RecursoNaoEncontradoException;
import com.fiap.ec.urban_risk.model.Evento;
import com.fiap.ec.urban_risk.model.Origem;
import com.fiap.ec.urban_risk.model.Regiao;
import com.fiap.ec.urban_risk.model.Relato;
import com.fiap.ec.urban_risk.model.Severidade;
import com.fiap.ec.urban_risk.model.StatusEvento;
import com.fiap.ec.urban_risk.model.Usuario;
import com.fiap.ec.urban_risk.repository.EventoRepository;
import com.fiap.ec.urban_risk.repository.RegiaoRepository;
import com.fiap.ec.urban_risk.repository.RelatoRepository;

/**
 * Registros comunitários.
 *
 * Regra anti-duplicidade: se já existe um relato ativo do mesmo tipo na mesma
 * região nas últimas 3 horas, o novo relato é somado a ele como confirmação
 * (em vez de criar outro alerta igual). Isso melhora a qualidade dos alertas.
 *
 * LGPD: o evento público mostra "Relato de morador (anônimo)" e a localização
 * é arredondada para ~100 m, para não expor o endereço exato de quem relatou.
 */
@Service
public class RelatoService {

    private static final int JANELA_AGRUPAMENTO_HORAS = 3;
    public static final String FONTE_COMUNIDADE = "Relato de morador (anônimo)";

    private final RelatoRepository relatoRepository;
    private final EventoRepository eventoRepository;
    private final RegiaoRepository regiaoRepository;
    private final UsuarioService usuarioService;
    private final EventoService eventoService;

    public RelatoService(RelatoRepository relatoRepository,
                         EventoRepository eventoRepository,
                         RegiaoRepository regiaoRepository,
                         UsuarioService usuarioService,
                         EventoService eventoService) {
        this.relatoRepository = relatoRepository;
        this.eventoRepository = eventoRepository;
        this.regiaoRepository = regiaoRepository;
        this.usuarioService = usuarioService;
        this.eventoService = eventoService;
    }

    @Transactional
    public Evento criar(RelatoRequest req) {
        if (req.tipo() == null) {
            throw new DadosInvalidosException("Escolha o tipo de ocorrência.");
        }
        if (req.regiaoId() == null) {
            throw new DadosInvalidosException("Escolha a região da ocorrência.");
        }
        String descricao = req.descricao() == null ? "" : req.descricao().trim();
        if (descricao.length() < 10) {
            throw new DadosInvalidosException("Descreva a ocorrência (mínimo 10 caracteres).");
        }
        if (descricao.length() > 500) {
            throw new DadosInvalidosException("A descrição deve ter no máximo 500 caracteres.");
        }

        Usuario autor = usuarioService.buscarPorId(req.usuarioId());
        Regiao regiao = regiaoRepository.findById(req.regiaoId())
                .orElseThrow(() -> new RecursoNaoEncontradoException("Região não encontrada."));
        LocalDateTime agora = LocalDateTime.now();

        // 1) Já existe relato parecido recente? Soma como confirmação.
        Optional<Evento> parecido = eventoRepository
                .findFirstByStatusAndRegiaoIdAndTipoAndOrigem(StatusEvento.ATIVO, regiao.getId(), req.tipo(), Origem.COMUNIDADE)
                .filter(e -> e.getCriadoEm().isAfter(agora.minusHours(JANELA_AGRUPAMENTO_HORAS)));

        if (parecido.isPresent()) {
            Evento evento = parecido.get();
            if (relatoRepository.existsByEventoIdAndAutorId(evento.getId(), autor.getId())) {
                throw new RecursoDuplicadoException("Você já relatou esta ocorrência. Obrigado!");
            }
            relatoRepository.save(new Relato(evento, autor, descricao, agora));
            evento.setConfirmacoes(evento.getConfirmacoes() + 1);
            evento.setAtualizadoEm(agora);
            evento.recalcularConfianca();
            return eventoRepository.save(evento);
        }

        // 2) Relato novo -> novo evento de origem COMUNIDADE
        Severidade severidade = req.severidade() == null ? Severidade.MODERADA : req.severidade();
        if (severidade == Severidade.CRITICA) {
            severidade = Severidade.ALTA; // CRITICA só por sensor ou agente
        }

        Evento evento = new Evento();
        evento.setTipo(req.tipo());
        evento.setRegiao(regiao);
        evento.setTitulo(req.tipo().getDescricao() + " relatado em " + regiao.getNome());
        evento.setDescricao(descricao);
        evento.setSeveridade(severidade);
        evento.setPesoMaximo(severidade.getPeso());
        evento.setOrigem(Origem.COMUNIDADE);
        evento.setFonte(FONTE_COMUNIDADE);
        evento.setStatus(StatusEvento.ATIVO);
        evento.setLatitude(arredondar(req.latitude() != null ? req.latitude() : regiao.getLatitude()));
        evento.setLongitude(arredondar(req.longitude() != null ? req.longitude() : regiao.getLongitude()));
        evento.setCriadoEm(agora);
        evento.setAtualizadoEm(agora);
        evento.setEscaladoEm(agora);
        evento.recalcularConfianca();
        Evento salvo = eventoRepository.save(evento);

        relatoRepository.save(new Relato(salvo, autor, descricao, agora));
        eventoService.recalcularCorroboracao(regiao.getId(), req.tipo());
        return eventoRepository.findById(salvo.getId()).orElse(salvo);
    }

    /** 3 casas decimais ≈ 110 m: suficiente para o mapa, sem expor o endereço exato. */
    private static double arredondar(double coordenada) {
        return Math.round(coordenada * 1000.0) / 1000.0;
    }
}
