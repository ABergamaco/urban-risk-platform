import api from "./api";
import { Painel } from "../interfaces/painel";

export async function buscarPainel(): Promise<Painel> {
  const response = await api.get<Painel>("/painel");
  return response.data;
}
