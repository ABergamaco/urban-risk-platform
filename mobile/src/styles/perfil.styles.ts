import { StyleSheet } from "react-native";
import { cores, fonte, LARGURA_MAXIMA } from "./theme";

export const perfilStyles = StyleSheet.create({
  container: { maxWidth: LARGURA_MAXIMA, width: "100%", alignSelf: "center", padding: 16, paddingBottom: 40, backgroundColor: cores.fundo, gap: 14 },
  cartao: { backgroundColor: cores.superficie, borderRadius: 16, padding: 18, gap: 10 },
  linha: { flexDirection: "row", alignItems: "center", gap: 12 },
  nome: { fontSize: fonte.grande, fontWeight: "bold", color: cores.texto },
  info: { fontSize: fonte.normal, color: cores.textoSecundario },
  titulo: { fontSize: fonte.media, fontWeight: "bold", color: cores.texto },
  texto: { fontSize: fonte.pequena, color: cores.texto, lineHeight: 21 },
  rotulo: { fontSize: fonte.pequena, fontWeight: "bold", color: cores.texto, marginTop: 4 },
});
