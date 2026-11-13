package com.fiap.ec.urban_risk.controller;

import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.ResponseStatus;
import org.springframework.web.bind.annotation.RestController;

import com.fiap.ec.urban_risk.dto.CadastroUsuarioRequest;
import com.fiap.ec.urban_risk.dto.LoginRequest;
import com.fiap.ec.urban_risk.model.Usuario;
import com.fiap.ec.urban_risk.service.UsuarioService;

@RestController
@RequestMapping("/usuarios")
@CrossOrigin
public class UsuarioController {

    private final UsuarioService service;

    public UsuarioController(UsuarioService service) {
        this.service = service;
    }

    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    public Usuario cadastrar(@RequestBody CadastroUsuarioRequest req) {
        return service.cadastrar(req);
    }

    @PostMapping("/login")
    public Usuario login(@RequestBody LoginRequest req) {
        return service.login(req);
    }

    @GetMapping("/{id}")
    public Usuario buscarPorId(@PathVariable Long id) {
        return service.buscarPorId(id);
    }
}
