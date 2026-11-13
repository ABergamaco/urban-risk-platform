import { AxiosError, AxiosHeaders } from "axios";
import { mensagemErroApi } from "../utils/apiErro";

describe("mensagemErroApi", () => {
  it("usa a mensagem {erro} enviada pelo backend", () => {
    const erro = new AxiosError("Bad Request", "ERR_BAD_REQUEST", undefined, undefined, {
      status: 400,
      statusText: "Bad Request",
      headers: {},
      config: { headers: new AxiosHeaders() },
      data: { erro: "Você já avaliou este evento." },
    });
    expect(mensagemErroApi(erro, "falhou")).toBe("Você já avaliou este evento.");
  });

  it("avisa quando o servidor está fora do ar (sem resposta)", () => {
    const erro = new AxiosError("Network Error", "ERR_NETWORK");
    expect(mensagemErroApi(erro, "falhou")).toMatch(/Sem conexão/);
  });

  it("usa o texto padrão para erros desconhecidos", () => {
    expect(mensagemErroApi(new Error("x"), "Não foi possível.")).toBe("Não foi possível.");
  });
});
