package com.fiap.ec.urban_risk.service;

import java.time.Duration;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;
import java.util.OptionalDouble;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import com.fiap.ec.urban_risk.dto.FonteStatus;
import com.fiap.ec.urban_risk.dto.IndicadoresResponse;
import com.fiap.ec.urban_risk.model.Evento;
import com.fiap.ec.urban_risk.model.Origem;
import com.fiap.ec.urban_risk.model.StatusEvento;
import com.fiap.ec.urban_risk.repository.EventoRepository;
import com.fiap.ec.urban_risk.repository.RelatoRepository;

/** Calcula os indicadores de tempo de atualização e qualidade dos alertas (GET /indicadores). */
@Service
public class IndicadoresService {

    /** O app consulta /alertas/novos a cada 15 s (useMonitorAlertas.ts). */
    public static final int CICLO_APP_SEGUNDOS = 15;

    private final EventoRepository eventoRepository;
    private final RelatoRepository relatoRepository;
    private final PainelService painelService;
    private final LeituraService leituraService;
    private final long intervaloSensorMs;
    private final long intervaloOpenMeteoMs;

    public IndicadoresService(EventoRepository eventoRepository, RelatoRepository relatoRepository,
                              PainelService painelService, LeituraService leituraService,
                              @Value("${urbanrisk.simulador.intervalo-ms:15000}") long intervaloSensorMs,
                              @Value("${urbanrisk.openmeteo.intervalo-ms:600000}") long intervaloOpenMeteoMs) {
        this.eventoRepository = eventoRepository;
        this.relatoRepository = relatoRepository;
        this.painelService = painelService;
        this.leituraService = leituraService;
        this.intervaloSensorMs = intervaloSensorMs;
        this.intervaloOpenMeteoMs = intervaloOpenMeteoMs;
    }

    public IndicadoresResponse calcular() {
        LocalDateTime agora = LocalDateTime.now();
        return new IndicadoresResponse(agora, tempoAtualizacao(agora), qualidade(), uso(agora));
    }

    private IndicadoresResponse.TempoAtualizacao tempoAtualizacao(LocalDateTime agora) {
        List<IndicadoresResponse.Fonte> fontes = new ArrayList<>();
        for (FonteStatus f : painelService.statusFontes()) {
            int intervalo = switch (f.origem()) {
                case "SENSOR" -> (int) (intervaloSensorMs / 1000);
                case "BASE_PUBLICA" -> (int) (intervaloOpenMeteoMs / 1000);
                default -> 0; // comunidade: sob demanda (tempo real)
            };
            Long idade = f.ultimaAtualizacao() == null ? null
                    : Duration.between(f.ultimaAtualizacao(), agora).toSeconds();
            fontes.add(new IndicadoresResponse.Fonte(f.origem(), f.nome(), intervalo, idade, f.status()));
        }
        double processamento = arred(leituraService.tempoMedioProcessamentoMs(), 1);
        double maximo = intervaloSensorMs / 1000.0 + processamento / 1000.0 + CICLO_APP_SEGUNDOS;
        return new IndicadoresResponse.TempoAtualizacao(fontes, processamento,
                leituraService.totalLeiturasProcessadas(), CICLO_APP_SEGUNDOS, arred(maximo, 1));
    }

    private IndicadoresResponse.QualidadeAlertas qualidade() {
        List<Evento> todos = eventoRepository.findAll();
        List<Evento> ativos = todos.stream().filter(e -> e.getStatus() == StatusEvento.ATIVO).toList();

        double confMedia = ativos.stream().mapToInt(Evento::getConfianca).average().orElse(0);
        double pctAlta = pct(ativos.stream().filter(e -> e.getConfianca() >= CalculoRisco.CONFIANCA_ALTA).count(), ativos.size());
        double pctCorroborados = pct(ativos.stream().filter(e -> valor(e.getFontesCorroborando()) > 0).count(), ativos.size());

        List<Evento> comunidade = todos.stream().filter(e -> e.getOrigem() == Origem.COMUNIDADE).toList();
        int validados = (int) todos.stream().filter(e -> Boolean.TRUE.equals(e.getValidadoPorAgente())).count();
        int descartados = (int) todos.stream().filter(e -> e.getStatus() == StatusEvento.DESCARTADO).count();
        int agrupados = (int) Math.max(0, relatoRepository.count() - comunidade.size());

        int comTendencia = (int) ativos.stream()
                .filter(e -> e.getTendencia() != null && !"SEM_DADOS".equals(e.getTendencia())).count();
        int preditivos = (int) todos.stream().filter(e -> Boolean.TRUE.equals(e.getAlertaPreditivo())).count();

        OptionalDouble tempoValidacao = todos.stream()
                .filter(e -> e.getValidadoEm() != null)
                .mapToDouble(e -> Duration.between(e.getCriadoEm(), e.getValidadoEm()).toSeconds() / 60.0)
                .average();

        return new IndicadoresResponse.QualidadeAlertas(
                ativos.size(), arred(confMedia, 1), pctAlta, pctCorroborados,
                validados, descartados, pct(descartados, comunidade.size()), agrupados,
                comTendencia, preditivos,
                tempoValidacao.isPresent() ? arred(tempoValidacao.getAsDouble(), 1) : null);
    }

    private IndicadoresResponse.Uso uso(LocalDateTime agora) {
        LocalDateTime ontem = agora.minusHours(24);
        return new IndicadoresResponse.Uso(
                eventoRepository.findByCriadoEmAfter(ontem).size(),
                relatoRepository.countByCriadoEmAfter(ontem),
                relatoRepository.count());
    }

    private static double pct(long parte, long total) {
        return total == 0 ? 0 : arred(100.0 * parte / total, 1);
    }

    private static int valor(Integer i) {
        return i == null ? 0 : i;
    }

    private static double arred(double v, int casas) {
        double f = Math.pow(10, casas);
        return Math.round(v * f) / f;
    }
}
