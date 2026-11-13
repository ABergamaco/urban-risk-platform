package com.fiap.ec.urban_risk.dto;

import com.fiap.ec.urban_risk.model.TipoRisco;

/** Usado na demonstração para forçar um evento crítico em uma região. */
public record SimulacaoRequest(Long regiaoId, TipoRisco tipo) {
}
