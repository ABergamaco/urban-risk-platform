import React from "react";
import { ScrollView, Text, View } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { NativeStackScreenProps } from "@react-navigation/native-stack";

import { RootStackParamList } from "../../navigation/types";
import { useSessao } from "../../context/SessaoContext";
import { useConexao } from "../../context/ConexaoContext";
import { Botao } from "../../components";
import { inicioStyles as styles } from "../../styles/auth.styles";
import { cores } from "../../styles/theme";

type Props = NativeStackScreenProps<RootStackParamList, "Inicio">;

export default function InicioScreen({ navigation }: Props) {
  const { entrarComoVisitante } = useSessao();
  const { online } = useConexao();

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <View style={styles.topo}>
        <Ionicons name="shield-checkmark" size={72} color="#FFFFFF" accessibilityElementsHidden />
        <Text style={styles.titulo} accessibilityRole="header">Urban Risk</Text>
        <Text style={styles.subtitulo}>
          Alertas de alagamento, calor extremo e falta de serviços no seu bairro
        </Text>
      </View>

      <View style={styles.cartao}>
        <View style={styles.itens}>
          <View style={styles.item}>
            <Ionicons name="water" size={24} color={cores.primaria} />
            <Text style={styles.itemTexto}>Sensores, dados oficiais e relatos de vizinhos</Text>
          </View>
          <View style={styles.item}>
            <Ionicons name="shield-checkmark" size={24} color={cores.primaria} />
            <Text style={styles.itemTexto}>Cada alerta mostra de onde veio e o quanto é confiável</Text>
          </View>
          <View style={styles.item}>
            <Ionicons name="notifications" size={24} color={cores.primaria} />
            <Text style={styles.itemTexto}>Aviso imediato quando surge um risco grave</Text>
          </View>
        </View>

        <Botao titulo="Entrar" icone="log-in" onPress={() => navigation.navigate("Login")} />
        <Botao titulo="Criar conta" icone="person-add" variante="secundario" onPress={() => navigation.navigate("Cadastro")} />
        <Botao
          titulo="Só ver os alertas"
          icone="eye"
          variante="secundario"
          dica="Entra sem conta. Para enviar relatos é preciso entrar."
          onPress={entrarComoVisitante}
        />

        <View style={styles.status}>
          <Ionicons
            name={online === null ? "ellipse-outline" : online ? "ellipse" : "cloud-offline"}
            size={14}
            color={online === false ? cores.erro : cores.sucesso}
          />
          <Text style={styles.statusTexto}>
            {online === null ? "Verificando servidor..." : online ? "Servidor conectado" : "Servidor offline: inicie o backend"}
          </Text>
        </View>

        <View style={styles.demo}>
          <Text style={styles.demoTitulo}>Contas de demonstração (senha 123456)</Text>
          <Text style={styles.demoTexto}>Morador: morador@demo.com</Text>
          <Text style={styles.demoTexto}>Agente local: agente@demo.com</Text>
        </View>
      </View>
    </ScrollView>
  );
}
