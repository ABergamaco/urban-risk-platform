package com.fiap.ec.urban_risk.controller;

import java.util.List;
import java.util.Map;

import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.fiap.ec.urban_risk.service.TendenciaService;

/** Resultado atual da análise de tendência (regressão linear) por região e medição. */
@RestController
@RequestMapping("/analise")
@CrossOrigin
public class AnaliseController {

    private final TendenciaService tendenciaService;

    public AnaliseController(TendenciaService tendenciaService) {
        this.tendenciaService = tendenciaService;
    }

    @GetMapping("/tendencias")
    public List<Map<String, Object>> tendencias() {
        return tendenciaService.listar();
    }
}
