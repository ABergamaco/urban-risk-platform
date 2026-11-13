/**
 * Estilos dos componentes reutilizáveis (pasta src/components).
 * Regra mantida das aulas: arquivos de estilo só usam StyleSheet, sem lógica.
 */
import { StyleSheet } from "react-native";
import { cores, fonte, ALTURA_TOQUE } from "./theme";

export const botaoStyles = StyleSheet.create({
  base: {
    minHeight: ALTURA_TOQUE,
    borderRadius: 10,
    paddingHorizontal: 18,
    paddingVertical: 12,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
  },
  primario: { backgroundColor: cores.primaria },
  secundario: { backgroundColor: cores.superficie, borderWidth: 2, borderColor: cores.primaria },
  perigo: { backgroundColor: cores.erro },
  sucesso: { backgroundColor: cores.sucesso },
  desabilitado: { opacity: 0.5 },
  texto: { fontSize: fonte.normal, fontWeight: "bold", color: "#FFFFFF" },
  textoSecundario: { color: cores.primaria },
});

export const badgeStyles = StyleSheet.create({
  badge: {
    flexDirection: "row",
    alignItems: "center",
    alignSelf: "flex-start",
    gap: 6,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
  },
  texto: { fontWeight: "bold", fontSize: fonte.pequena, textTransform: "uppercase" },
  textoGrande: { fontSize: fonte.normal },
});

export const confiancaStyles = StyleSheet.create({
  container: { marginTop: 8 },
  linha: { flexDirection: "row", justifyContent: "space-between", marginBottom: 4 },
  rotulo: { fontSize: fonte.pequena, color: cores.textoSecundario, fontWeight: "600" },
  valor: { fontSize: fonte.pequena, color: cores.texto, fontWeight: "bold" },
  trilho: { height: 8, backgroundColor: "#E0E0E0", borderRadius: 4, overflow: "hidden" },
  preenchimento: { height: 8, borderRadius: 4 },
});

export const origemStyles = StyleSheet.create({
  chip: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    backgroundColor: cores.primariaClara,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 8,
    alignSelf: "flex-start",
    maxWidth: "100%",
  },
  texto: { fontSize: fonte.pequena, color: cores.primaria, fontWeight: "600", flexShrink: 1 },
});

export const alertaCardStyles = StyleSheet.create({
  card: {
    backgroundColor: cores.superficie,
    borderRadius: 14,
    marginBottom: 12,
    flexDirection: "row",
    overflow: "hidden",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.12,
    shadowRadius: 6,
    elevation: 3,
  },
  faixa: { width: 8 },
  conteudo: { flex: 1, padding: 14, gap: 6 },
  topo: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", gap: 8 },
  prioridade: { fontSize: fonte.pequena, color: cores.textoSecundario, fontWeight: "600" },
  tituloLinha: { flexDirection: "row", alignItems: "center", gap: 8 },
  titulo: { fontSize: fonte.media, fontWeight: "bold", color: cores.texto, flex: 1 },
  info: { fontSize: fonte.pequena, color: cores.textoSecundario },
  selos: { flexDirection: "row", flexWrap: "wrap", gap: 6 },
  seloOk: {
    flexDirection: "row", alignItems: "center", gap: 4,
    backgroundColor: "#E8F5E9", paddingHorizontal: 8, paddingVertical: 3, borderRadius: 6,
  },
  seloOkTexto: { fontSize: 13, color: cores.sucesso, fontWeight: "bold" },
  seloAviso: {
    flexDirection: "row", alignItems: "center", gap: 4,
    backgroundColor: cores.avisoFundo, paddingHorizontal: 8, paddingVertical: 3, borderRadius: 6,
  },
  seloAvisoTexto: { fontSize: 13, color: cores.aviso, fontWeight: "bold" },
});

export const bannerStyles = StyleSheet.create({
  banner: {
    width: "100%",
    maxWidth: 960,
    borderRadius: 14,
    padding: 14,
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 10,
    elevation: 10,
  },
  textos: { flex: 1 },
  rotulo: { fontSize: 13, fontWeight: "bold", textTransform: "uppercase" },
  titulo: { fontSize: fonte.normal, fontWeight: "bold" },
  sub: { fontSize: fonte.pequena },
  fechar: { minWidth: 44, minHeight: 44, alignItems: "center", justifyContent: "center" },
});

export const seletorStyles = StyleSheet.create({
  container: { flexDirection: "row", flexWrap: "wrap", gap: 8 },
  opcao: {
    minHeight: 44,
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 22,
    borderWidth: 2,
    borderColor: cores.borda,
    backgroundColor: cores.superficie,
  },
  opcaoAtiva: { borderColor: cores.primaria, backgroundColor: cores.primaria },
  texto: { fontSize: fonte.pequena, fontWeight: "600", color: cores.texto },
  textoAtivo: { color: "#FFFFFF" },
});

export const campoStyles = StyleSheet.create({
  container: { marginBottom: 14 },
  rotulo: { fontSize: fonte.normal, fontWeight: "bold", color: cores.texto, marginBottom: 6 },
  input: {
    minHeight: 48,
    borderWidth: 2,
    borderColor: cores.borda,
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: fonte.normal,
    backgroundColor: cores.superficie,
    color: cores.texto,
  },
  multilinha: { minHeight: 110, textAlignVertical: "top" },
  ajuda: { fontSize: 13, color: cores.textoSecundario, marginTop: 4 },
});

export const estadoStyles = StyleSheet.create({
  container: { flex: 1, alignItems: "center", justifyContent: "center", padding: 24, gap: 12 },
  texto: { fontSize: fonte.normal, color: cores.textoSecundario, textAlign: "center" },
  mensagem: { borderRadius: 10, padding: 12, flexDirection: "row", gap: 8, alignItems: "flex-start" },
  mensagemErro: { backgroundColor: "#FDECEA" },
  mensagemSucesso: { backgroundColor: "#E8F5E9" },
  mensagemTexto: { flex: 1, fontSize: fonte.pequena, fontWeight: "600" },
});
