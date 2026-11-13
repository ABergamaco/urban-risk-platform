package com.fiap.ec.urban_risk.model;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.Table;

/** Bairro/região monitorada. */
@Entity
@Table(name = "regioes")
public class Regiao {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, unique = true)
    private String nome;

    private String zona;

    @Column(nullable = false)
    private Double latitude;

    @Column(nullable = false)
    private Double longitude;

    /** Quantos °C a região costuma ficar acima da média da cidade (efeito ilha de calor). */
    private Double efeitoIlhaCalor;

    /** Região com histórico de alagamentos (várzea, córrego, baixada). */
    private Boolean propensaAlagamento;

    public Regiao() {}

    public Regiao(String nome, String zona, Double latitude, Double longitude,
                  Double efeitoIlhaCalor, Boolean propensaAlagamento) {
        this.nome = nome;
        this.zona = zona;
        this.latitude = latitude;
        this.longitude = longitude;
        this.efeitoIlhaCalor = efeitoIlhaCalor;
        this.propensaAlagamento = propensaAlagamento;
    }

    public Long getId() { return id; }
    public String getNome() { return nome; }
    public String getZona() { return zona; }
    public Double getLatitude() { return latitude; }
    public Double getLongitude() { return longitude; }
    public Double getEfeitoIlhaCalor() { return efeitoIlhaCalor; }
    public Boolean getPropensaAlagamento() { return propensaAlagamento; }

    public void setId(Long id) { this.id = id; }
    public void setNome(String nome) { this.nome = nome; }
    public void setZona(String zona) { this.zona = zona; }
    public void setLatitude(Double latitude) { this.latitude = latitude; }
    public void setLongitude(Double longitude) { this.longitude = longitude; }
    public void setEfeitoIlhaCalor(Double efeitoIlhaCalor) { this.efeitoIlhaCalor = efeitoIlhaCalor; }
    public void setPropensaAlagamento(Boolean propensaAlagamento) { this.propensaAlagamento = propensaAlagamento; }
}
