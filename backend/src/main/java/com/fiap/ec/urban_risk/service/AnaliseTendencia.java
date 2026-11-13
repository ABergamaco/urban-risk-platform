package com.fiap.ec.urban_risk.service;

import java.util.List;
import java.util.Locale;

/**
 * ANÁLISE DE TENDÊNCIA (recurso de análise que apoia a priorização dos alertas).
 *
 * Usa REGRESSÃO LINEAR (método dos mínimos quadrados) sobre as últimas leituras
 * de um sensor para responder três perguntas:
 *
 *   1) O risco está SUBINDO, ESTÁVEL ou DESCENDO?   -> inclinação da reta (taxa por minuto)
 *   2) A tendência é confiável ou é só ruído?          -> coeficiente R² (0 a 1)
 *   3) Em quantos minutos o próximo nível será atingido? -> (limite - valor atual) / taxa
 *
 * O resultado ajusta a prioridade do alerta:
 *   SUBINDO e atinge o próximo nível em até 15 min  -> +10
 *   SUBINDO e atinge em até 60 min                   -> +6
 *   SUBINDO (mais devagar)                           -> +3
 *   DESCENDO (situação melhorando)                   -> −5
 *   ESTÁVEL ou poucos dados                          ->  0
 *
 * Assim, dois alagamentos com a mesma gravidade não empatam: o que está piorando
 * mais rápido aparece primeiro. Classe Java pura, testada em AnaliseTendenciaTest.
 */
public final class AnaliseTendencia {

    /** Mínimo de leituras para calcular a reta. */
    public static final int MIN_AMOSTRAS = 4;
    /** Abaixo deste R² a variação é considerada ruído (tendência ESTÁVEL). */
    public static final double R2_MINIMO = 0.3;

    private AnaliseTendencia() {}

    /** Uma leitura: tempo em minutos (desde a primeira leitura) e valor medido. */
    public record Ponto(double minutos, double valor) {}

    public record Resultado(
            String tendencia,          // SUBINDO | ESTAVEL | DESCENDO | SEM_DADOS
            double taxaPorMinuto,      // inclinação da reta
            double r2,                 // qualidade do ajuste (0 a 1)
            Integer minutosAteProximoNivel,
            String proximoNivel,       // ex.: "ALTA"
            int ajustePrioridade,
            int amostras,
            String texto) {

        public static Resultado semDados(int amostras) {
            return new Resultado("SEM_DADOS", 0, 0, null, null, 0, amostras,
                    "Poucas leituras para calcular tendência");
        }
    }

    /** Resultado da regressão linear: y = a + b·x */
    public record Reta(double inclinacao, double intercepto, double r2) {}

    /** Mínimos quadrados. */
    public static Reta regressaoLinear(List<Ponto> pontos) {
        int n = pontos.size();
        double mediaX = 0, mediaY = 0;
        for (Ponto p : pontos) {
            mediaX += p.minutos();
            mediaY += p.valor();
        }
        mediaX /= n;
        mediaY /= n;

        double sxy = 0, sxx = 0, syy = 0;
        for (Ponto p : pontos) {
            double dx = p.minutos() - mediaX;
            double dy = p.valor() - mediaY;
            sxy += dx * dy;
            sxx += dx * dx;
            syy += dy * dy;
        }
        if (sxx == 0) return new Reta(0, mediaY, 0);
        double b = sxy / sxx;
        double a = mediaY - b * mediaX;
        double r2 = syy == 0 ? 1.0 : (sxy * sxy) / (sxx * syy);
        return new Reta(b, a, r2);
    }

    /**
     * @param pontos         últimas leituras (qualquer ordem)
     * @param limiarEstavel  |taxa| abaixo disso = estável (ex.: 0,5 cm/min para água)
     * @param valorAtual     leitura mais recente
     * @param proximoLimite  próximo limite acima do valor atual (null se já está no máximo)
     * @param proximoNivel   nome do nível desse limite (ex.: "ALTA")
     * @param unidade        para o texto (ex.: "cm")
     */
    public static Resultado analisar(List<Ponto> pontos, double limiarEstavel, double valorAtual,
                                     Double proximoLimite, String proximoNivel, String unidade) {
        if (pontos.size() < MIN_AMOSTRAS) return Resultado.semDados(pontos.size());

        Reta reta = regressaoLinear(pontos);
        double taxa = arred(reta.inclinacao(), 2);
        double r2 = arred(reta.r2(), 2);
        String taxaTxt = String.format(Locale.forLanguageTag("pt-BR"), "%.1f %s/min", Math.abs(taxa), unidade);

        if (Math.abs(taxa) < limiarEstavel || r2 < R2_MINIMO) {
            return new Resultado("ESTAVEL", taxa, r2, null, null, 0, pontos.size(),
                    "Estável nas últimas " + pontos.size() + " leituras");
        }
        if (taxa < 0) {
            return new Resultado("DESCENDO", taxa, r2, null, null, -5, pontos.size(),
                    "Caindo " + taxaTxt + ": situação melhorando");
        }

        Integer minutos = null;
        if (proximoLimite != null && proximoLimite > valorAtual) {
            minutos = (int) Math.ceil((proximoLimite - valorAtual) / taxa);
        }
        int ajuste = minutos == null ? 3 : minutos <= 15 ? 10 : minutos <= 60 ? 6 : 3;
        String texto = minutos == null
                ? "Subindo " + taxaTxt
                : "Subindo " + taxaTxt + ": deve atingir nível " + proximoNivel + " em ~" + minutos + " min";
        return new Resultado("SUBINDO", taxa, r2, minutos, minutos == null ? null : proximoNivel,
                ajuste, pontos.size(), texto);
    }

    private static double arred(double v, int casas) {
        double f = Math.pow(10, casas);
        return Math.round(v * f) / f;
    }
}
