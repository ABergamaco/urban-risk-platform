package com.fiap.ec.urban_risk.model;

/** Gravidade do evento. O peso (1 a 4) entra no cálculo de prioridade. */
public enum Severidade {
    BAIXA(1),
    MODERADA(2),
    ALTA(3),
    CRITICA(4);

    private final int peso;

    Severidade(int peso) {
        this.peso = peso;
    }

    public int getPeso() { return peso; }

    /** Converte o peso (1..4) devolvido pelas regras em Severidade. */
    public static Severidade dePeso(int peso) {
        for (Severidade s : values()) {
            if (s.peso == peso) return s;
        }
        throw new IllegalArgumentException("Peso de severidade inválido: " + peso);
    }
}
