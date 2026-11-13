package com.fiap.ec.urban_risk.controller;

import java.util.List;

import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RestController;

import com.fiap.ec.urban_risk.dto.FonteStatus;
import com.fiap.ec.urban_risk.dto.PainelResponse;
import com.fiap.ec.urban_risk.service.PainelService;

@RestController
@CrossOrigin
public class PainelController {

    private final PainelService service;

    public PainelController(PainelService service) {
        this.service = service;
    }

    /** Resumo geral: alertas por tipo/nível, alerta principal, situação de cada região e das fontes. */
    @GetMapping("/painel")
    public PainelResponse painel() {
        return service.montarPainel();
    }

    /** Situação de cada fonte de dados (sensores, base pública, comunidade). */
    @GetMapping("/fontes")
    public List<FonteStatus> fontes() {
        return service.statusFontes();
    }
}
