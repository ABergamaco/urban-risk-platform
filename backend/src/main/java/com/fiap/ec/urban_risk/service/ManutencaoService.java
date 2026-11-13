package com.fiap.ec.urban_risk.service;

import java.time.LocalDateTime;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.fiap.ec.urban_risk.repository.LeituraRepository;

/**
 * Tarefas automáticas de manutenção:
 * 1) A cada minuto: marca como DESATUALIZADO o alerta de sensor que parou de mandar dados
 *    (o tempo de atualização é crítico no case: dado velho vale menos).
 * 2) A cada hora: apaga leituras brutas com mais de 24 h, para o banco não crescer sem limite.
 *    Os EVENTOS (histórico de ocorrências) são mantidos.
 */
@Service
public class ManutencaoService {

    private static final Logger log = LoggerFactory.getLogger(ManutencaoService.class);

    private final EventoService eventoService;
    private final LeituraRepository leituraRepository;
    private final int limiteDesatualizadoMin;
    private final int retencaoLeiturasHoras;

    public ManutencaoService(EventoService eventoService,
                             LeituraRepository leituraRepository,
                             @Value("${urbanrisk.sensor.limite-desatualizado-min:10}") int limiteDesatualizadoMin,
                             @Value("${urbanrisk.leituras.retencao-horas:24}") int retencaoLeiturasHoras) {
        this.eventoService = eventoService;
        this.leituraRepository = leituraRepository;
        this.limiteDesatualizadoMin = limiteDesatualizadoMin;
        this.retencaoLeiturasHoras = retencaoLeiturasHoras;
    }

    @Scheduled(initialDelay = 60_000, fixedDelay = 60_000)
    public void verificarDadosDesatualizados() {
        int n = eventoService.marcarDesatualizados(limiteDesatualizadoMin);
        if (n > 0) {
            log.warn("{} alerta(s) de sensor marcados como desatualizados (sem dados há {} min).", n, limiteDesatualizadoMin);
        }
    }

    @Scheduled(initialDelay = 120_000, fixedDelay = 3_600_000)
    @Transactional
    public void limparLeiturasAntigas() {
        int apagadas = leituraRepository.apagarAnterioresA(LocalDateTime.now().minusHours(retencaoLeiturasHoras));
        if (apagadas > 0) {
            log.info("Limpeza: {} leituras antigas removidas.", apagadas);
        }
    }
}
