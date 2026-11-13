package com.fiap.ec.urban_risk.dto;

import com.fiap.ec.urban_risk.model.TipoValidacao;

public record ValidacaoRequest(Long usuarioId, TipoValidacao tipo) {
}
