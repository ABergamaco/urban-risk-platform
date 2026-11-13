package com.fiap.ec.urban_risk.service;

import java.time.Duration;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;
import java.util.Map;
import java.util.concurrent.ConcurrentHashMap;

import org.springframework.data.domain.PageRequest;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.fiap.ec.urban_risk.model.Evento;
import com.fiap.ec.urban_risk.model.Grandeza;
import com.fiap.ec.urban_risk.model.Leitura;
import com.fiap.ec.urban_risk.model.Origem;
import com.fiap.ec.urban_risk.model.Regiao;
import com.fiap.ec.urban_risk.model.StatusEvento;
import com.fiap.ec.urban_risk.repository.EventoRepository;
import com.fiap.ec.urban_risk.repository.LeituraRepository;
import com.fiap.ec.urban_risk.repository.RegiaoRepository;

/**
 * Aplica a AnaliseTendencia a cada nova leitura de sensor e grava o resultado
 * nos alertas ATIVOS da mesma região e tipo (inclusive relatos da comunidade:
 * se o morador relatou alagamento e o sensor do bairro está subindo, o relato
 * também ganha prioridade).
 *
 * Também emite o ALERTA PREDITIVO: se a previsão indica que o próximo nível
 * será atingido em até 15 minutos, o alerta conta como "novo" uma vez e o app
 * notifica os moradores ANTES de a situação piorar.
 */
@Service
public class TendenciaService {

    /** Quantas leituras entram na regressão (12 × 15 s = últimos 3 minutos). */
    public static final int JANELA = 12;
    public static final int MINUTOS_ALERTA_PREDITIVO = 15;

    private final LeituraRepository leituraRepository;
    private final EventoRepository eventoRepository;
    private final RegiaoRepository regiaoRepository;

    /** Última análise por região+grandeza (exposta em GET /analise/tendencias). */
    private final Map<String, AnaliseTendencia.Resultado> ultimas = new ConcurrentHashMap<>();

    public TendenciaService(LeituraRepository leituraRepository, EventoRepository eventoRepository,
                            RegiaoRepository regiaoRepository) {
        this.leituraRepository = leituraRepository;
        this.eventoRepository = eventoRepository;
        this.regiaoRepository = regiaoRepository;
    }

    @Transactional
    public AnaliseTendencia.Resultado atualizar(Regiao regiao, Grandeza grandeza) {
        if (grandeza != Grandeza.NIVEL_AGUA && grandeza != Grandeza.TEMPERATURA) return null;

        List<Leitura> leituras = leituraRepository.findByRegiaoIdAndGrandezaAndOrigemOrderByDataHoraDesc(
                regiao.getId(), grandeza, Origem.SENSOR, PageRequest.of(0, JANELA));
        if (leituras.isEmpty()) return null;

        LocalDateTime inicio = leituras.get(leituras.size() - 1).getDataHora();
        List<AnaliseTendencia.Ponto> pontos = new ArrayList<>();
        for (Leitura l : leituras) {
            double minutos = Duration.between(inicio, l.getDataHora()).toMillis() / 60000.0;
            pontos.add(new AnaliseTendencia.Ponto(minutos, l.getValor()));
        }

        double atual = leituras.get(0).getValor();
        double[] proximo = CalculoRisco.proximoLimite(grandeza.name(), atual);
        double limiarEstavel = grandeza == Grandeza.NIVEL_AGUA ? 0.5 : 0.05;

        AnaliseTendencia.Resultado r = AnaliseTendencia.analisar(pontos, limiarEstavel, atual,
                proximo == null ? null : proximo[0],
                proximo == null ? null : CalculoRisco.nomeNivel((int) proximo[1]),
                grandeza == Grandeza.NIVEL_AGUA ? "cm" : "°C");
        ultimas.put(chave(regiao.getId(), grandeza), r);

        int pesoProximo = proximo == null ? 0 : (int) proximo[1];
        List<Evento> eventos = eventoRepository.findByStatusAndRegiaoIdAndTipo(
                StatusEvento.ATIVO, regiao.getId(), grandeza.getRiscoRelacionado());
        for (Evento e : eventos) {
            aplicar(e, r, pesoProximo);
        }
        eventoRepository.saveAll(eventos);
        return r;
    }

    private void aplicar(Evento e, AnaliseTendencia.Resultado r, int pesoProximo) {
        e.setTendencia(r.tendencia());
        e.setTaxaVariacao(r.taxaPorMinuto());
        e.setPrevisaoMinutos(r.minutosAteProximoNivel());
        e.setPrevisaoTexto(r.texto());
        e.setAjusteTendencia(r.ajustePrioridade());

        boolean vaiPiorarLogo = "SUBINDO".equals(r.tendencia())
                && r.minutosAteProximoNivel() != null
                && r.minutosAteProximoNivel() <= MINUTOS_ALERTA_PREDITIVO
                && pesoProximo > e.getSeveridade().getPeso();
        if (vaiPiorarLogo && !Boolean.TRUE.equals(e.getAlertaPreditivo())) {
            e.setAlertaPreditivo(true);
            e.setEscaladoEm(LocalDateTime.now()); // notifica antes de piorar
        } else if (!"SUBINDO".equals(r.tendencia())) {
            e.setAlertaPreditivo(false);
        }
    }

    /** Situação atual da análise em todas as regiões. */
    public List<Map<String, Object>> listar() {
        List<Map<String, Object>> lista = new ArrayList<>();
        for (Regiao r : regiaoRepository.findAll()) {
            for (Grandeza g : List.of(Grandeza.NIVEL_AGUA, Grandeza.TEMPERATURA)) {
                AnaliseTendencia.Resultado res = ultimas.get(chave(r.getId(), g));
                if (res != null) {
                    lista.add(Map.of("regiaoId", r.getId(), "regiao", r.getNome(),
                            "grandeza", g.name(), "analise", res));
                }
            }
        }
        return lista;
    }

    private static String chave(Long regiaoId, Grandeza g) {
        return regiaoId + ":" + g.name();
    }
}
