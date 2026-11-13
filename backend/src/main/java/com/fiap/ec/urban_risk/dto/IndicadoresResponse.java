package com.fiap.ec.urban_risk.dto;

import java.time.LocalDateTime;
import java.util.List;

/**
 * Indicadores pedidos no enunciado:
 * - tempo de atualização   -> quão "fresco" é cada dado e quanto tempo até virar alerta
 * - qualidade dos alertas   -> confiança, cruzamento de fontes, falsos alarmes descartados
 * (facilidade de uso é demonstrada no app; aqui vão números de uso)
 */
public record IndicadoresResponse(
        LocalDateTime geradoEm,
        TempoAtualizacao tempoAtualizacao,
        QualidadeAlertas qualidade,
        Uso uso) {

    public record Fonte(String origem, String nome, int intervaloSegundos, Long idadeUltimoDadoSegundos, String status) {}

    public record TempoAtualizacao(
            List<Fonte> fontes,
            double processamentoMedioMs,       // leitura recebida -> alerta atualizado
            long leiturasProcessadas,
            int cicloNotificacaoAppSegundos,   // o app consulta novos alertas a cada X s
            double tempoMaximoAteAppSegundos) {} // pior caso: ciclo do sensor + processamento + ciclo do app
    
    public record QualidadeAlertas(
            int alertasAtivos,
            double confiancaMedia,
            double percentualConfiancaAlta,
            double percentualCorroborados,      // confirmados por outra fonte
            int validadosPorAgente,
            int descartadosFalsoAlarme,
            double taxaFalsoAlarme,              // descartados / eventos da comunidade
            int relatosAgrupados,                // relatos repetidos somados em vez de duplicar alerta
            int alertasComTendencia,
            int alertasPreditivos,
            Double tempoMedioValidacaoMinutos) {}

    public record Uso(
            long eventos24h,
            long relatos24h,
            long totalRelatos) {}
}
