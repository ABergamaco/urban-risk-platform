import api from "./api";
import { Regiao } from "../interfaces/regiao";

export async function listarRegioes(): Promise<Regiao[]> {
  const response = await api.get<Regiao[]>("/regioes");
  return response.data;
}
