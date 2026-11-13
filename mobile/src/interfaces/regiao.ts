export interface Regiao {
  id: number;
  nome: string;
  zona: string;
  latitude: number;
  longitude: number;
  efeitoIlhaCalor: number | null;
  propensaAlagamento: boolean | null;
}
