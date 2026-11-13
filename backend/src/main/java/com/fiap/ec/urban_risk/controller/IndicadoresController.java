package com.fiap.ec.urban_risk.controller;

import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RestController;

import com.fiap.ec.urban_risk.dto.IndicadoresResponse;
import com.fiap.ec.urban_risk.service.IndicadoresService;

/** Indicadores do enunciado: tempo de atualização e qualidade dos alertas. */
@RestController
@CrossOrigin
public class IndicadoresController {

    private final IndicadoresService service;

    public IndicadoresController(IndicadoresService service) {
        this.service = service;
    }

    @GetMapping("/indicadores")
    public IndicadoresResponse indicadores() {
        return service.calcular();
    }
}
