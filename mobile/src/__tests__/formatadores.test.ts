import { lerData, numero, tempoRelativo, tendenciaInfo } from "../utils/formatadores";

/** Converte Date para o formato que o backend envia (LocalDateTime sem fuso). */
function isoLocal(d: Date): string {
  const p = (n: number, t = 2) => String(n).padStart(t, "0");
  return `${d.getFullYear()}-${p(d.getMonth() + 1)}-${p(d.getDate())}T${p(d.getHours())}:${p(d.getMinutes())}:${p(d.getSeconds())}`;
}

describe("formatadores", () => {
  it("lê datas do backend com nanossegundos", () => {
    const d = lerData("2026-11-12T10:30:15.123456789");
    expect(d.getHours()).toBe(10);
    expect(d.getMinutes()).toBe(30);
    expect(d.getMilliseconds()).toBe(123);
  });

  it("mostra tempo relativo em linguagem simples", () => {
    const agora = Date.now();
    expect(tempoRelativo(isoLocal(new Date(agora - 20 * 1000)))).toBe("agora");
    expect(tempoRelativo(isoLocal(new Date(agora - 5 * 60 * 1000)))).toBe("há 5 min");
    expect(tempoRelativo(isoLocal(new Date(agora - 3 * 3600 * 1000)))).toBe("há 3 h");
    expect(tempoRelativo(null)).toBe("sem dados");
  });

  it("formata números no padrão brasileiro", () => {
    expect(numero(22.45)).toMatch(/22,5|22,4/);
    expect(numero(null)).toBe("-");
  });

  it("toda tendência tem rótulo, ícone e cor (nunca só cor)", () => {
    for (const t of Object.values(tendenciaInfo)) {
      expect(t.rotulo.length).toBeGreaterThan(0);
      expect(t.icone.length).toBeGreaterThan(0);
      expect(t.cor).toMatch(/^#/);
    }
  });
});
