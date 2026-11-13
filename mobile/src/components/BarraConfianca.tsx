import React from "react";
import { Text, View } from "react-native";

import { confiancaStyles as styles } from "../styles/componentes.styles";
import { rotuloConfianca } from "../utils/formatadores";

type Props = { confianca: number; nivel: string };

const COR: Record<string, string> = { ALTA: "#1B5E20", MEDIA: "#9A6700", BAIXA: "#B71C1C" };

/** Mostra o nível de confiança do dado (requisito do trabalho) em barra + texto. */
export default function BarraConfianca({ confianca, nivel }: Props) {
  const rotulo = rotuloConfianca[nivel] ?? "Confiança";
  return (
    <View
      style={styles.container}
      accessible
      accessibilityRole="progressbar"
      accessibilityLabel={`${rotulo}: ${confianca} por cento`}
      accessibilityValue={{ min: 0, max: 100, now: confianca }}
    >
      <View style={styles.linha}>
        <Text style={styles.rotulo}>{rotulo}</Text>
        <Text style={styles.valor}>{confianca}%</Text>
      </View>
      <View style={styles.trilho}>
        <View style={[styles.preenchimento, { width: `${confianca}%`, backgroundColor: COR[nivel] ?? "#455A64" }]} />
      </View>
    </View>
  );
}
