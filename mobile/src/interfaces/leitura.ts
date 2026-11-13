import { Origem } from "../types/origem";

export interface Leitura {
  id: number;
  grandeza: "NIVEL_AGUA" | "PRECIPITACAO" | "TEMPERATURA" | "ENERGIA";
  valor: number;
  unidade: string;
  fonte: string;
  origem: Origem;
  confianca: number;
  dataHora: string;
}
