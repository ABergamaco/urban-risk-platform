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
  timeout: 10000,
  headers: {
    "Content-Type": "application/json",
  },
});

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
  try {
    await axios.get(`${BASE_URL}/health`, { timeout: 3000 });
    return true;
  } catch {
    return false;
  }
}
