package com.fiap.ec.urban_risk.dto;

import com.fiap.ec.urban_risk.model.Severidade;
import com.fiap.ec.urban_risk.model.TipoRisco;

/**
 * latitude/longitude são opcionais; sem elas usamos o centro da região.
 * severidade é a gravidade percebida pelo morador (opcional, padrão MODERADA,
 * máximo ALTA: CRITICA só pode vir de sensor ou agente).
 */
public record RelatoRequest(
        Long usuarioId,
        Long regiaoId,
        TipoRisco tipo,
        String descricao,
        Severidade severidade,
        Double latitude,
        Double longitude) {
}
