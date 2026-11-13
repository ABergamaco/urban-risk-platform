import React from "react";
import { ActivityIndicator, Text, View } from "react-native";
import { Ionicons } from "@expo/vector-icons";

import { estadoStyles as styles } from "../styles/componentes.styles";
import { cores } from "../styles/theme";
import Botao from "./Botao";

type Props = {
  carregando?: boolean;
  erro?: string | null;
  vazio?: string | null;
  onTentarNovamente?: () => void;
};

/** Tela de carregando / erro / lista vazia, igual em todo o app. */
export default function EstadoTela({ carregando, erro, vazio, onTentarNovamente }: Props) {
  if (carregando) {
    return (
      <View style={styles.container} accessibilityLabel="Carregando">
        <ActivityIndicator size="large" color={cores.primaria} />
        <Text style={styles.texto}>Carregando...</Text>
      </View>
    );
  }
  if (erro) {
    return (
      <View style={styles.container}>
        <Ionicons name="cloud-offline" size={48} color={cores.erro} />
        <Text style={styles.texto} accessibilityRole="alert">{erro}</Text>
        {onTentarNovamente && <Botao titulo="Tentar novamente" icone="refresh" onPress={onTentarNovamente} />}
      </View>
    );
  }
  if (vazio) {
    return (
      <View style={styles.container}>
        <Ionicons name="checkmark-circle" size={48} color={cores.sucesso} />
        <Text style={styles.texto}>{vazio}</Text>
      </View>
    );
  }
  return null;
}
