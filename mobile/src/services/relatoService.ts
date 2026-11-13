import api from "./api";
import { Evento } from "../interfaces/evento";
import { TipoRisco } from "../types/tipoRisco";
import { Severidade } from "../types/severidade";

export type NovoRelato = {
  usuarioId: number;
  regiaoId: number;
  tipo: TipoRisco;
  descricao: string;
  severidade: Severidade;
};

/** Retorna o evento criado (ou o já existente ao qual o relato foi somado). */
export async function enviarRelato(relato: NovoRelato): Promise<Evento> {
  const response = await api.post<Evento>("/relatos", relato);
  return response.data;
}
