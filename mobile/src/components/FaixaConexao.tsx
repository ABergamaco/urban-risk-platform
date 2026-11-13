import React, { useEffect, useState } from "react";
import { Pressable, Text, View } from "react-native";
import { Ionicons } from "@expo/vector-icons";

import { useConexao } from "../context/ConexaoContext";
import { faixaStyles as styles } from "../styles/componentes.styles";

/**
 * Faixa fixa que aparece em QUALQUER tela quando o backend para de responder.
 * - Vermelha: "Sem conexão... tentando reconectar" (o app continua usável, com os últimos dados)
 * - Verde por 5 s: "Conexão restabelecida" (as telas recarregam sozinhas)
 */
export default function FaixaConexao() {
  const { online, offlineDesde, tentativas, acabouDeReconectar, verificarAgora } = useConexao();
  const [, forcarRender] = useState(0);

  // Atualiza o "há X s" enquanto estiver offline
  useEffect(() => {
    if (online !== false) return;
    const t = setInterval(() => forcarRender((n) => n + 1), 1000);
    return () => clearInterval(t);
  }, [online]);

  if (online === false) {
    const segundos = offlineDesde ? Math.round((Date.now() - offlineDesde) / 1000) : 0;
    return (
      <View style={styles.container} pointerEvents="box-none">
        <View
          style={[styles.faixa, styles.offline]}
          accessibilityRole="alert"
          accessibilityLiveRegion="assertive"
          accessibilityLabel="Sem conexão com o servidor. Tentando reconectar. Mostrando os últimos dados recebidos."
        >
          <Ionicons name="cloud-offline" size={24} color="#FFFFFF" />
          <View style={styles.textos}>
            <Text style={styles.titulo}>Sem conexão com o servidor</Text>
            <Text style={styles.sub}>
              Mostrando os últimos dados recebidos · tentando reconectar
              {tentativas > 0 ? ` (tentativa ${tentativas})` : ""} · offline há {segundos}s
            </Text>
          </View>
          <Pressable
            onPress={verificarAgora}
            style={styles.botao}
            accessibilityRole="button"
            accessibilityLabel="Tentar reconectar agora"
          >
            <Text style={styles.botaoTexto}>Tentar agora</Text>
          </Pressable>
        </View>
      </View>
    );
  }

  if (acabouDeReconectar) {
    return (
      <View style={styles.container} pointerEvents="box-none">
        <View style={[styles.faixa, styles.online]} accessibilityRole="alert" accessibilityLiveRegion="polite">
          <Ionicons name="cloud-done" size={24} color="#FFFFFF" />
          <View style={styles.textos}>
            <Text style={styles.titulo}>Conexão restabelecida</Text>
            <Text style={styles.sub}>Dados atualizados automaticamente</Text>
          </View>
        </View>
      </View>
    );
  }

  return null;
}
