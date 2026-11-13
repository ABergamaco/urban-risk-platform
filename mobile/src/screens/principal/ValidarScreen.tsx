import React, { useCallback, useState } from "react";
import { FlatList, Text, View } from "react-native";
import { useFocusEffect, CompositeScreenProps } from "@react-navigation/native";
import { BottomTabScreenProps } from "@react-navigation/bottom-tabs";
import { NativeStackScreenProps } from "@react-navigation/native-stack";

import { RootStackParamList, TabParamList } from "../../navigation/types";
import { useSessao } from "../../context/SessaoContext";
import { Evento } from "../../interfaces/evento";
import { listarPendentes, validarEvento } from "../../services/eventoService";
import { mensagemErroApi } from "../../utils/apiErro";
import { AlertaCard, Botao, EstadoTela, Mensagem } from "../../components";
import { alertasStyles as styles } from "../../styles/alertas.styles";

type Props = CompositeScreenProps<
  BottomTabScreenProps<TabParamList, "Validar">,
  NativeStackScreenProps<RootStackParamList>
>;

/** Somente AGENTE LOCAL: fila de relatos da comunidade aguardando validação. */
export default function ValidarScreen({ navigation }: Props) {
  const { usuario } = useSessao();
  const [pendentes, setPendentes] = useState<Evento[]>([]);
  const [carregando, setCarregando] = useState(true);
  const [erro, setErro] = useState<string | null>(null);
  const [mensagem, setMensagem] = useState<{ tipo: "erro" | "sucesso"; texto: string } | null>(null);
  const [processando, setProcessando] = useState<number | null>(null);

  const carregar = useCallback(async () => {
    try {
      setPendentes(await listarPendentes());
      setErro(null);
    } catch (e) {
      setErro(mensagemErroApi(e, "Não foi possível carregar os relatos pendentes."));
    } finally {
      setCarregando(false);
    }
  }, []);

  useFocusEffect(useCallback(() => { carregar(); }, [carregar]));

  async function decidir(evento: Evento, tipo: "CONFIRMAR" | "CONTESTAR") {
    if (!usuario) return;
    setProcessando(evento.id);
    setMensagem(null);
    try {
      await validarEvento(evento.id, usuario.id, tipo);
      setMensagem({
        tipo: "sucesso",
        texto: tipo === "CONFIRMAR" ? `"${evento.titulo}" validado.` : `"${evento.titulo}" descartado.`,
      });
      setPendentes((lista) => lista.filter((e) => e.id !== evento.id));
    } catch (e) {
      setMensagem({ tipo: "erro", texto: mensagemErroApi(e, "Não foi possível registrar a decisão.") });
    } finally {
      setProcessando(null);
    }
  }

  return (
    <FlatList
      style={styles.container}
      contentContainerStyle={styles.lista}
      data={carregando || erro ? [] : pendentes}
      keyExtractor={(e) => String(e.id)}
      onRefresh={carregar}
      refreshing={false}
      ListHeaderComponent={
        <View style={styles.filtros}>
          <Text style={styles.resumo}>
            Relatos de moradores ainda não verificados. Validar aumenta a confiança em 40 pontos e notifica os moradores;
            descartar remove o alerta.
          </Text>
          {mensagem && <Mensagem tipo={mensagem.tipo} texto={mensagem.texto} />}
        </View>
      }
      ListEmptyComponent={
        <EstadoTela carregando={carregando} erro={erro} vazio="Nenhum relato aguardando validação." onTentarNovamente={carregar} />
      }
      renderItem={({ item }) => (
        <AlertaCard evento={item} onPress={() => navigation.navigate("EventoDetalhe", { eventoId: item.id })}>
          <View style={styles.acoes}>
            <View style={{ flex: 1, minWidth: 140 }}>
              <Botao titulo="Validar" icone="shield-checkmark" variante="sucesso"
                carregando={processando === item.id} onPress={() => decidir(item, "CONFIRMAR")} />
            </View>
            <View style={{ flex: 1, minWidth: 140 }}>
              <Botao titulo="Descartar" icone="trash" variante="perigo"
                carregando={processando === item.id} onPress={() => decidir(item, "CONTESTAR")} />
            </View>
          </View>
        </AlertaCard>
      )}
    />
  );
}
