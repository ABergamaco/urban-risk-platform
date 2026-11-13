import api from "./api";
import { Evento } from "../interfaces/evento";
import { TipoRisco } from "../types/tipoRisco";

export type FiltroAlertas = {
  tipo?: TipoRisco;
  regiaoId?: number;
  confiancaMinima?: number;
  limite?: number;
};

/** Alertas ativos, JÁ ORDENADOS POR PRIORIDADE pelo backend. */
export async function listarAlertas(filtro: FiltroAlertas = {}): Promise<Evento[]> {
  const response = await api.get<Evento[]>("/alertas", { params: filtro });
  return response.data;
}

export type NovosAlertas = {
  servidorEm: string;
  alertas: Evento[];
};

/** Usado pelo monitor de notificações. Sem "desde" -> só devolve o horário do servidor. */
export async function buscarNovosAlertas(desde?: string): Promise<NovosAlertas> {
  const response = await api.get<NovosAlertas>("/alertas/novos", {
    params: desde ? { desde } : {},
  });
  return response.data;
}
