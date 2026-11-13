import { StyleSheet } from "react-native";
import { cores, fonte, LARGURA_MAXIMA } from "./theme";

export const painelStyles = StyleSheet.create({
  container: { maxWidth: LARGURA_MAXIMA, width: "100%", alignSelf: "center", padding: 16, paddingBottom: 32, backgroundColor: cores.fundo, gap: 16 },
  cabecalho: { gap: 2 },
  ola: { fontSize: fonte.grande, fontWeight: "bold", color: cores.texto },
  atualizado: { fontSize: fonte.pequena, color: cores.textoSecundario },
  secaoTitulo: { fontSize: fonte.media, fontWeight: "bold", color: cores.texto, marginBottom: 8 },

  principal: { borderRadius: 16, padding: 18, gap: 8 },
  principalRotulo: { fontSize: fonte.pequena, fontWeight: "bold", textTransform: "uppercase" },
  principalTitulo: { fontSize: fonte.grande, fontWeight: "bold" },
  principalInfo: { fontSize: fonte.normal },
  semAlertas: { backgroundColor: "#E8F5E9", borderRadius: 16, padding: 18, flexDirection: "row", gap: 12, alignItems: "center" },
  semAlertasTexto: { fontSize: fonte.normal, color: cores.sucesso, fontWeight: "bold", flex: 1 },

  linhaCards: { flexDirection: "row", gap: 10 },
  cardTipo: {
    flex: 1, backgroundColor: cores.superficie, borderRadius: 14, padding: 14, alignItems: "center", gap: 4,
    minHeight: 110, justifyContent: "center",
  },
  cardTipoNumero: { fontSize: 28, fontWeight: "bold", color: cores.texto },
  cardTipoRotulo: { fontSize: fonte.pequena, color: cores.textoSecundario, textAlign: "center", fontWeight: "600" },

  niveis: { flexDirection: "row", flexWrap: "wrap", gap: 8 },
  nivelChip: { flexDirection: "row", alignItems: "center", gap: 6, paddingHorizontal: 12, paddingVertical: 8, borderRadius: 20 },
  nivelTexto: { fontSize: fonte.pequena, fontWeight: "bold" },

  regiao: {
    backgroundColor: cores.superficie, borderRadius: 14, padding: 14, marginBottom: 10, gap: 8,
    borderLeftWidth: 8,
  },
  regiaoTopo: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", gap: 8, flexWrap: "wrap" },
  regiaoNome: { fontSize: fonte.media, fontWeight: "bold", color: cores.texto },
  regiaoZona: { fontSize: fonte.pequena, color: cores.textoSecundario },
  medidas: { flexDirection: "row", flexWrap: "wrap", gap: 14 },
  medida: { flexDirection: "row", alignItems: "center", gap: 4 },
  medidaTexto: { fontSize: fonte.pequena, color: cores.texto, fontWeight: "600" },

  fonte: { backgroundColor: cores.superficie, borderRadius: 12, padding: 12, marginBottom: 8, flexDirection: "row", gap: 12, alignItems: "center" },
  fonteTextos: { flex: 1, gap: 2 },
  fonteNome: { fontSize: fonte.normal, fontWeight: "bold", color: cores.texto },
  fonteDetalhe: { fontSize: 13, color: cores.textoSecundario },
  fonteStatus: { fontSize: 13, fontWeight: "bold" },
});
