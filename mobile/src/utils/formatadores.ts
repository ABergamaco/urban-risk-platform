import { TipoRisco } from "../types/tipoRisco";
import { Origem } from "../types/origem";
import { Severidade } from "../types/severidade";

/** Nome dos ícones do Ionicons (@expo/vector-icons, já vem com o Expo). */
export type NomeIcone =
  | "water" | "sunny" | "flash-off" | "hardware-chip" | "globe-outline" | "people"
  | "alert-circle" | "warning" | "information-circle" | "checkmark-circle" | "close-circle"
  | "shield-checkmark" | "time-outline" | "location" | "thermometer" | "rainy" | "speedometer";

export const rotuloTipo: Record<TipoRisco, string> = {
  ALAGAMENTO: "Alagamento",
  ILHA_DE_CALOR: "Ilha de calor",
  INTERRUPCAO_SERVICO: "Falta de serviço",
};

export const iconeTipo: Record<TipoRisco, NomeIcone> = {
  ALAGAMENTO: "water",
  ILHA_DE_CALOR: "sunny",
  INTERRUPCAO_SERVICO: "flash-off",
};

export const rotuloOrigem: Record<Origem, string> = {
  SENSOR: "Sensor",
  BASE_PUBLICA: "Base pública",
  COMUNIDADE: "Comunidade",
};

export const iconeOrigem: Record<Origem, NomeIcone> = {
  SENSOR: "hardware-chip",
  BASE_PUBLICA: "globe-outline",
  COMUNIDADE: "people",
};

export const rotuloSeveridade: Record<Severidade, string> = {
  BAIXA: "Baixa",
  MODERADA: "Moderada",
  ALTA: "Alta",
  CRITICA: "Crítica",
};

export const rotuloNivel: Record<string, string> = {
  VERMELHO: "Alerta vermelho",
  LARANJA: "Alerta laranja",
  AMARELO: "Atenção",
  INFORMATIVO: "Informativo",
  NORMAL: "Normal",
  ENCERRADO: "Encerrado",
};

export const iconeNivel: Record<string, NomeIcone> = {
  VERMELHO: "alert-circle",
  LARANJA: "warning",
  AMARELO: "warning",
  INFORMATIVO: "information-circle",
  NORMAL: "checkmark-circle",
  ENCERRADO: "close-circle",
};

/** Seta e cor da análise de tendência. */
export const tendenciaInfo: Record<string, { rotulo: string; icone: "trending-up" | "trending-down" | "remove" ; cor: string }> = {
  SUBINDO: { rotulo: "Piorando", icone: "trending-up", cor: "#B71C1C" },
  ESTAVEL: { rotulo: "Estável", icone: "remove", cor: "#455A64" },
  DESCENDO: { rotulo: "Melhorando", icone: "trending-down", cor: "#1B5E20" },
};

export const rotuloConfianca: Record<string, string> = {
  ALTA: "Confiança alta",
  MEDIA: "Confiança média",
  BAIXA: "Confiança baixa",
};

/**
 * O backend envia datas como "2026-11-12T10:30:00.123456789" (sem fuso).
 * Cortamos as frações além de milissegundos para todo motor JS conseguir ler.
 */
export function lerData(iso: string): Date {
  return new Date(iso.replace(/(\.\d{3})\d+/, "$1"));
}

/** "agora", "há 5 min", "há 2 h", "há 3 dias" */
export function tempoRelativo(iso: string | null | undefined): string {
  if (!iso) return "sem dados";
  const segundos = Math.max(0, Math.round((Date.now() - lerData(iso).getTime()) / 1000));
  if (segundos < 60) return "agora";
  const minutos = Math.floor(segundos / 60);
  if (minutos < 60) return `há ${minutos} min`;
  const horas = Math.floor(minutos / 60);
  if (horas < 24) return `há ${horas} h`;
  const dias = Math.floor(horas / 24);
  return `há ${dias} ${dias === 1 ? "dia" : "dias"}`;
}

export function dataHora(iso: string | null | undefined): string {
  if (!iso) return "-";
  const d = lerData(iso);
  return `${d.toLocaleDateString("pt-BR")} às ${d.toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" })}`;
}

export function numero(valor: number | null | undefined, casas = 1): string {
  if (valor === null || valor === undefined) return "-";
  return valor.toLocaleString("pt-BR", { minimumFractionDigits: casas, maximumFractionDigits: casas });
}
