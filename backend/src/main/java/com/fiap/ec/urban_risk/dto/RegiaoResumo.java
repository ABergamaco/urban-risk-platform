package com.fiap.ec.urban_risk.dto;

import java.time.LocalDateTime;

public record RegiaoResumo(
        Long id,
        String nome,
        String zona,
        Double latitude,
        Double longitude,
        int alertasAtivos,
        String nivelRisco,          // pior nivelAlerta entre os eventos ativos da região
        Double temperatura,         // última leitura (sensor ou base pública)
        Double precipitacao,        // última leitura da base pública
        Double nivelAgua,           // última leitura do sensor de nível
        LocalDateTime atualizadoEm) {
}
