/**
 * App.tsx - Urban Risk Intelligence Platform (GS 2026.2)
 *
 * Fluxo de navegação:
 * - Sem sessão: Início -> Entrar / Criar conta / Só ver os alertas
 * - Com sessão: abas (Painel, Alertas, Mapa, Relatar|Validar, Perfil) + Detalhe do alerta
 *
 * As telas mudam automaticamente quando o usuário entra ou sai
 * (padrão "auth flow" do React Navigation).
 */
import React from "react";
import { StatusBar } from "expo-status-bar";
import { NavigationContainer } from "@react-navigation/native";
import { createNativeStackNavigator } from "@react-navigation/native-stack";

import { RootStackParamList } from "./src/navigation/types";
import { SessaoProvider, useSessao } from "./src/context/SessaoContext";
import { cores } from "./src/styles/theme";

import InicioScreen from "./src/screens/auth/InicioScreen";
import LoginScreen from "./src/screens/auth/LoginScreen";
import CadastroScreen from "./src/screens/auth/CadastroScreen";
import MainTabs from "./src/navigation/MainTabs";
import EventoDetalheScreen from "./src/screens/EventoDetalheScreen";

const Stack = createNativeStackNavigator<RootStackParamList>();

function Rotas() {
  const { usuario, visitante } = useSessao();
  const logado = usuario !== null || visitante;

  return (
    <Stack.Navigator
      screenOptions={{
        headerStyle: { backgroundColor: cores.primaria },
        headerTintColor: "#FFFFFF",
        headerTitleStyle: { fontWeight: "bold" },
      }}
    >
      {logado ? (
        <>
          <Stack.Screen name="Principal" component={MainTabs} options={{ headerShown: false, title: "Urban Risk" }} />
          <Stack.Screen name="EventoDetalhe" component={EventoDetalheScreen} options={{ title: "Detalhes do alerta" }} />
        </>
      ) : (
        <>
          <Stack.Screen name="Inicio" component={InicioScreen} options={{ headerShown: false, title: "Urban Risk" }} />
          <Stack.Screen name="Login" component={LoginScreen} options={{ title: "Entrar" }} />
          <Stack.Screen name="Cadastro" component={CadastroScreen} options={{ title: "Criar conta" }} />
        </>
      )}
    </Stack.Navigator>
  );
}

export default function App() {
  return (
    <SessaoProvider>
      <NavigationContainer>
        <StatusBar style="light" />
        <Rotas />
      </NavigationContainer>
    </SessaoProvider>
  );
}
