import { useCallback, useState } from "react";
import { useFocusEffect } from "@react-navigation/native";

import { Evento } from "../interfaces/evento";
import { RegiaoResumo } from "../interfaces/painel";
import { listarAlertas } from "../services/alertaService";
import { buscarPainel } from "../services/painelService";
import { TipoRisco } from "../types/tipoRisco";
import { mensagemErroApi } from "../utils/apiErro";
import { useRecarregarAoReconectar } from "../context/ConexaoContext";

/** Dados usados pelas duas versões do mapa (celular e web). */
export function useDadosMapa(tipo: TipoRisco | "TODOS") {
  const [alertas, setAlertas] = useState<Evento[]>([]);
  const [regioes, setRegioes] = useState<RegiaoResumo[]>([]);
  const [erro, setErro] = useState<string | null>(null);
  const [carregando, setCarregando] = useState(true);

  const carregar = useCallback(async () => {
    try {
      const [lista, painel] = await Promise.all([
        listarAlertas({ tipo: tipo === "TODOS" ? undefined : tipo }),
        buscarPainel(),
      ]);
      setAlertas(lista);
      setRegioes(painel.regioes);
      setErro(null);
    } catch (e) {
      setErro(mensagemErroApi(e, "Não foi possível carregar o mapa."));
    } finally {
      setCarregando(false);
    }
  }, [tipo]);

  useFocusEffect(
    useCallback(() => {
      carregar();
      const timer = setInterval(carregar, 20000);
      return () => clearInterval(timer);
    }, [carregar])
  );

  useRecarregarAoReconectar(carregar);

  return { alertas, regioes, erro, carregando, carregar };
}
