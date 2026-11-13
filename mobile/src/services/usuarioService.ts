import api from "./api";
import { Usuario } from "../interfaces/usuario";
import { Perfil } from "../types/perfil";

export type NovoUsuario = {
  nome: string;
  email: string;
  senha: string;
  perfil: Perfil;
  regiaoId?: number;
  codigoAgente?: string;
};

export async function cadastrarUsuario(dados: NovoUsuario): Promise<Usuario> {
  const response = await api.post<Usuario>("/usuarios", dados);
  return response.data;
}

export async function login(email: string, senha: string): Promise<Usuario> {
  const response = await api.post<Usuario>("/usuarios/login", { email, senha });
  return response.data;
}
