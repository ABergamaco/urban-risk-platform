package com.fiap.ec.urban_risk.dto;

import java.time.LocalDateTime;
import java.util.List;

import com.fiap.ec.urban_risk.model.Evento;

/**
 * Resposta de GET /alertas/novos.
 * servidorEm é o "agora" do servidor: o app guarda e envia de volta no próximo
 * ?desde=..., assim não há problema se o relógio do celular estiver diferente.
 */
public record NovosAlertasResponse(LocalDateTime servidorEm, List<Evento> alertas) {
}
