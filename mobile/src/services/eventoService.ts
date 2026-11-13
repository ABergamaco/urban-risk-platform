import api from "./api";
import { Evento } from "../interfaces/evento";
import { Leitura } from "../interfaces/leitura";
import { TipoRisco } from "../types/tipoRisco";

export async function buscarEvento(id: number): Promise<Evento> {
  const response = await api.get<Evento>(`/eventos/${id}`);
  return response.data;
}

export async function buscarLeiturasDoEvento(id: number, limite = 20): Promise<Leitura[]> {
  const response = await api.get<Leitura[]>(`/eventos/${id}/leituras`, { params: { limite } });
  return response.data;
}

/** Relatos da comunidade que aguardam um agente local. */
export async function listarPendentes(): Promise<Evento[]> {
  const response = await api.get<Evento[]>("/eventos/pendentes");
  return response.data;
}

/** Morador: confirma/contesta. Agente: CONFIRMAR valida, CONTESTAR descarta. */
export async function validarEvento(
  eventoId: number,
  usuarioId: number,
  tipo: "CONFIRMAR" | "CONTESTAR"
): Promise<Evento> {
  const response = await api.post<Evento>(`/eventos/${eventoId}/validacoes`, { usuarioId, tipo });
  return response.data;
}

/** Somente agente. */
export async function resolverEvento(eventoId: number, usuarioId: number, observacao?: string): Promise<Evento> {
  const response = await api.put<Evento>(`/eventos/${eventoId}/resolver`, { usuarioId, observacao });
  return response.data;
}

/** Demonstração: força um cenário crítico nos sensores simulados. */
export async function simularEvento(regiaoId: number, tipo: TipoRisco): Promise<Evento> {
  const response = await api.post<Evento>("/simulador/eventos", { regiaoId, tipo });
  return response.data;
}
