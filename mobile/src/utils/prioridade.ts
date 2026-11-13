import { Evento } from "../interfaces/evento";
import { lerData } from "./formatadores";

const PESO: Record<string, number> = { BAIXA: 1, MODERADA: 2, ALTA: 3, CRITICA: 4 };

export type ParcelasPrioridade = {
  gravidade: number;
  confianca: number;
  recencia: number;
  tendencia: number;
};

/**
 * Mesma fórmula do backend (CalculoRisco.prioridade), usada só para MOSTRAR
 * ao usuário de onde vem cada ponto da prioridade. O valor oficial vem da API.
 */
export function parcelasPrioridade(
  e: Pick<Evento, "severidade" | "confianca" | "escaladoEm" | "ajusteTendencia">,
  agora: number = Date.now()
): ParcelasPrioridade {
  const minutos = Math.max(0, (agora - lerData(e.escaladoEm).getTime()) / 60000);
  return {
    gravidade: (PESO[e.severidade] / 4) * 50,
    confianca: e.confianca * 0.35,
    recencia: 15 * (1 - Math.min(minutos, 360) / 360),
    tendencia: e.ajusteTendencia ?? 0,
  };
}

export function somaPrioridade(p: ParcelasPrioridade): number {
  return Math.max(0, Math.min(100, p.gravidade + p.confianca + p.recencia + p.tendencia));
}
