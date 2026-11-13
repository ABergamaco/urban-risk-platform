package com.fiap.ec.urban_risk.controller;

import java.util.List;

import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.fiap.ec.urban_risk.exception.RecursoNaoEncontradoException;
import com.fiap.ec.urban_risk.model.Regiao;
import com.fiap.ec.urban_risk.repository.RegiaoRepository;

@RestController
@RequestMapping("/regioes")
@CrossOrigin
public class RegiaoController {

    private final RegiaoRepository repository;

    public RegiaoController(RegiaoRepository repository) {
        this.repository = repository;
    }

    @GetMapping
    public List<Regiao> listar() {
        return repository.findAll();
    }

    @GetMapping("/{id}")
    public Regiao buscarPorId(@PathVariable Long id) {
        return repository.findById(id)
                .orElseThrow(() -> new RecursoNaoEncontradoException("Região não encontrada."));
    }
}
