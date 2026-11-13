import { Regiao } from "./regiao";
import { TipoRisco } from "../types/tipoRisco";
import { Origem } from "../types/origem";
import { Severidade } from "../types/severidade";
import { NivelAlerta, NivelConfianca } from "../types/nivelAlerta";
import { StatusEvento } from "../types/statusEvento";

/** Evento = ocorrência de risco. Quando está ATIVO, o app mostra como alerta. */
export interface Evento {
  id: number;
  tipo: TipoRisco;
  tipoDescricao: string;
  regiao: Regiao;
  titulo: string;
  descricao: string;
  severidade: Severidade;

  // Origem e confiança do dado (requisito do trabalho)
  origem: Origem;
  origemDescricao: string;
  fonte: string;
  confianca: number; // 0 a 99
  nivelConfianca: NivelConfianca;

  // Prioridade calculada no backend
  prioridade: number; // 0 a 100
  nivelAlerta: NivelAlerta;

  status: StatusEvento;
  latitude: number;
  longitude: number;
  confirmacoes: number;
  contestacoes: number;
  fontesCorroborando: number;
  validadoPorAgente: boolean;
  desatualizado: boolean;
  criadoEm: string; // ISO vindo do backend (ex: "2026-11-12T10:30:00")
  atualizadoEm: string;
  escaladoEm: string;
  encerradoEm?: string | null;
  observacaoAgente?: string | null;

  // Análise de tendência (regressão linear no backend)
  tendencia?: "SUBINDO" | "ESTAVEL" | "DESCENDO" | "SEM_DADOS" | null;
  taxaVariacao?: number | null; // por minuto
  previsaoMinutos?: number | null; // minutos até o próximo nível
  previsaoTexto?: string | null;
  ajusteTendencia?: number | null; // pontos somados à prioridade (-5 a +10)
  alertaPreditivo?: boolean | null;
}
