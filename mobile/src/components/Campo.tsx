import React from "react";
import { Text, TextInput, TextInputProps, View } from "react-native";

import { campoStyles as styles } from "../styles/componentes.styles";

type Props = TextInputProps & {
  rotulo: string;
  ajuda?: string;
  multilinha?: boolean;
};

/** Campo de texto com rótulo visível (melhor para acessibilidade do que só placeholder). */
export default function Campo({ rotulo, ajuda, multilinha, style, ...props }: Props) {
  return (
    <View style={styles.container}>
      <Text style={styles.rotulo}>{rotulo}</Text>
      <TextInput
        accessibilityLabel={rotulo}
        accessibilityHint={ajuda}
        placeholderTextColor="#767676"
        multiline={multilinha}
        style={[styles.input, multilinha && styles.multilinha, style]}
        {...props}
      />
      {ajuda && <Text style={styles.ajuda}>{ajuda}</Text>}
    </View>
  );
}
