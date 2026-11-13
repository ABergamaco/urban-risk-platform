import { Evento } from "../interfaces/evento";

/** Centro aproximado de São Paulo, para abrir o mapa. */
export const CENTRO_SP = { latitude: -23.56, longitude: -46.62 };

/**
 * Eventos de sensor e base pública usam o centro da região, então vários
 * ficariam no MESMO ponto. Aqui afastamos um pouco cada tipo/origem
 * para todos aparecerem no mapa.
 */
export function posicaoNoMapa(evento: Evento): { latitude: number; longitude: number } {
  const noCentro =
    Math.abs(evento.latitude - evento.regiao.latitude) < 0.0005 &&
    Math.abs(evento.longitude - evento.regiao.longitude) < 0.0005;
  if (!noCentro) return { latitude: evento.latitude, longitude: evento.longitude };

  const desvioTipo = { ALAGAMENTO: 0, ILHA_DE_CALOR: 0.005, INTERRUPCAO_SERVICO: -0.005 }[evento.tipo];
  const desvioOrigem = { SENSOR: 0, BASE_PUBLICA: 0.004, COMUNIDADE: -0.004 }[evento.origem];
  return { latitude: evento.latitude + desvioOrigem, longitude: evento.longitude + desvioTipo };
}

/** Raio do marcador conforme a gravidade. */
export function raioMarcador(evento: Evento): number {
  return { BAIXA: 9, MODERADA: 11, ALTA: 13, CRITICA: 16 }[evento.severidade];
}

/** Retângulo que contém todas as regiões (para o mapa abrir mostrando a cidade inteira). */
export function limitesRegioes(pontos: { latitude: number; longitude: number }[]) {
  if (pontos.length === 0) {
    return { minLat: CENTRO_SP.latitude - 0.1, maxLat: CENTRO_SP.latitude + 0.1, minLng: CENTRO_SP.longitude - 0.1, maxLng: CENTRO_SP.longitude + 0.1 };
  }
  const lats = pontos.map((p) => p.latitude);
  const lngs = pontos.map((p) => p.longitude);
  return { minLat: Math.min(...lats), maxLat: Math.max(...lats), minLng: Math.min(...lngs), maxLng: Math.max(...lngs) };
}
