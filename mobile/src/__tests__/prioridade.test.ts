import { parcelasPrioridade, somaPrioridade } from "../utils/prioridade";

function isoLocal(d: Date): string {
  const p = (n: number) => String(n).padStart(2, "0");
  return `${d.getFullYear()}-${p(d.getMonth() + 1)}-${p(d.getDate())}T${p(d.getHours())}:${p(d.getMinutes())}:${p(d.getSeconds())}`;
}

describe("prioridade (mesma fórmula do backend)", () => {
  const agora = new Date("2026-11-12T12:00:00").getTime();

  it("alerta crítico, confiável e recente fica perto de 100", () => {
    const p = parcelasPrioridade(
      { severidade: "CRITICA", confianca: 99, escaladoEm: isoLocal(new Date(agora)), ajusteTendencia: 0 },
      agora
    );
    expect(p.gravidade).toBe(50);
    expect(p.recencia).toBeCloseTo(15);
    expect(somaPrioridade(p)).toBeCloseTo(99.65, 1);
  });

  it("tendência de piora soma pontos e o total fica limitado a 100", () => {
    const p = parcelasPrioridade(
      { severidade: "CRITICA", confianca: 99, escaladoEm: isoLocal(new Date(agora)), ajusteTendencia: 10 },
      agora
    );
    expect(p.tendencia).toBe(10);
    expect(somaPrioridade(p)).toBe(100);
  });

  it("recência cai a zero depois de 6 horas", () => {
    const p = parcelasPrioridade(
      { severidade: "ALTA", confianca: 80, escaladoEm: isoLocal(new Date(agora - 7 * 3600 * 1000)), ajusteTendencia: 0 },
      agora
    );
    expect(p.recencia).toBe(0);
  });
});
