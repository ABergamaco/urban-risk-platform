import axios, { AxiosError } from "axios";
import { Platform } from "react-native";

/**
 * BASE_URL aponta para o backend Spring Boot (porta 8080).
 *
 * - Expo Web (navegador) / iOS Simulator -> localhost funciona normalmente
 * - Android Emulator -> 10.0.2.2 (já tratado abaixo)
 * - Celular físico com Expo Go -> troque pelo IP da sua máquina (ex: http://192.168.0.10:8080)
 */
export const BASE_URL =
  Platform.OS === "android" ? "http://10.0.2.2:8080" : "http://localhost:8080";

const api = axios.create({
  baseURL: BASE_URL,
  timeout: 8000, // nunca deixa a tela "presa" esperando um servidor que caiu
  headers: {
    "Content-Type": "application/json",
  },
});

// ===== Aviso de queda de conexão =====
// Qualquer requisição que falhe por rede avisa o ConexaoContext na hora,
// sem esperar a próxima verificação periódica.
type Ouvinte = () => void;
const ouvintesFalha = new Set<Ouvinte>();

export function aoFalharRede(ouvinte: Ouvinte): () => void {
  ouvintesFalha.add(ouvinte);
  return () => ouvintesFalha.delete(ouvinte);
}

api.interceptors.response.use(
  (resposta) => resposta,
  (erro) => {
    if (erro instanceof AxiosError && !erro.response) {
      ouvintesFalha.forEach((o) => o());
    }
    return Promise.reject(erro);
  }
);

export default api;

/** true quando não houve resposta HTTP (backend offline, sem internet, timeout). */
export function isNetworkError(error: unknown): boolean {
  if (error instanceof AxiosError) {
    return !error.response;
  }
  return false;
}

/** GET /health com timeout curto, para mostrar se o servidor está no ar. */
export async function healthCheck(): Promise<boolean> {
  return (await medirConexao()) !== null;
}

/** GET /health medindo a latência. Retorna os milissegundos, ou null se o servidor não respondeu. */
export async function medirConexao(): Promise<number | null> {
  const inicio = Date.now();
  try {
    await axios.get(`${BASE_URL}/health`, { timeout: 3000 });
    return Date.now() - inicio;
  } catch {
    return null;
  }
}
