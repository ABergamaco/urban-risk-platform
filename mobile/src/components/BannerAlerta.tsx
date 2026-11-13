import React from "react";
import { Pressable, Text, View } from "react-native";
import { Ionicons } from "@expo/vector-icons";

import { Evento } from "../interfaces/evento";
import { bannerStyles as styles } from "../styles/componentes.styles";
import { coresNivel } from "../styles/theme";
import { rotuloNivel } from "../utils/formatadores";

type Props = {
  evento: Evento;
  quantidadeNaFila: number;
  onVer: () => void;
  onFechar: () => void;
};

/**
 * Notificação DENTRO do app (aparece no topo de qualquer aba).
 * Funciona em qualquer plataforma, mesmo se o usuário negou notificações do sistema.
 * accessibilityLiveRegion faz o leitor de tela anunciar o alerta automaticamente.
 */
export default function BannerAlerta({ evento, quantidadeNaFila, onVer, onFechar }: Props) {
  const cor = coresNivel[evento.nivelAlerta] ?? coresNivel.VERMELHO;
  return (
    <View
      style={[styles.banner, { backgroundColor: cor.fundo }]}
      accessibilityRole="alert"
      accessibilityLiveRegion="assertive"
    >
      <Pressable
        onPress={onVer}
        style={{ flex: 1, flexDirection: "row", alignItems: "center", gap: 12 }}
        accessibilityRole="button"
        accessibilityLabel={`Novo alerta: ${evento.titulo}. Toque para ver detalhes.`}
      >
        <Ionicons name="notifications" size={28} color={cor.texto} />
        <View style={styles.textos}>
          <Text style={[styles.rotulo, { color: cor.texto }]}>
            Novo · {rotuloNivel[evento.nivelAlerta] ?? ""}{quantidadeNaFila > 1 ? ` (+${quantidadeNaFila - 1})` : ""}
          </Text>
          <Text style={[styles.titulo, { color: cor.texto }]} numberOfLines={2}>{evento.titulo}</Text>
          <Text style={[styles.sub, { color: cor.texto }]}>Toque para ver o que fazer</Text>
        </View>
      </Pressable>
      <Pressable
        onPress={onFechar}
        style={styles.fechar}
        accessibilityRole="button"
        accessibilityLabel="Fechar alerta"
      >
        <Ionicons name="close" size={26} color={cor.texto} />
      </Pressable>
    </View>
  );
}
