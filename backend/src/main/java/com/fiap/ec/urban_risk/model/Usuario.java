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

/**
 * Usuário do app (morador ou agente local).
 *
 * LGPD: a senha nunca é guardada em texto puro (só o hash SHA-256 com salt)
 * e os campos senhaHash/salt nunca saem na resposta da API (@JsonIgnore).
 */
@Entity
@Table(name = "usuarios")
public class Usuario {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private String nome;

    @Column(nullable = false, unique = true)
    private String email;

    @JsonIgnore
    @Column(nullable = false)
    private String senhaHash;

    @JsonIgnore
    @Column(nullable = false)
    private String salt;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private Perfil perfil;

    /** Bairro de interesse do usuário (onde mora/atua). Opcional. */
    @ManyToOne
    @JoinColumn(name = "regiao_id")
    private Regiao regiao;

    private LocalDateTime criadoEm;

    public Usuario() {}

    public Long getId() { return id; }
    public String getNome() { return nome; }
    public String getEmail() { return email; }
    public String getSenhaHash() { return senhaHash; }
    public String getSalt() { return salt; }
    public Perfil getPerfil() { return perfil; }
    public Regiao getRegiao() { return regiao; }
    public LocalDateTime getCriadoEm() { return criadoEm; }

    public void setId(Long id) { this.id = id; }
    public void setNome(String nome) { this.nome = nome; }
    public void setEmail(String email) { this.email = email; }
    public void setSenhaHash(String senhaHash) { this.senhaHash = senhaHash; }
    public void setSalt(String salt) { this.salt = salt; }
    public void setPerfil(Perfil perfil) { this.perfil = perfil; }
    public void setRegiao(Regiao regiao) { this.regiao = regiao; }
    public void setCriadoEm(LocalDateTime criadoEm) { this.criadoEm = criadoEm; }
}
