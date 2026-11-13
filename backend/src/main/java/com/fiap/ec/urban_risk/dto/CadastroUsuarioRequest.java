package com.fiap.ec.urban_risk.dto;

import com.fiap.ec.urban_risk.model.Perfil;

/** codigoAgente só é exigido quando perfil = AGENTE. */
public record CadastroUsuarioRequest(
        String nome,
        String email,
        String senha,
        Perfil perfil,
        Long regiaoId,
        String codigoAgente) {
}
