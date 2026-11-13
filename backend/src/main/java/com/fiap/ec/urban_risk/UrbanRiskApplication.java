package com.fiap.ec.urban_risk;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.scheduling.annotation.EnableScheduling;

/**
 * Urban Risk Intelligence Platform - Backend
 *
 * @EnableScheduling liga as tarefas automáticas (@Scheduled):
 * - SimuladorSensores: gera leituras dos sensores simulados
 * - OpenMeteoService: busca dados reais de clima (base pública)
 * - ManutencaoService: marca dados desatualizados e limpa leituras antigas
 */
@SpringBootApplication
@EnableScheduling
public class UrbanRiskApplication {

    public static void main(String[] args) {
        SpringApplication.run(UrbanRiskApplication.class, args);
    }
}
