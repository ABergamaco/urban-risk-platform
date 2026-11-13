import React from "react";
import { Pressable, Text, View } from "react-native";
import { Ionicons } from "@expo/vector-icons";

import { seletorStyles as styles } from "../styles/componentes.styles";
import { cores } from "../styles/theme";

export type OpcaoSeletor<T> = {
  valor: T;
  rotulo: string;
  icone?: keyof typeof Ionicons.glyphMap;
};

type Props<T> = {
  opcoes: OpcaoSeletor<T>[];
  selecionado: T;
  onSelecionar: (valor: T) => void;
  rotuloGrupo: string; // lido pelo leitor de tela
};

/** Grupo de "chips" selecionáveis (filtros e escolhas em formulários). */
export default function Seletor<T extends string | number | null>({
  opcoes, selecionado, onSelecionar, rotuloGrupo,
}: Props<T>) {
  return (
    <View style={styles.container} accessibilityRole="radiogroup" accessibilityLabel={rotuloGrupo}>
      {opcoes.map((op) => {
        const ativo = op.valor === selecionado;
        return (
          <Pressable
            key={String(op.valor)}
            onPress={() => onSelecionar(op.valor)}
            accessibilityRole="radio"
            accessibilityState={{ selected: ativo, checked: ativo }}
            accessibilityLabel={op.rotulo}
            style={[styles.opcao, ativo && styles.opcaoAtiva]}
          >
            {op.icone && <Ionicons name={op.icone} size={18} color={ativo ? "#FFFFFF" : cores.primaria} />}
            <Text style={[styles.texto, ativo && styles.textoAtivo]}>{op.rotulo}</Text>
          </Pressable>
        );
      })}
    </View>
  );
}
