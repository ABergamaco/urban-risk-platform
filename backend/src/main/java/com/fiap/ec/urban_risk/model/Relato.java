package com.fiap.ec.urban_risk.model;

import java.time.LocalDateTime;

import com.fasterxml.jackson.annotation.JsonIgnore;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.Table;

/**
 * Registro comunitário enviado por um morador.
 * Um ou mais relatos alimentam um Evento de origem COMUNIDADE.
 *
 * LGPD: o autor fica guardado (para evitar spam e auto-confirmação),
 * mas NUNCA é exposto na API (@JsonIgnore). Publicamente o relato é anônimo.
 */
@Entity
@Table(name = "relatos")
public class Relato {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @JsonIgnore
    @ManyToOne
    @JoinColumn(name = "evento_id", nullable = false)
    private Evento evento;

    @JsonIgnore
    @ManyToOne
    @JoinColumn(name = "autor_id", nullable = false)
    private Usuario autor;

    @Column(nullable = false, length = 500)
    private String descricao;

    @Column(nullable = false)
    private LocalDateTime criadoEm;

    public Relato() {}

    public Relato(Evento evento, Usuario autor, String descricao, LocalDateTime criadoEm) {
        this.evento = evento;
        this.autor = autor;
        this.descricao = descricao;
        this.criadoEm = criadoEm;
    }

    public Long getId() { return id; }
    public Evento getEvento() { return evento; }
    public Usuario getAutor() { return autor; }
    public String getDescricao() { return descricao; }
    public LocalDateTime getCriadoEm() { return criadoEm; }

    public void setId(Long id) { this.id = id; }
    public void setEvento(Evento evento) { this.evento = evento; }
    public void setAutor(Usuario autor) { this.autor = autor; }
    public void setDescricao(String descricao) { this.descricao = descricao; }
    public void setCriadoEm(LocalDateTime criadoEm) { this.criadoEm = criadoEm; }
}
