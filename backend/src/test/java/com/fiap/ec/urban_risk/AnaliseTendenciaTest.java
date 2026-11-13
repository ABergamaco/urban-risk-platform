package com.fiap.ec.urban_risk;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertNull;
import static org.junit.jupiter.api.Assertions.assertTrue;

import java.util.ArrayList;
import java.util.List;
import java.util.Random;

import org.junit.jupiter.api.Test;

import com.fiap.ec.urban_risk.service.AnaliseTendencia;
import com.fiap.ec.urban_risk.service.AnaliseTendencia.Ponto;
import com.fiap.ec.urban_risk.service.AnaliseTendencia.Resultado;
import com.fiap.ec.urban_risk.service.CalculoRisco;

/** Testes da análise de tendência (regressão linear) usada na priorização. */
class AnaliseTendenciaTest {

    @Test
    void regressaoLinearDeUmaRetaPerfeita() {
        // y = 10 + 2x
        List<Ponto> pontos = List.of(new Ponto(0, 10), new Ponto(1, 12), new Ponto(2, 14), new Ponto(3, 16));
        AnaliseTendencia.Reta reta = AnaliseTendencia.regressaoLinear(pontos);
        assertEquals(2.0, reta.inclinacao(), 1e-9);
        assertEquals(10.0, reta.intercepto(), 1e-9);
        assertEquals(1.0, reta.r2(), 1e-9);
    }

    @Test
    void aguaSubindoRapidoPreveNivelCriticoEAumentaPrioridade() {
        List<Ponto> pontos = new ArrayList<>();
        for (int i = 0; i < 12; i++) pontos.add(new Ponto(i * 0.25, 20 + i * 3)); // 12 cm/min
        Resultado r = AnaliseTendencia.analisar(pontos, 0.5, 53, 80.0, "CRÍTICA", "cm");
        assertEquals("SUBINDO", r.tendencia());
        assertEquals(12.0, r.taxaPorMinuto(), 0.01);
        assertEquals(Integer.valueOf(3), r.minutosAteProximoNivel()); // (80 - 53) / 12 = 2,25 -> 3 min
        assertEquals(10, r.ajustePrioridade());
    }

    @Test
    void aguaBaixandoReduzPrioridade() {
        List<Ponto> pontos = new ArrayList<>();
        for (int i = 0; i < 12; i++) pontos.add(new Ponto(i * 0.25, 58 - i * 0.9));
        Resultado r = AnaliseTendencia.analisar(pontos, 0.5, 48, 50.0, "ALTA", "cm");
        assertEquals("DESCENDO", r.tendencia());
        assertEquals(-5, r.ajustePrioridade());
        assertNull(r.minutosAteProximoNivel());
    }

    @Test
    void ruidoSemTendenciaEhEstavel() {
        Random random = new Random(42);
        List<Ponto> pontos = new ArrayList<>();
        for (int i = 0; i < 12; i++) pontos.add(new Ponto(i * 0.25, 8 + random.nextDouble() * 3 - 1.5));
        Resultado r = AnaliseTendencia.analisar(pontos, 0.5, 8, 15.0, "BAIXA", "cm");
        assertEquals("ESTAVEL", r.tendencia());
        assertEquals(0, r.ajustePrioridade());
    }

    @Test
    void poucasLeiturasNaoGeramTendencia() {
        Resultado r = AnaliseTendencia.analisar(List.of(new Ponto(0, 1), new Ponto(1, 5)), 0.5, 5, 15.0, "BAIXA", "cm");
        assertEquals("SEM_DADOS", r.tendencia());
    }

    @Test
    void tendenciaDesempataAlertasComMesmaGravidade() {
        double piorando = CalculoRisco.prioridade(3, 80, 0, 10);
        double estavel = CalculoRisco.prioridade(3, 80, 0, 0);
        double melhorando = CalculoRisco.prioridade(3, 80, 0, -5);
        assertTrue(piorando > estavel && estavel > melhorando);
        assertTrue(CalculoRisco.prioridade(4, 99, 0, 10) <= 100); // limitado a 100
    }
}
