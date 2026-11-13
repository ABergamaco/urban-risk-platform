package com.fiap.ec.urban_risk.service;

/**
 * CalculoRisco: todas as regras numéricas da plataforma em um só lugar.
 *
 * Classe Java pura (sem Spring), para ser fácil de ler, explicar e testar.
 * Os testes estão em CalculoRiscoTest.
 *
 * ------------------------------------------------------------------
 * 1) CONFIANÇA (0 a 99%) - "o quanto podemos acreditar neste dado?"
 *
 *    confiança = base da origem
 *              + 10 por confirmação de morador
 *              - 15 por contestação de morador
 *              + 15 por outra fonte que confirma o mesmo risco na mesma região
 *              + 40 se um agente local validou
 *              - 25 se o dado está desatualizado (sensor parou de enviar)
 *
 *    Base: BASE_PUBLICA 85, SENSOR 80, COMUNIDADE 35 (ver enum Origem).
 *
 * 2) PRIORIDADE (0 a 100) - "qual alerta mostrar primeiro?"
 *
 *    prioridade = gravidade  (até 50 pontos: peso 1..4 / 4 * 50)
 *               + confiança  (até 35 pontos: confiança * 0,35)
 *               + recência   (até 15 pontos: cai até zero em 6 horas)
 *
 * 3) NÍVEL DO ALERTA, a partir da prioridade:
 *    >= 75 VERMELHO | >= 55 LARANJA | >= 35 AMARELO | abaixo INFORMATIVO
 * ------------------------------------------------------------------
 */
public final class CalculoRisco {

    public static final int CONFIANCA_MIN = 5;
    public static final int CONFIANCA_MAX = 99;
    public static final int CONFIANCA_MEDIA = 50;
    public static final int CONFIANCA_ALTA = 75;
    public static final double JANELA_RECENCIA_MIN = 360.0; // 6 horas

    private CalculoRisco() {}

    // ======================== CONFIANÇA ========================

    public static int confianca(int base, int confirmacoes, int contestacoes,
                                int fontesCorroborando, boolean validadoPorAgente,
                                boolean desatualizado) {
        int valor = base
                + 10 * confirmacoes
                - 15 * contestacoes
                + 15 * fontesCorroborando
                + (validadoPorAgente ? 40 : 0)
                - (desatualizado ? 25 : 0);
        return Math.max(CONFIANCA_MIN, Math.min(CONFIANCA_MAX, valor));
    }

    public static String nivelConfianca(int confianca) {
        if (confianca >= CONFIANCA_ALTA) return "ALTA";
        if (confianca >= CONFIANCA_MEDIA) return "MEDIA";
        return "BAIXA";
    }

    // ======================== PRIORIDADE ========================

    public static double prioridade(int pesoSeveridade, int confianca, long minutosDesdeEscalada) {
        double gravidade = (pesoSeveridade / 4.0) * 50.0;
        double conf = confianca * 0.35;
        double minutos = Math.max(0, Math.min(minutosDesdeEscalada, JANELA_RECENCIA_MIN));
        double recencia = 15.0 * (1.0 - minutos / JANELA_RECENCIA_MIN);
        double total = gravidade + conf + recencia;
        return Math.round(total * 10.0) / 10.0; // 1 casa decimal
    }

    public static String nivelAlerta(double prioridade) {
        if (prioridade >= 75) return "VERMELHO";
        if (prioridade >= 55) return "LARANJA";
        if (prioridade >= 35) return "AMARELO";
        return "INFORMATIVO";
    }

    // ============ REGRAS: leitura -> severidade (0 = normal) ============

    /** Nível da água na rua/córrego, em centímetros. */
    public static int severidadeNivelAgua(double cm) {
        if (cm >= 80) return 4;
        if (cm >= 50) return 3;
        if (cm >= 30) return 2;
        if (cm >= 15) return 1;
        return 0;
    }

    /** Chuva na última hora, em milímetros (dado da base pública). */
    public static int severidadePrecipitacao(double mm) {
        if (mm >= 50) return 4;
        if (mm >= 25) return 3;
        if (mm >= 10) return 2;
        if (mm >= 5) return 1;
        return 0;
    }

    /** Temperatura do ar, em °C. */
    public static int severidadeTemperatura(double celsius) {
        if (celsius >= 38) return 4;
        if (celsius >= 35) return 3;
        if (celsius >= 32) return 2;
        if (celsius >= 30) return 1;
        return 0;
    }

    /** Fornecimento de energia: 1 = normal, 0 = sem energia. */
    public static int severidadeEnergia(double status) {
        return status < 0.5 ? 3 : 0;
    }

    /** Limite usado nas mensagens, para o usuário entender o porquê do alerta. */
    public static String limiteTexto(String grandeza, int peso) {
        return switch (grandeza) {
            case "NIVEL_AGUA" -> new String[]{"", "15 cm", "30 cm", "50 cm", "80 cm"}[peso];
            case "PRECIPITACAO" -> new String[]{"", "5 mm/h", "10 mm/h", "25 mm/h", "50 mm/h"}[peso];
            case "TEMPERATURA" -> new String[]{"", "30 °C", "32 °C", "35 °C", "38 °C"}[peso];
            default -> "falha detectada";
        };
    }
}
