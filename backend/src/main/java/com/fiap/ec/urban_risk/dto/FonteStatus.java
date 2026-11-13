package com.fiap.ec.urban_risk.dto;

import java.time.LocalDateTime;

/** Situação de cada fonte de dados (mostrada no painel). */
public record FonteStatus(
        String origem,
        String nome,
        String status,          // ONLINE | ATRASADA | OFFLINE | SEM_DADOS
        LocalDateTime ultimaAtualizacao,
        String detalhe,
        int confiancaBase) {
}
