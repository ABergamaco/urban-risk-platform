import { Evento } from "./evento";
import { NivelAlerta } from "../types/nivelAlerta";

export interface RegiaoResumo {
  id: number;
  nome: string;
  zona: string;
  latitude: number;
  longitude: number;
  alertasAtivos: number;
  nivelRisco: NivelAlerta;
  temperatura: number | null;
  precipitacao: number | null;
  nivelAgua: number | null;
  atualizadoEm: string | null;
}

export type StatusFonte = "ONLINE" | "ATRASADA" | "OFFLINE" | "SEM_DADOS" | "DESATIVADA";

export interface FonteStatus {
  origem: "SENSOR" | "BASE_PUBLICA" | "COMUNIDADE";
  nome: string;
  status: StatusFonte;
  ultimaAtualizacao: string | null;
  detalhe: string;
  confiancaBase: number;
}

export interface Painel {
  geradoEm: string;
  alertasAtivos: number;
  alertasVermelhos: number;
  porTipo: Record<string, number>;
  porNivel: Record<string, number>;
  alertaPrincipal: Evento | null;
  regioes: RegiaoResumo[];
  fontes: FonteStatus[];
}
