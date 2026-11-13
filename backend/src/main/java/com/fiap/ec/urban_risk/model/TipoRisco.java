package com.fiap.ec.urban_risk.model;

/** Tipos de risco urbano monitorados pela plataforma. */
public enum TipoRisco {
    ALAGAMENTO("Alagamento"),
    ILHA_DE_CALOR("Ilha de calor"),
    INTERRUPCAO_SERVICO("Interrupção de serviço");

    private final String descricao;

    TipoRisco(String descricao) {
        this.descricao = descricao;
    }

    public String getDescricao() { return descricao; }
}
