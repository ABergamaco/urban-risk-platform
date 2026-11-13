/**
 * Cores e tamanhos usados em todo o app.
 *
 * ACESSIBILIDADE: as combinações de cor de fundo + texto foram escolhidas com
 * contraste mínimo de 4,5:1 (WCAG AA). E a cor NUNCA aparece sozinha:
 * todo nível de alerta tem também ícone e texto ("ALERTA VERMELHO").
 */
export const cores = {
  primaria: "#0B3954",
  primariaClara: "#E6F0F5",
  fundo: "#F4F6F8",
  superficie: "#FFFFFF",
  texto: "#1A1A1A",
  textoSecundario: "#4A4A4A",
  borda: "#D0D7DE",
  sucesso: "#1B5E20",
  erro: "#B71C1C",
  aviso: "#7A4F00",
  avisoFundo: "#FFF4D6",
};

/** Fundo e texto de cada nível de alerta. */
export const coresNivel: Record<string, { fundo: string; texto: string }> = {
  VERMELHO: { fundo: "#B71C1C", texto: "#FFFFFF" },
  LARANJA: { fundo: "#BF360C", texto: "#FFFFFF" },
  AMARELO: { fundo: "#F9A825", texto: "#1A1A1A" },
  INFORMATIVO: { fundo: "#455A64", texto: "#FFFFFF" },
  NORMAL: { fundo: "#1B5E20", texto: "#FFFFFF" },
  ENCERRADO: { fundo: "#616161", texto: "#FFFFFF" },
};

/** Tamanho mínimo de área de toque recomendado (48 x 48). */
export const ALTURA_TOQUE = 48;

/** Largura máxima do conteúdo: em telas largas (computador) fica centralizado. */
export const LARGURA_MAXIMA = 960;

export const fonte = {
  pequena: 14,
  normal: 16,
  media: 18,
  grande: 22,
  titulo: 26,
};
