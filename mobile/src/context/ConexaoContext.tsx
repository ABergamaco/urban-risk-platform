import React, { createContext, useCallback, useContext, useEffect, useRef, useState } from "react";
import { aoFalharRede, medirConexao } from "../services/api";

/**
 * Situação da conexão com o backend, compartilhada por todo o app.
 *
 * - Verifica GET /health a cada 5 s (a cada 3 s quando está offline, para reconectar rápido)
 * - Qualquer requisição que falhe por rede marca offline na hora (interceptor do axios)
 * - Ao voltar, incrementa "reconexoes": as telas observam esse número e recarregam sozinhas
 *
 * Assim o app NUNCA trava quando o backend para: ele avisa, mantém os últimos dados
 * na tela e se recupera sozinho quando o servidor volta.
 */
type Conexao = {
  online: boolean | null; // null = ainda verificando
  latenciaMs: number | null; // tempo de resposta da última verificação
  offlineDesde: number | null; // Date.now() de quando caiu
  tentativas: number; // tentativas de reconexão desde a queda
  reconexoes: number; // quantas vezes reconectou (usado para recarregar telas)
  acabouDeReconectar: boolean; // true por alguns segundos após voltar
  verificarAgora: () => void;
};

const ConexaoContext = createContext<Conexao | undefined>(undefined);

const INTERVALO_ONLINE_MS = 5000;
const INTERVALO_OFFLINE_MS = 3000;

export function ConexaoProvider({ children }: { children: React.ReactNode }) {
  const [online, setOnline] = useState<boolean | null>(null);
  const [latenciaMs, setLatenciaMs] = useState<number | null>(null);
  const [offlineDesde, setOfflineDesde] = useState<number | null>(null);
  const [tentativas, setTentativas] = useState(0);
  const [reconexoes, setReconexoes] = useState(0);
  const [acabouDeReconectar, setAcabouDeReconectar] = useState(false);
  const onlineRef = useRef<boolean | null>(null);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const marcarOffline = useCallback(() => {
    if (onlineRef.current === false) return;
    onlineRef.current = false;
    setOnline(false);
    setOfflineDesde(Date.now());
    setTentativas(0);
    setAcabouDeReconectar(false);
  }, []);

  const verificar = useCallback(async () => {
    if (timerRef.current) clearTimeout(timerRef.current);
    const ms = await medirConexao();
    if (ms !== null) {
      if (onlineRef.current === false) {
        // Voltou!
        setReconexoes((r) => r + 1);
        setAcabouDeReconectar(true);
        setTimeout(() => setAcabouDeReconectar(false), 5000);
      }
      onlineRef.current = true;
      setOnline(true);
      setLatenciaMs(ms);
      setOfflineDesde(null);
    } else {
      marcarOffline();
      setTentativas((t) => t + 1);
    }
    timerRef.current = setTimeout(verificar, onlineRef.current ? INTERVALO_ONLINE_MS : INTERVALO_OFFLINE_MS);
  }, [marcarOffline]);

  useEffect(() => {
    verificar();
    const cancelar = aoFalharRede(marcarOffline);
    return () => {
      cancelar();
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, [verificar, marcarOffline]);

  return (
    <ConexaoContext.Provider
      value={{ online, latenciaMs, offlineDesde, tentativas, reconexoes, acabouDeReconectar, verificarAgora: verificar }}
    >
      {children}
    </ConexaoContext.Provider>
  );
}

export function useConexao(): Conexao {
  const ctx = useContext(ConexaoContext);
  if (!ctx) throw new Error("useConexao precisa estar dentro de <ConexaoProvider>");
  return ctx;
}

/** Chama "recarregar" toda vez que a conexão volta (não na primeira montagem). */
export function useRecarregarAoReconectar(recarregar: () => void) {
  const { reconexoes } = useConexao();
  const ref = useRef(recarregar);
  ref.current = recarregar;
  useEffect(() => {
    if (reconexoes > 0) ref.current();
  }, [reconexoes]);
}
