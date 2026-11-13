package com.fiap.ec.urban_risk.model;

/**
 * De onde veio o dado. Cada origem tem uma confiança inicial diferente:
 * - BASE_PUBLICA: dado oficial (ex.: Open-Meteo) → confiança inicial mais alta
 * - SENSOR: medição automática, pode ter falha/descalibração
 * - COMUNIDADE: relato de morador, começa baixo e sobe com confirmações
 */
public enum Origem {
    SENSOR("Sensor", 80),
    BASE_PUBLICA("Base pública", 85),
    COMUNIDADE("Comunidade", 35);

    private final String descricao;
    private final int confiancaBase;

    Origem(String descricao, int confiancaBase) {
        this.descricao = descricao;
        this.confiancaBase = confiancaBase;
    }

    public String getDescricao() { return descricao; }
    public int getConfiancaBase() { return confiancaBase; }
}
