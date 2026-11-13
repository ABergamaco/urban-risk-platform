import React from "react";
import { ActivityIndicator, Pressable, Text } from "react-native";
import { Ionicons } from "@expo/vector-icons";

import { botaoStyles as styles } from "../styles/componentes.styles";
import { cores } from "../styles/theme";

type BotaoProps = {
  titulo: string;
  onPress: () => void;
  variante?: "primario" | "secundario" | "perigo" | "sucesso";
  icone?: keyof typeof Ionicons.glyphMap;
  carregando?: boolean;
  desabilitado?: boolean;
  dica?: string; // lida pelo leitor de tela (accessibilityHint)
};

/** Botão acessível: área de toque >= 48 px, rótulo e dica para leitor de tela. */
export default function Botao({
  titulo, onPress, variante = "primario", icone, carregando, desabilitado, dica,
}: BotaoProps) {
  const inativo = desabilitado || carregando;
  const corTexto = variante === "secundario" ? cores.primaria : "#FFFFFF";
  return (
    <Pressable
      onPress={onPress}
      disabled={inativo}
      accessibilityRole="button"
      accessibilityLabel={titulo}
      accessibilityHint={dica}
      accessibilityState={{ disabled: !!inativo, busy: !!carregando }}
      style={({ pressed }) => [
        styles.base,
        styles[variante],
        inativo && styles.desabilitado,
        pressed && { opacity: 0.8 },
      ]}
    >
      {carregando ? (
        <ActivityIndicator color={corTexto} />
      ) : (
        icone && <Ionicons name={icone} size={20} color={corTexto} />
      )}
      <Text style={[styles.texto, variante === "secundario" && styles.textoSecundario]}>{titulo}</Text>
    </Pressable>
  );
}
