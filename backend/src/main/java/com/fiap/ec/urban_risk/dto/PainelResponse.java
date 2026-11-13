package com.fiap.ec.urban_risk.dto;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Map;

import com.fiap.ec.urban_risk.model.Evento;

/** Tudo o que a tela "Painel" do app precisa em uma única chamada. */
public record PainelResponse(
        LocalDateTime geradoEm,
        long alertasAtivos,
        long alertasVermelhos,
        Map<String, Long> porTipo,
        Map<String, Long> porNivel,
        Evento alertaPrincipal,
        List<RegiaoResumo> regioes,
        List<FonteStatus> fontes) {
}
