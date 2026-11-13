import React from "react";
import { Text, View } from "react-native";
import { Ionicons } from "@expo/vector-icons";

import { badgeStyles as styles } from "../styles/componentes.styles";
import { coresNivel } from "../styles/theme";
import { iconeNivel, rotuloNivel } from "../utils/formatadores";

type Props = { nivel: string; grande?: boolean };

/** Nível do alerta com COR + ÍCONE + TEXTO (nunca só a cor). */
export default function BadgeNivel({ nivel, grande }: Props) {
  const cor = coresNivel[nivel] ?? coresNivel.INFORMATIVO;
  const rotulo = rotuloNivel[nivel] ?? nivel;
  return (
    <View
      style={[styles.badge, { backgroundColor: cor.fundo }]}
      accessible
      accessibilityLabel={rotulo}
    >
      <Ionicons name={iconeNivel[nivel] ?? "information-circle"} size={grande ? 20 : 16} color={cor.texto} />
      <Text style={[styles.texto, grande && styles.textoGrande, { color: cor.texto }]}>{rotulo}</Text>
    </View>
  );
}
