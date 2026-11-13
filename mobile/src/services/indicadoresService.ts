import api from "./api";
import { Indicadores } from "../interfaces/indicadores";

export async function buscarIndicadores(): Promise<Indicadores> {
  const response = await api.get<Indicadores>("/indicadores");
  return response.data;
}
