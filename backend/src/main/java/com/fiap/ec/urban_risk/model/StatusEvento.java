package com.fiap.ec.urban_risk.model;

public enum StatusEvento {
    ATIVO,       // risco acontecendo agora
    RESOLVIDO,   // normalizado (sensor voltou ao normal ou agente encerrou)
    DESCARTADO   // relato falso/contestado por agente
}
