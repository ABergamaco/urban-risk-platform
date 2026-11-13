import { StyleSheet } from "react-native";
import { cores, fonte, LARGURA_MAXIMA } from "./theme";

export const detalheStyles = StyleSheet.create({
  container: { maxWidth: LARGURA_MAXIMA, width: "100%", alignSelf: "center", padding: 16, paddingBottom: 40, backgroundColor: cores.fundo, gap: 14 },
  topo: { borderRadius: 16, padding: 18, gap: 8 },
  topoTitulo: { fontSize: fonte.titulo, fontWeight: "bold" },
  topoInfo: { fontSize: fonte.normal },
  cartao: { backgroundColor: cores.superficie, borderRadius: 14, padding: 16, gap: 8 },
  cartaoTitulo: { fontSize: fonte.media, fontWeight: "bold", color: cores.texto, marginBottom: 2 },
  texto: { fontSize: fonte.normal, color: cores.texto, lineHeight: 24 },
  textoSec: { fontSize: fonte.pequena, color: cores.textoSecundario, lineHeight: 20 },
  grade: { flexDirection: "row", flexWrap: "wrap", gap: 10 },
  item: { flexBasis: "47%", flexGrow: 1, backgroundColor: cores.fundo, borderRadius: 10, padding: 10 },
  itemRotulo: { fontSize: 13, color: cores.textoSecundario, fontWeight: "600" },
  itemValor: { fontSize: fonte.normal, color: cores.texto, fontWeight: "bold" },
  calculoLinha: { flexDirection: "row", justifyContent: "space-between", paddingVertical: 4, borderBottomWidth: 1, borderBottomColor: "#EEE" },
  calculoTexto: { fontSize: fonte.pequena, color: cores.texto },
  calculoValor: { fontSize: fonte.pequena, color: cores.texto, fontWeight: "bold" },
  grafico: { flexDirection: "row", alignItems: "flex-end", height: 110, gap: 3, marginTop: 6 },
  barra: { flex: 1, borderTopLeftRadius: 3, borderTopRightRadius: 3, minHeight: 3 },
  graficoLegenda: { flexDirection: "row", justifyContent: "space-between" },
  acoes: { gap: 10 },
  tendenciaBox: { backgroundColor: cores.fundo, borderRadius: 10, padding: 12, gap: 4, marginBottom: 6 },
  tendenciaTitulo: { fontSize: fonte.normal, fontWeight: "bold" },
});
