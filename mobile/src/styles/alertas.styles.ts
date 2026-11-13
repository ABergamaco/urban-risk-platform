import { StyleSheet } from "react-native";
import { cores, fonte, LARGURA_MAXIMA } from "./theme";

export const alertasStyles = StyleSheet.create({
  container: { flex: 1, backgroundColor: cores.fundo },
  filtros: { padding: 16, paddingBottom: 8, gap: 10, backgroundColor: cores.fundo },
  resumo: { fontSize: fonte.pequena, color: cores.textoSecundario },
  lista: { maxWidth: LARGURA_MAXIMA, width: "100%", alignSelf: "center", paddingHorizontal: 16, paddingBottom: 24 },
  acoes: { flexDirection: "row", gap: 8, marginTop: 8, flexWrap: "wrap" },
});
