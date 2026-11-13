import React, { useCallback, useEffect, useState } from "react";
import { FlatList, Text, View } from "react-native";
import { useFocusEffect, CompositeScreenProps } from "@react-navigation/native";
import { BottomTabScreenProps } from "@react-navigation/bottom-tabs";
import { NativeStackScreenProps } from "@react-navigation/native-stack";

import { RootStackParamList, TabParamList } from "../../navigation/types";
import { useSessao } from "../../context/SessaoContext";
import { Evento } from "../../interfaces/evento";
import { TipoRisco } from "../../types/tipoRisco";
import { listarAlertas } from "../../services/alertaService";
import { mensagemErroApi } from "../../utils/apiErro";
import { AlertaCard, EstadoTela, Seletor } from "../../components";
import { alertasStyles as styles } from "../../styles/alertas.styles";

type Props = CompositeScreenProps<
  BottomTabScreenProps<TabParamList, "Alertas">,
  NativeStackScreenProps<RootStackParamList>
>;

type FiltroTipo = TipoRisco | "TODOS";
type FiltroConfianca = 0 | 50 | 75;

/** Lista de alertas ativos, na ORDEM DE PRIORIDADE calculada pelo backend. */
export default function AlertasScreen({ navigation, route }: Props) {
  const { usuario } = useSessao();
  const [tipo, setTipo] = useState<FiltroTipo>(route.params?.tipo ?? "TODOS");
  const [confianca, setConfianca] = useState<FiltroConfianca>(0);
  const [soMeuBairro, setSoMeuBairro] = useState<"SIM" | "NAO">("NAO");
  const [alertas, setAlertas] = useState<Evento[]>([]);
  const [carregando, setCarregando] = useState(true);
  const [atualizando, setAtualizando] = useState(false);
  const [erro, setErro] = useState<string | null>(null);

  // Quando o painel abre esta aba já filtrada (ex.: tocou em "Alagamentos")
  useEffect(() => {
    if (route.params?.tipo) setTipo(route.params.tipo);
  }, [route.params?.tipo]);

  const carregar = useCallback(async () => {
    try {
      const dados = await listarAlertas({
        tipo: tipo === "TODOS" ? undefined : tipo,
        confiancaMinima: confianca || undefined,
        regiaoId: soMeuBairro === "SIM" && usuario?.regiao ? usuario.regiao.id : undefined,
      });
      setAlertas(dados);
      setErro(null);
    } catch (e) {
      setErro(mensagemErroApi(e, "Não foi possível carregar os alertas."));
    } finally {
      setCarregando(false);
      setAtualizando(false);
    }
  }, [tipo, confianca, soMeuBairro, usuario]);

  useFocusEffect(
    useCallback(() => {
      carregar();
      const timer = setInterval(carregar, 20000);
      return () => clearInterval(timer);
    }, [carregar])
  );

  return (
    <View style={styles.container}>
      <FlatList
        data={erro || carregando ? [] : alertas}
        keyExtractor={(e) => String(e.id)}
        contentContainerStyle={styles.lista}
        refreshing={atualizando}
        onRefresh={() => { setAtualizando(true); carregar(); }}
        ListHeaderComponent={
          <View style={styles.filtros}>
            <Seletor<FiltroTipo>
              rotuloGrupo="Filtrar por tipo"
              selecionado={tipo}
              onSelecionar={setTipo}
              opcoes={[
                { valor: "TODOS", rotulo: "Todos" },
                { valor: "ALAGAMENTO", rotulo: "Alagamento", icone: "water" },
                { valor: "ILHA_DE_CALOR", rotulo: "Calor", icone: "sunny" },
                { valor: "INTERRUPCAO_SERVICO", rotulo: "Serviços", icone: "flash-off" },
              ]}
            />
            <Seletor<FiltroConfianca>
              rotuloGrupo="Filtrar por confiança"
              selecionado={confianca}
              onSelecionar={setConfianca}
              opcoes={[
                { valor: 0, rotulo: "Qualquer confiança" },
                { valor: 50, rotulo: "Média ou alta" },
                { valor: 75, rotulo: "Só alta", icone: "shield-checkmark" },
              ]}
            />
            {usuario?.regiao && (
              <Seletor<"SIM" | "NAO">
                rotuloGrupo="Região"
                selecionado={soMeuBairro}
                onSelecionar={setSoMeuBairro}
                opcoes={[
                  { valor: "NAO", rotulo: "Toda a cidade" },
                  { valor: "SIM", rotulo: `Só ${usuario.regiao.nome}`, icone: "location" },
                ]}
              />
            )}
            {!carregando && !erro && (
              <Text style={styles.resumo} accessibilityLiveRegion="polite">
                {alertas.length} alerta(s) · ordenados do mais para o menos prioritário
              </Text>
            )}
          </View>
        }
        ListEmptyComponent={
          <EstadoTela
            carregando={carregando}
            erro={erro}
            vazio="Nenhum alerta ativo com esses filtros."
            onTentarNovamente={carregar}
          />
        }
        renderItem={({ item }) => (
          <AlertaCard
            evento={item}
            onPress={() => navigation.navigate("EventoDetalhe", { eventoId: item.id })}
          />
        )}
      />
    </View>
  );
}
