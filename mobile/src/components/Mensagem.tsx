import React from "react";
import { Text, View } from "react-native";
import { Ionicons } from "@expo/vector-icons";

import { estadoStyles as styles } from "../styles/componentes.styles";
import { cores } from "../styles/theme";

type Props = { tipo: "erro" | "sucesso"; texto: string };

/**
 * Mensagem de retorno dentro da tela.
 * Usamos isso em vez de Alert.alert porque o Alert não funciona no navegador (Expo Web).
 */
export default function Mensagem({ tipo, texto }: Props) {
  const erro = tipo === "erro";
  return (
    <View
      style={[styles.mensagem, erro ? styles.mensagemErro : styles.mensagemSucesso]}
      accessibilityRole="alert"
      accessibilityLiveRegion="polite"
    >
      <Ionicons name={erro ? "alert-circle" : "checkmark-circle"} size={20} color={erro ? cores.erro : cores.sucesso} />
      <Text style={[styles.mensagemTexto, { color: erro ? cores.erro : cores.sucesso }]}>{texto}</Text>
    </View>
  );
}
