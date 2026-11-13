import { Evento } from "../interfaces/evento";
import { limitesRegioes, posicaoNoMapa, raioMarcador } from "../utils/mapa";

const regiao = { id: 1, nome: "Sé", zona: "Centro", latitude: -23.55, longitude: -46.63, efeitoIlhaCalor: 4, propensaAlagamento: false };

function evento(parcial: Partial<Evento>): Evento {
  return {
    id: 1, tipo: "ALAGAMENTO", tipoDescricao: "", regiao, titulo: "", descricao: "", severidade: "ALTA",
    origem: "SENSOR", origemDescricao: "", fonte: "", confianca: 80, nivelConfianca: "ALTA", prioridade: 80,
    nivelAlerta: "VERMELHO", status: "ATIVO", latitude: regiao.latitude, longitude: regiao.longitude,
    confirmacoes: 0, contestacoes: 0, fontesCorroborando: 0, validadoPorAgente: false, desatualizado: false,
    criadoEm: "2026-11-12T10:00:00", atualizadoEm: "2026-11-12T10:00:00", escaladoEm: "2026-11-12T10:00:00",
    ...parcial,
  };
}

describe("mapa", () => {
  it("afasta eventos que ficariam no mesmo ponto (centro da região)", () => {
    const sensor = posicaoNoMapa(evento({ origem: "SENSOR", tipo: "ALAGAMENTO" }));
    const calor = posicaoNoMapa(evento({ origem: "SENSOR", tipo: "ILHA_DE_CALOR" }));
    const relato = posicaoNoMapa(evento({ origem: "COMUNIDADE", tipo: "ALAGAMENTO" }));
    expect(sensor).not.toEqual(calor);
    expect(sensor).not.toEqual(relato);
  });

  it("mantém a posição de relatos com coordenada própria", () => {
    const pos = posicaoNoMapa(evento({ origem: "COMUNIDADE", latitude: -23.526, longitude: -46.698 }));
    expect(pos).toEqual({ latitude: -23.526, longitude: -46.698 });
  });

  it("marcador maior para gravidade maior", () => {
    expect(raioMarcador(evento({ severidade: "CRITICA" }))).toBeGreaterThan(raioMarcador(evento({ severidade: "BAIXA" })));
  });

  it("calcula o retângulo que contém todas as regiões", () => {
    const lim = limitesRegioes([
      { latitude: -23.49, longitude: -46.42 },
      { latitude: -23.67, longitude: -46.78 },
    ]);
    expect(lim).toEqual({ minLat: -23.67, maxLat: -23.49, minLng: -46.78, maxLng: -46.42 });
  });
});
