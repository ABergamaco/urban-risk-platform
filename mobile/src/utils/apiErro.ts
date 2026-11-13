import { AxiosError } from "axios";
import { isNetworkError } from "../services/api";

type CorpoErro = {
  erro?: string;
};

/** Lê a mensagem {"erro": "..."} enviada pelo ApiExceptionHandler do backend. */
export function mensagemErroApi(erro: unknown, fallback: string): string {
  if (isNetworkError(erro)) {
    return "Sem conexão com o servidor. Verifique se o backend está rodando.";
  }
  const axiosError = erro as AxiosError<CorpoErro>;
  const mensagem = axiosError.response?.data?.erro;
  if (typeof mensagem === "string" && mensagem.trim()) {
    return mensagem;
  }
  return fallback;
}
