package com.fiap.ec.urban_risk.dto;

import com.fiap.ec.urban_risk.model.TipoRisco;

/**
 * Usado na demonstração para forçar um evento em uma região.
 * modo (só para ALAGAMENTO): "IMEDIATO" (padrão) = nível crítico na hora;
 * "GRADUAL" = água subindo aos poucos, para demonstrar a análise de tendência.
 */
public record SimulacaoRequest(Long regiaoId, TipoRisco tipo, String modo) {
}
