import React from "react";
import { View } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import { NativeStackScreenProps } from "@react-navigation/native-stack";

import { RootStackParamList, TabParamList } from "./types";
import { useSessao } from "../context/SessaoContext";
import { useMonitorAlertas } from "../hooks/useMonitorAlertas";
import { BannerAlerta } from "../components";
import { cores } from "../styles/theme";

import PainelScreen from "../screens/principal/PainelScreen";
import AlertasScreen from "../screens/principal/AlertasScreen";
import MapaScreen from "../screens/principal/MapaScreen";
import NovoRelatoScreen from "../screens/principal/NovoRelatoScreen";
import ValidarScreen from "../screens/principal/ValidarScreen";
import PerfilScreen from "../screens/principal/PerfilScreen";

const Tab = createBottomTabNavigator<TabParamList>();

const ICONES: Record<keyof TabParamList, keyof typeof Ionicons.glyphMap> = {
  Painel: "speedometer",
  Alertas: "notifications",
  Mapa: "map",
  Relatar: "megaphone",
  Validar: "shield-checkmark",
  Perfil: "person",
};

type Props = NativeStackScreenProps<RootStackParamList, "Principal">;

/**
 * Área principal com abas. As abas mudam conforme o perfil:
 * - Morador: Painel, Alertas, Mapa, Relatar, Perfil
 * - Agente local: Painel, Alertas, Mapa, Validar, Perfil
 * - Visitante: Painel, Alertas, Mapa, Perfil
 *
 * O monitor de alertas roda aqui, então o banner aparece em qualquer aba.
 */
export default function MainTabs({ navigation }: Props) {
  const { usuario } = useSessao();
  const { alertaAtual, tamanhoFila, fecharAtual } = useMonitorAlertas((eventoId) =>
    navigation.navigate("EventoDetalhe", { eventoId })
  );

  return (
    <View style={{ flex: 1 }}>
      <Tab.Navigator
        screenOptions={({ route }) => ({
          headerStyle: { backgroundColor: cores.primaria },
          headerTintColor: "#FFFFFF",
          headerTitleStyle: { fontWeight: "bold" },
          tabBarActiveTintColor: cores.primaria,
          tabBarInactiveTintColor: "#5F6B76",
          tabBarLabelStyle: { fontSize: 13, fontWeight: "600" },
          tabBarStyle: { height: 72, paddingBottom: 12, paddingTop: 6 },
          tabBarIcon: ({ color, size }) => <Ionicons name={ICONES[route.name]} size={size} color={color} />,
        })}
      >
        <Tab.Screen name="Painel" component={PainelScreen} options={{ title: "Painel" }} />
        <Tab.Screen name="Alertas" component={AlertasScreen} options={{ title: "Alertas" }} />
        <Tab.Screen name="Mapa" component={MapaScreen} options={{ title: "Mapa de eventos" , tabBarLabel: "Mapa" }} />
        {usuario?.perfil === "MORADOR" && (
          <Tab.Screen name="Relatar" component={NovoRelatoScreen} options={{ title: "Relatar ocorrência", tabBarLabel: "Relatar" }} />
        )}
        {usuario?.perfil === "AGENTE" && (
          <Tab.Screen name="Validar" component={ValidarScreen} options={{ title: "Validar relatos", tabBarLabel: "Validar" }} />
        )}
        <Tab.Screen name="Perfil" component={PerfilScreen} options={{ title: "Perfil" }} />
      </Tab.Navigator>

      {alertaAtual && (
        <View style={{ position: "absolute", top: 68, left: 12, right: 12, alignItems: "center", zIndex: 100 }} pointerEvents="box-none">
          <BannerAlerta
            evento={alertaAtual}
            quantidadeNaFila={tamanhoFila}
            onVer={() => {
              fecharAtual();
              navigation.navigate("EventoDetalhe", { eventoId: alertaAtual.id });
            }}
            onFechar={fecharAtual}
          />
        </View>
      )}
    </View>
  );
}
