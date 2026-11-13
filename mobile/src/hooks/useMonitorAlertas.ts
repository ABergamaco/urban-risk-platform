import { useCallback, useEffect, useRef, useState } from "react";

import { Evento } from "../interfaces/evento";
import { buscarNovosAlertas } from "../services/alertaService";
import { aoTocarNotificacao, notificar, pedirPermissaoNotificacao } from "../services/notificacaoService";
import { rotuloNivel } from "../utils/formatadores";

const INTERVALO_MS = 15000;

/**
 * Monitor de alertas (as "duas" notificações pedidas):
 * 1) a cada 15 s pergunta ao backend se surgiu alerta grave novo (GET /alertas/novos)
 * 2) para cada alerta novo:
 *    - dispara NOTIFICAÇÃO DO SISTEMA (celular via expo-notifications; navegador via Notification API)
 *    - coloca o alerta na fila do BANNER dentro do app
 *
 * O backend só devolve alertas LARANJA/VERMELHO com confiança média ou alta,
 * para não incomodar o morador com alarme falso.
 */
export function useMonitorAlertas(onAbrirEvento: (eventoId: number) => void) {
  const [fila, setFila] = useState<Evento[]>([]);
  const [permissaoSistema, setPermissaoSistema] = useState<boolean | null>(null);
  const desdeRef = useRef<string | undefined>(undefined);
  const abrirRef = useRef(onAbrirEvento);
  abrirRef.current = onAbrirEvento;

  const verificar = useCallback(async () => {
    try {
      const resposta = await buscarNovosAlertas(desdeRef.current);
      desdeRef.current = resposta.servidorEm; // próxima consulta pega só o que vier depois
      if (resposta.alertas.length === 0) return;

      setFila((atual) => {
        const ids = new Set(atual.map((e) => e.id));
        return [...atual, ...resposta.alertas.filter((e) => !ids.has(e.id))];
      });
      for (const alerta of resposta.alertas.slice(0, 3)) {
        await notificar(
          `${rotuloNivel[alerta.nivelAlerta] ?? "Alerta"}: ${alerta.titulo}`,
          `${alerta.regiao.nome} · confiança ${alerta.confianca}% · ${alerta.origemDescricao}`,
          alerta.id
        );
      }
    } catch {
      // Sem conexão: tenta de novo no próximo ciclo (o painel mostra o erro ao usuário)
    }
  }, []);

  useEffect(() => {
    pedirPermissaoNotificacao().then(setPermissaoSistema).catch(() => setPermissaoSistema(false));
    const cancelarToque = aoTocarNotificacao((id) => abrirRef.current(id));

    verificar(); // primeira chamada: só pega o horário de referência
    const timer = setInterval(verificar, INTERVALO_MS);
    return () => {
      clearInterval(timer);
      cancelarToque();
    };
  }, [verificar]);

  const fecharAtual = useCallback(() => setFila((f) => f.slice(1)), []);

  return { alertaAtual: fila[0] ?? null, tamanhoFila: fila.length, fecharAtual, permissaoSistema };
}
