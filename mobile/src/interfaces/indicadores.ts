/** Resposta de GET /indicadores (tempo de atualização e qualidade dos alertas). */
export interface Indicadores {
  geradoEm: string;
  tempoAtualizacao: {
    fontes: {
      origem: "SENSOR" | "BASE_PUBLICA" | "COMUNIDADE";
      nome: string;
      intervaloSegundos: number; // 0 = sob demanda
      idadeUltimoDadoSegundos: number | null;
      status: string;
    }[];
    processamentoMedioMs: number;
    leiturasProcessadas: number;
    cicloNotificacaoAppSegundos: number;
    tempoMaximoAteAppSegundos: number;
  };
  qualidade: {
    alertasAtivos: number;
    confiancaMedia: number;
    percentualConfiancaAlta: number;
    percentualCorroborados: number;
    validadosPorAgente: number;
    descartadosFalsoAlarme: number;
    taxaFalsoAlarme: number;
    relatosAgrupados: number;
    alertasComTendencia: number;
    alertasPreditivos: number;
    tempoMedioValidacaoMinutos: number | null;
  };
  uso: { eventos24h: number; relatos24h: number; totalRelatos: number };
}
