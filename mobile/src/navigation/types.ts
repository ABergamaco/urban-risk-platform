import { NavigatorScreenParams } from "@react-navigation/native";
import { TipoRisco } from "../types/tipoRisco";

/** Abas da área principal (depois de entrar). */
export type TabParamList = {
  Painel: undefined;
  Alertas: { tipo?: TipoRisco } | undefined;
  Mapa: undefined;
  Relatar: undefined; // só morador
  Validar: undefined; // só agente local
  Perfil: undefined;
};

export type RootStackParamList = {
  // Antes de entrar
  Inicio: undefined;
  Login: undefined;
  Cadastro: undefined;

  // Depois de entrar
  Principal: NavigatorScreenParams<TabParamList> | undefined;
  EventoDetalhe: { eventoId: number };
};
