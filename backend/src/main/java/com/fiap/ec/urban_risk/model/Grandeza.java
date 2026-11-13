package com.fiap.ec.urban_risk.model;

/** O que está sendo medido em uma leitura e qual risco ela indica. */
public enum Grandeza {
    NIVEL_AGUA("cm", TipoRisco.ALAGAMENTO),
    PRECIPITACAO("mm", TipoRisco.ALAGAMENTO),
    TEMPERATURA("°C", TipoRisco.ILHA_DE_CALOR),
    ENERGIA("1=ok / 0=falha", TipoRisco.INTERRUPCAO_SERVICO);

    private final String unidade;
    private final TipoRisco riscoRelacionado;

    Grandeza(String unidade, TipoRisco riscoRelacionado) {
        this.unidade = unidade;
        this.riscoRelacionado = riscoRelacionado;
    }

    public String getUnidade() { return unidade; }
    public TipoRisco getRiscoRelacionado() { return riscoRelacionado; }
}
