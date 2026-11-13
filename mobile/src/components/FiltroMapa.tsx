import React from "react";
import { Text, View } from "react-native";

import Seletor from "./Seletor";
import { mapaStyles as styles } from "../styles/mapa.styles";
import { TipoRisco } from "../types/tipoRisco";

type Props = {
  tipo: TipoRisco | "TODOS";
  onTipo: (t: TipoRisco | "TODOS") => void;
  quantidade: number;
};

/** Filtro por tipo usado nas duas versões do mapa. */
export default function FiltroMapa({ tipo, onTipo, quantidade }: Props) {
  return (
    <View style={styles.filtros}>
      <Seletor<TipoRisco | "TODOS">
        rotuloGrupo="Filtrar mapa por tipo"
        selecionado={tipo}
        onSelecionar={onTipo}
        opcoes={[
          { valor: "TODOS", rotulo: "Todos" },
          { valor: "ALAGAMENTO", rotulo: "Alagamento", icone: "water" },
          { valor: "ILHA_DE_CALOR", rotulo: "Calor", icone: "sunny" },
          { valor: "INTERRUPCAO_SERVICO", rotulo: "Serviços", icone: "flash-off" },
        ]}
      />
      <Text style={styles.contagem}>{quantidade} alerta(s) no mapa · toque em um ponto para detalhes</Text>
    </View>
  );
}
