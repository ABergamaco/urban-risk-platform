package com.fiap.ec.urban_risk.dto;

/**
 * Formato para um sensor REAL enviar uma leitura (ex.: ESP32/Arduino via Wi-Fi):
 * POST /leituras  {"codigoSensor": "NV-PAN-01", "valor": 42.5}
 */
public record LeituraRequest(String codigoSensor, Double valor) {
}
