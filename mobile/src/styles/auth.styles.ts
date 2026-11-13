import { StyleSheet } from "react-native";
import { cores, fonte } from "./theme";

export const inicioStyles = StyleSheet.create({
  container: { flexGrow: 1, backgroundColor: cores.primaria, padding: 24, justifyContent: "center" },
  topo: { alignItems: "center", marginBottom: 32, gap: 8 },
  titulo: { fontSize: 34, fontWeight: "bold", color: "#FFFFFF", textAlign: "center" },
  subtitulo: { fontSize: fonte.media, color: "#DDE9F0", textAlign: "center", lineHeight: 26 },
  cartao: { backgroundColor: cores.superficie, borderRadius: 18, padding: 20, gap: 12, maxWidth: 480, width: "100%", alignSelf: "center" },
  itens: { gap: 10, marginBottom: 6 },
  item: { flexDirection: "row", alignItems: "center", gap: 10 },
  itemTexto: { fontSize: fonte.normal, color: cores.texto, flex: 1 },
  status: { flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 6, marginTop: 6 },
  statusTexto: { fontSize: fonte.pequena, color: cores.textoSecundario },
  demo: { backgroundColor: cores.primariaClara, borderRadius: 10, padding: 12, marginTop: 4 },
  demoTitulo: { fontSize: fonte.pequena, fontWeight: "bold", color: cores.primaria, marginBottom: 2 },
  demoTexto: { fontSize: 13, color: cores.primaria },
});

export const formStyles = StyleSheet.create({
  container: { flexGrow: 1, backgroundColor: cores.fundo, padding: 20 },
  cartao: { backgroundColor: cores.superficie, borderRadius: 16, padding: 20, maxWidth: 520, width: "100%", alignSelf: "center" },
  titulo: { fontSize: fonte.grande, fontWeight: "bold", color: cores.texto, marginBottom: 4 },
  subtitulo: { fontSize: fonte.normal, color: cores.textoSecundario, marginBottom: 18 },
  secao: { fontSize: fonte.normal, fontWeight: "bold", color: cores.texto, marginBottom: 8, marginTop: 4 },
  espaco: { height: 14 },
  rodape: { marginTop: 16, gap: 10 },
  link: { fontSize: fonte.normal, color: cores.primaria, fontWeight: "bold", textAlign: "center", padding: 10 },
});
