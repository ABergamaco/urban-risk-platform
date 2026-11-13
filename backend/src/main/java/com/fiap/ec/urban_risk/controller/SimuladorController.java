package com.fiap.ec.urban_risk.controller;

import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.fiap.ec.urban_risk.dto.SimulacaoRequest;
import com.fiap.ec.urban_risk.model.Evento;
import com.fiap.ec.urban_risk.service.SimuladorSensores;

/**
 * Apenas para DEMONSTRAÇÃO: força um cenário crítico nos sensores simulados.
 * Body: {"regiaoId": 1, "tipo": "ALAGAMENTO" | "ILHA_DE_CALOR" | "INTERRUPCAO_SERVICO"}
 */
@RestController
@RequestMapping("/simulador")
@CrossOrigin
public class SimuladorController {

    private final SimuladorSensores simulador;

    public SimuladorController(SimuladorSensores simulador) {
        this.simulador = simulador;
    }

    @PostMapping("/eventos")
    public Evento disparar(@RequestBody SimulacaoRequest req) {
        return simulador.disparar(req.regiaoId(), req.tipo());
    }
}
