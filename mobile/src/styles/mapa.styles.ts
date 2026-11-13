import { StyleSheet } from "react-native";
import { cores, fonte } from "./theme";

export const mapaStyles = StyleSheet.create({
  container: { flex: 1, backgroundColor: cores.fundo },
  mapa: { flex: 1 },
  filtros: { padding: 12, backgroundColor: cores.fundo, gap: 6 },
  contagem: { fontSize: fonte.pequena, color: cores.textoSecundario },
  legenda: {
    position: "absolute", left: 12, bottom: 12, zIndex: 1000,
    backgroundColor: "rgba(255,255,255,0.95)", borderRadius: 12, padding: 10, gap: 4,
    shadowColor: "#000", shadowOpacity: 0.2, shadowRadius: 6, elevation: 4,
  },
  legendaTitulo: { fontSize: 13, fontWeight: "bold", color: cores.texto },
  legendaLinha: { flexDirection: "row", alignItems: "center", gap: 6 },
  legendaBola: { width: 14, height: 14, borderRadius: 7, borderWidth: 2, borderColor: "#FFFFFF" },
  legendaTexto: { fontSize: 13, color: cores.texto },
  callout: { maxWidth: 240, padding: 4, gap: 2 },
  calloutTitulo: { fontWeight: "bold", fontSize: fonte.pequena, color: cores.texto },
  calloutTexto: { fontSize: 13, color: cores.textoSecundario },
  calloutLink: { fontSize: 13, color: cores.primaria, fontWeight: "bold", marginTop: 4 },
});
