package com.fiap.ec.urban_risk;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertTrue;

import org.junit.jupiter.api.Test;

import com.fiap.ec.urban_risk.service.CalculoRisco;

/** Testes das regras de confiança, prioridade e limites. Rodar com: ./mvnw test */
class CalculoRiscoTest {

    @Test
    void relatoComunitarioComecaComConfiancaBaixa() {
        int c = CalculoRisco.confianca(35, 0, 0, 0, false, false);
        assertEquals(35, c);
        assertEquals("BAIXA", CalculoRisco.nivelConfianca(c));
    }

    @Test
    void confirmacoesECruzamentoDeFontesAumentamConfianca() {
        // 2 confirmações + 1 sensor apontando o mesmo risco = 35 + 20 + 15
        int c = CalculoRisco.confianca(35, 2, 0, 1, false, false);
        assertEquals(70, c);
        assertEquals("MEDIA", CalculoRisco.nivelConfianca(c));
    }

    @Test
    void validacaoDoAgenteLevaConfiancaParaAlta() {
        assertEquals(75, CalculoRisco.confianca(35, 0, 0, 0, true, false));
    }

    @Test
    void confiancaTemLimitesMinimoEMaximo() {
        assertEquals(CalculoRisco.CONFIANCA_MAX, CalculoRisco.confianca(85, 10, 0, 2, true, false));
        assertEquals(CalculoRisco.CONFIANCA_MIN, CalculoRisco.confianca(35, 0, 5, 0, false, false));
    }

    @Test
    void sensorDesatualizadoPerdeConfianca() {
        assertEquals(55, CalculoRisco.confianca(80, 0, 0, 0, false, true));
    }

    @Test
    void prioridadeMaximaQuandoCriticoConfiavelERecente() {
        double p = CalculoRisco.prioridade(4, 99, 0);
        assertEquals(99.7, p, 0.01);
        assertEquals("VERMELHO", CalculoRisco.nivelAlerta(p));
    }

    @Test
    void prioridadeCaiComOTempo() {
        double agora = CalculoRisco.prioridade(3, 80, 0);
        double depois = CalculoRisco.prioridade(3, 80, 360);
        assertTrue(agora > depois);
        assertEquals(15.0, agora - depois, 0.01);
    }

    @Test
    void alertaGraveComConfiancaBaixaFicaAbaixoDeAlertaConfiavel() {
        double relatoNaoConfirmado = CalculoRisco.prioridade(3, 35, 0);
        double sensor = CalculoRisco.prioridade(3, 80, 0);
        assertTrue(sensor > relatoNaoConfirmado);
    }

    @Test
    void limitesDasRegras() {
        assertEquals(0, CalculoRisco.severidadeNivelAgua(10));
        assertEquals(3, CalculoRisco.severidadeNivelAgua(55));
        assertEquals(4, CalculoRisco.severidadeNivelAgua(80));
        assertEquals(2, CalculoRisco.severidadeTemperatura(33));
        assertEquals(0, CalculoRisco.severidadePrecipitacao(2));
        assertEquals(3, CalculoRisco.severidadeEnergia(0));
        assertEquals(0, CalculoRisco.severidadeEnergia(1));
    }
}
