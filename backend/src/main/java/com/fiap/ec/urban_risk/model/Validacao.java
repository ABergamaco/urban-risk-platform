package com.fiap.ec.urban_risk.model;

import java.time.LocalDateTime;

import com.fasterxml.jackson.annotation.JsonIgnore;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.Table;
import jakarta.persistence.UniqueConstraint;

/**
 * Confirmação ou contestação de um evento por um usuário.
 * A restrição única (evento, usuário) impede que a mesma pessoa vote duas vezes.
 */
@Entity
@Table(name = "validacoes", uniqueConstraints = {
        @UniqueConstraint(name = "uk_validacao_evento_usuario", columnNames = {"evento_id", "usuario_id"})
})
public class Validacao {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @JsonIgnore
    @ManyToOne
    @JoinColumn(name = "evento_id", nullable = false)
    private Evento evento;

    @JsonIgnore
    @ManyToOne
    @JoinColumn(name = "usuario_id", nullable = false)
    private Usuario usuario;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private TipoValidacao tipo;

    @Column(nullable = false)
    private LocalDateTime criadoEm;

    public Validacao() {}

    public Validacao(Evento evento, Usuario usuario, TipoValidacao tipo, LocalDateTime criadoEm) {
        this.evento = evento;
        this.usuario = usuario;
        this.tipo = tipo;
        this.criadoEm = criadoEm;
    }

    public Long getId() { return id; }
    public Evento getEvento() { return evento; }
    public Usuario getUsuario() { return usuario; }
    public TipoValidacao getTipo() { return tipo; }
    public LocalDateTime getCriadoEm() { return criadoEm; }
}
