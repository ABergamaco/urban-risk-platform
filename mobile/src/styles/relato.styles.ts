import { StyleSheet } from "react-native";
import { cores, fonte } from "./theme";

export const relatoStyles = StyleSheet.create({
  container: { padding: 16, paddingBottom: 40, backgroundColor: cores.fundo },
  cartao: { backgroundColor: cores.superficie, borderRadius: 16, padding: 18, gap: 4, maxWidth: 640, width: "100%", alignSelf: "center" },
  titulo: { fontSize: fonte.grande, fontWeight: "bold", color: cores.texto },
  subtitulo: { fontSize: fonte.normal, color: cores.textoSecundario, marginBottom: 12 },
  secao: { fontSize: fonte.normal, fontWeight: "bold", color: cores.texto, marginTop: 12, marginBottom: 8 },
  tipos: { flexDirection: "row", gap: 10, flexWrap: "wrap" },
  tipo: {
    flexGrow: 1, flexBasis: 140, minHeight: 90, borderRadius: 14, borderWidth: 2, borderColor: cores.borda,
    alignItems: "center", justifyContent: "center", gap: 6, padding: 10, backgroundColor: cores.superficie,
  },
  tipoAtivo: { borderColor: cores.primaria, backgroundColor: cores.primaria },
  tipoTexto: { fontSize: fonte.normal, fontWeight: "bold", color: cores.texto, textAlign: "center" },
  tipoTextoAtivo: { color: "#FFFFFF" },
  contador: { fontSize: 13, color: cores.textoSecundario, textAlign: "right", marginTop: -8, marginBottom: 8 },
  lgpd: { flexDirection: "row", gap: 8, backgroundColor: cores.primariaClara, padding: 12, borderRadius: 10, marginVertical: 12 },
  lgpdTexto: { flex: 1, fontSize: fonte.pequena, color: cores.primaria },
  sucesso: { gap: 12 },
});
