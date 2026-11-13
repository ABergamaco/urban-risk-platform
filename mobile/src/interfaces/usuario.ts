import { Regiao } from "./regiao";
import { Perfil } from "../types/perfil";

export interface Usuario {
  id: number;
  nome: string;
  email: string;
  perfil: Perfil;
  regiao: Regiao | null;
  criadoEm: string;
}
