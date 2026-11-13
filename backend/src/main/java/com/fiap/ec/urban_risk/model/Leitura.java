package com.fiap.ec.urban_risk.model;

import java.time.LocalDateTime;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.Index;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.Table;

/**
 * Leitura = dado bruto recebido (de um sensor ou de uma base pública).
 * As regras do LeituraService analisam cada leitura e decidem se ela vira um Evento.
 */
@Entity
@Table(name = "leituras", indexes = {
        @Index(name = "idx_leitura_regiao", columnList = "regiao_id")
})
public class Leitura {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne
    @JoinColumn(name = "regiao_id", nullable = false)
    private Regiao regiao;

    /** Preenchido quando a leitura veio de um sensor. Nulo para base pública. */
    @ManyToOne
    @JoinColumn(name = "sensor_id")
    private Sensor sensor;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private Origem origem;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private Grandeza grandeza;

    @Column(nullable = false)
    private Double valor;

    private String unidade;

    /** Nome legível da fonte. Ex.: "Sensor NV-PAN-01 (simulado)" ou "Open-Meteo". */
    private String fonte;

    @Column(nullable = false)
    private Integer confianca;

    @Column(nullable = false)
    private LocalDateTime dataHora;

    public Leitura() {}

    public Leitura(Regiao regiao, Sensor sensor, Origem origem, Grandeza grandeza,
                   Double valor, String fonte, LocalDateTime dataHora) {
        this.regiao = regiao;
        this.sensor = sensor;
        this.origem = origem;
        this.grandeza = grandeza;
        this.valor = valor;
        this.unidade = grandeza.getUnidade();
        this.fonte = fonte;
        this.confianca = origem.getConfiancaBase();
        this.dataHora = dataHora;
    }

    public Long getId() { return id; }
    public Regiao getRegiao() { return regiao; }
    public Sensor getSensor() { return sensor; }
    public Origem getOrigem() { return origem; }
    public Grandeza getGrandeza() { return grandeza; }
    public Double getValor() { return valor; }
    public String getUnidade() { return unidade; }
    public String getFonte() { return fonte; }
    public Integer getConfianca() { return confianca; }
    public LocalDateTime getDataHora() { return dataHora; }

    public void setId(Long id) { this.id = id; }
    public void setRegiao(Regiao regiao) { this.regiao = regiao; }
    public void setSensor(Sensor sensor) { this.sensor = sensor; }
    public void setOrigem(Origem origem) { this.origem = origem; }
    public void setGrandeza(Grandeza grandeza) { this.grandeza = grandeza; }
    public void setValor(Double valor) { this.valor = valor; }
    public void setUnidade(String unidade) { this.unidade = unidade; }
    public void setFonte(String fonte) { this.fonte = fonte; }
    public void setConfianca(Integer confianca) { this.confianca = confianca; }
    public void setDataHora(LocalDateTime dataHora) { this.dataHora = dataHora; }
}
