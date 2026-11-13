import React from "react";
import { Text, View } from "react-native";

import { mapaStyles as styles } from "../styles/mapa.styles";
import { coresNivel } from "../styles/theme";
import { rotuloNivel } from "../utils/formatadores";

const NIVEIS = ["VERMELHO", "LARANJA", "AMARELO", "INFORMATIVO"];

/** Legenda do mapa (cores + nomes dos níveis). */
export default function LegendaMapa() {
  return (
    <View style={styles.legenda} accessible accessibilityLabel="Legenda: vermelho, laranja, amarelo e informativo. Círculos grandes são as regiões.">
      <Text style={styles.legendaTitulo}>Legenda</Text>
      {NIVEIS.map((n) => (
        <View key={n} style={styles.legendaLinha}>
          <View style={[styles.legendaBola, { backgroundColor: coresNivel[n].fundo }]} />
          <Text style={styles.legendaTexto}>{rotuloNivel[n]}</Text>
        </View>
      ))}
      <Text style={styles.legendaTexto}>Tamanho = gravidade · Área = região</Text>
    </View>
  );
}
