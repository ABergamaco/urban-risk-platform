import React, { createContext, useContext, useState } from "react";
import { Usuario } from "../interfaces/usuario";

/**
 * Guarda quem está usando o app (ou se está como visitante).
 * Qualquer tela acessa com: const { usuario } = useSessao();
 */
type Sessao = {
  usuario: Usuario | null;
  visitante: boolean;
  entrar: (usuario: Usuario) => void;
  entrarComoVisitante: () => void;
  sair: () => void;
};

const SessaoContext = createContext<Sessao | undefined>(undefined);

export function SessaoProvider({ children }: { children: React.ReactNode }) {
  const [usuario, setUsuario] = useState<Usuario | null>(null);
  const [visitante, setVisitante] = useState(false);

  const valor: Sessao = {
    usuario,
    visitante,
    entrar: (u) => {
      setUsuario(u);
      setVisitante(false);
    },
    entrarComoVisitante: () => {
      setUsuario(null);
      setVisitante(true);
    },
    sair: () => {
      setUsuario(null);
      setVisitante(false);
    },
  };

  return <SessaoContext.Provider value={valor}>{children}</SessaoContext.Provider>;
}

export function useSessao(): Sessao {
  const ctx = useContext(SessaoContext);
  if (!ctx) throw new Error("useSessao precisa estar dentro de <SessaoProvider>");
  return ctx;
}
