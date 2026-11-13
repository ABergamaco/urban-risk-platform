import React from "react";
import { Text, View } from "react-native";
import { Ionicons } from "@expo/vector-icons";

import { origemStyles as styles } from "../styles/componentes.styles";
import { cores } from "../styles/theme";
import { Origem } from "../types/origem";
import { iconeOrigem, rotuloOrigem } from "../utils/formatadores";

type Props = { origem: Origem; fonte?: string };

/** Origem do dado (Sensor / Base pública / Comunidade) + nome da fonte. */
export default function ChipOrigem({ origem, fonte }: Props) {
  const texto = fonte ? `${rotuloOrigem[origem]} · ${fonte}` : rotuloOrigem[origem];
  return (
    <View style={styles.chip} accessible accessibilityLabel={`Origem do dado: ${texto}`}>
      <Ionicons name={iconeOrigem[origem]} size={16} color={cores.primaria} />
      <Text style={styles.texto} numberOfLines={1}>{texto}</Text>
    </View>
  );
}
