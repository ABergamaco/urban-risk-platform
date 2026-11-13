package com.fiap.ec.urban_risk.model;

import java.time.LocalDateTime;

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
 * Sensor instalado em uma região.
 * simulado = true  -> leituras geradas pelo SimuladorSensores
 * simulado = false -> sensor real, envia leituras via POST /leituras
 */
@Entity
@Table(name = "sensores")
public class Sensor {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, unique = true)
    private String codigo;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private Grandeza grandeza;

    @ManyToOne
    @JoinColumn(name = "regiao_id", nullable = false)
    private Regiao regiao;

    private Boolean simulado;

    private Double ultimoValor;

    private LocalDateTime ultimaLeitura;

    public Sensor() {}

    public Sensor(String codigo, Grandeza grandeza, Regiao regiao, Boolean simulado, Double valorInicial) {
        this.codigo = codigo;
        this.grandeza = grandeza;
        this.regiao = regiao;
        this.simulado = simulado;
        this.ultimoValor = valorInicial;
    }

    public Long getId() { return id; }
    public String getCodigo() { return codigo; }
    public Grandeza getGrandeza() { return grandeza; }
    public Regiao getRegiao() { return regiao; }
    public Boolean getSimulado() { return simulado; }
    public Double getUltimoValor() { return ultimoValor; }
    public LocalDateTime getUltimaLeitura() { return ultimaLeitura; }

    public void setId(Long id) { this.id = id; }
    public void setCodigo(String codigo) { this.codigo = codigo; }
    public void setGrandeza(Grandeza grandeza) { this.grandeza = grandeza; }
    public void setRegiao(Regiao regiao) { this.regiao = regiao; }
    public void setSimulado(Boolean simulado) { this.simulado = simulado; }
    public void setUltimoValor(Double ultimoValor) { this.ultimoValor = ultimoValor; }
    public void setUltimaLeitura(LocalDateTime ultimaLeitura) { this.ultimaLeitura = ultimaLeitura; }
}
