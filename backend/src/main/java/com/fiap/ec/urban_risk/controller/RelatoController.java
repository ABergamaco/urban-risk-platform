package com.fiap.ec.urban_risk.controller;

import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.ResponseStatus;
import org.springframework.web.bind.annotation.RestController;

import com.fiap.ec.urban_risk.dto.RelatoRequest;
import com.fiap.ec.urban_risk.model.Evento;
import com.fiap.ec.urban_risk.service.RelatoService;

/** Registros comunitários. Retorna o evento criado (ou o existente ao qual o relato foi somado). */
@RestController
@RequestMapping("/relatos")
@CrossOrigin
public class RelatoController {

    private final RelatoService service;

    public RelatoController(RelatoService service) {
        this.service = service;
    }

    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    public Evento criar(@RequestBody RelatoRequest req) {
        return service.criar(req);
    }
}
