import React, { useCallback, useState } from "react";
import { Pressable, RefreshControl, ScrollView, Text, View } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useFocusEffect, CompositeScreenProps } from "@react-navigation/native";
import { BottomTabScreenProps } from "@react-navigation/bottom-tabs";
import { NativeStackScreenProps } from "@react-navigation/native-stack";

import { RootStackParamList, TabParamList } from "../../navigation/types";
import { useSessao } from "../../context/SessaoContext";
import { Painel, FonteStatus, RegiaoResumo } from "../../interfaces/painel";
import { buscarPainel } from "../../services/painelService";
import { mensagemErroApi } from "../../utils/apiErro";
import { iconeOrigem, numero, rotuloNivel, tempoRelativo } from "../../utils/formatadores";
import { BadgeNivel, EstadoTela } from "../../components";
import { painelStyles as styles } from "../../styles/painel.styles";
import { cores, coresNivel } from "../../styles/theme";
import { TipoRisco } from "../../types/tipoRisco";

type Props = CompositeScreenProps<
  BottomTabScreenProps<TabParamList, "Painel">,
  NativeStackScreenProps<RootStackParamList>
>;

const ATUALIZAR_A_CADA_MS = 20000;

const CARDS_TIPO: { tipo: TipoRisco; rotulo: string; icone: keyof typeof Ionicons.glyphMap }[] = [
  { tipo: "ALAGAMENTO", rotulo: "Alagamentos", icone: "water" },
  { tipo: "ILHA_DE_CALOR", rotulo: "Calor extremo", icone: "sunny" },
  { tipo: "INTERRUPCAO_SERVICO", rotulo: "Falta de serviço", icone: "flash-off" },
];

const COR_STATUS: Record<string, string> = {
  ONLINE: cores.sucesso, ATRASADA: cores.aviso, OFFLINE: cores.erro, SEM_DADOS: "#616161", DESATIVADA: "#616161",
};
const ROTULO_STATUS: Record<string, string> = {
  ONLINE: "Online", ATRASADA: "Atrasada", OFFLINE: "Offline", SEM_DADOS: "Sem dados", DESATIVADA: "Desativada",
};

/** Painel de acompanhamento: visão geral da cidade, atualizada sozinha a cada 20 s. */
export default function PainelScreen({ navigation }: Props) {
  const { usuario } = useSessao();
  const [painel, setPainel] = useState<Painel | null>(null);
  const [carregando, setCarregando] = useState(true);
  const [atualizando, setAtualizando] = useState(false);
  const [erro, setErro] = useState<string | null>(null);

  const carregar = useCallback(async () => {
    try {
      const dados = await buscarPainel();
      setPainel(dados);
      setErro(null);
    } catch (e) {
      setErro(mensagemErroApi(e, "Não foi possível carregar o painel."));
    } finally {
      setCarregando(false);
      setAtualizando(false);
    }
  }, []);

  // Atualiza ao abrir a aba e depois a cada 20 s enquanto ela estiver visível
  useFocusEffect(
    useCallback(() => {
      carregar();
      const timer = setInterval(carregar, ATUALIZAR_A_CADA_MS);
      return () => clearInterval(timer);
    }, [carregar])
  );

  if (carregando || (!painel && erro)) {
    return <EstadoTela carregando={carregando} erro={erro} onTentarNovamente={carregar} />;
  }
  if (!painel) return null;

  const principal = painel.alertaPrincipal;
  const corPrincipal = principal ? coresNivel[principal.nivelAlerta] : null;
  const minhaRegiao = usuario?.regiao ? painel.regioes.find((r) => r.id === usuario.regiao!.id) : undefined;

  return (
    <ScrollView
      contentContainerStyle={styles.container}
      refreshControl={<RefreshControl refreshing={atualizando} onRefresh={() => { setAtualizando(true); carregar(); }} />}
    >
      <View style={styles.cabecalho}>
        <Text style={styles.ola} accessibilityRole="header">
          {usuario ? `Olá, ${usuario.nome.split(" ")[0]}` : "Situação da cidade"}
        </Text>
        <Text style={styles.atualizado}>
          {erro ? "⚠ Sem conexão — mostrando últimos dados" : `Atualizado ${tempoRelativo(painel.geradoEm)} · ${painel.alertasAtivos} alertas ativos`}
        </Text>
      </View>

      {/* Alerta mais prioritário */}
      {principal && corPrincipal ? (
        <Pressable
          onPress={() => navigation.navigate("EventoDetalhe", { eventoId: principal.id })}
          accessibilityRole="button"
          accessibilityLabel={`Alerta mais importante: ${principal.titulo}. Toque para detalhes.`}
          style={[styles.principal, { backgroundColor: corPrincipal.fundo }]}
        >
          <Text style={[styles.principalRotulo, { color: corPrincipal.texto }]}>
            Mais importante agora · {rotuloNivel[principal.nivelAlerta]}
          </Text>
          <Text style={[styles.principalTitulo, { color: corPrincipal.texto }]}>{principal.titulo}</Text>
          <Text style={[styles.principalInfo, { color: corPrincipal.texto }]}>
            {principal.origemDescricao} · confiança {principal.confianca}% · {tempoRelativo(principal.atualizadoEm)}
          </Text>
        </Pressable>
      ) : (
        <View style={styles.semAlertas}>
          <Ionicons name="checkmark-circle" size={32} color={cores.sucesso} />
          <Text style={styles.semAlertasTexto}>Nenhum alerta ativo no momento.</Text>
        </View>
      )}

      {/* Meu bairro */}
      {minhaRegiao && (
        <View>
          <Text style={styles.secaoTitulo}>Meu bairro</Text>
          <CardRegiao regiao={minhaRegiao} onPress={() => navigation.navigate("Alertas")} />
        </View>
      )}

      {/* Contadores por tipo */}
      <View>
        <Text style={styles.secaoTitulo}>Alertas ativos por tipo</Text>
        <View style={styles.linhaCards}>
          {CARDS_TIPO.map((c) => (
            <Pressable
              key={c.tipo}
              style={styles.cardTipo}
              onPress={() => navigation.navigate("Alertas", { tipo: c.tipo })}
              accessibilityRole="button"
              accessibilityLabel={`${painel.porTipo[c.tipo] ?? 0} alertas de ${c.rotulo}. Toque para ver.`}
            >
              <Ionicons name={c.icone} size={28} color={cores.primaria} />
              <Text style={styles.cardTipoNumero}>{painel.porTipo[c.tipo] ?? 0}</Text>
              <Text style={styles.cardTipoRotulo}>{c.rotulo}</Text>
            </Pressable>
          ))}
        </View>
      </View>

      {/* Por nível */}
      <View>
        <Text style={styles.secaoTitulo}>Por nível de alerta</Text>
        <View style={styles.niveis}>
          {Object.entries(painel.porNivel).map(([nivel, qtd]) => (
            <View key={nivel} style={[styles.nivelChip, { backgroundColor: coresNivel[nivel].fundo }]}>
              <Text style={[styles.nivelTexto, { color: coresNivel[nivel].texto }]}>
                {rotuloNivel[nivel]}: {qtd}
              </Text>
            </View>
          ))}
        </View>
      </View>

      {/* Regiões */}
      <View>
        <Text style={styles.secaoTitulo}>Regiões monitoradas</Text>
        {painel.regioes.map((r) => (
          <CardRegiao key={r.id} regiao={r} onPress={() => navigation.navigate("Mapa")} />
        ))}
      </View>

      {/* Fontes de dados */}
      <View>
        <Text style={styles.secaoTitulo}>Fontes de dados</Text>
        {painel.fontes.map((f) => <LinhaFonte key={f.origem} fonte={f} />)}
      </View>
    </ScrollView>
  );
}

function CardRegiao({ regiao, onPress }: { regiao: RegiaoResumo; onPress: () => void }) {
  const cor = coresNivel[regiao.nivelRisco] ?? coresNivel.NORMAL;
  return (
    <Pressable
      onPress={onPress}
      style={[styles.regiao, { borderLeftColor: cor.fundo }]}
      accessibilityRole="button"
      accessibilityLabel={`${regiao.nome}: ${rotuloNivel[regiao.nivelRisco]}, ${regiao.alertasAtivos} alertas ativos.`}
    >
      <View style={styles.regiaoTopo}>
        <View>
          <Text style={styles.regiaoNome}>{regiao.nome}</Text>
          <Text style={styles.regiaoZona}>{regiao.zona} · {regiao.alertasAtivos} alerta(s) · {tempoRelativo(regiao.atualizadoEm)}</Text>
        </View>
        <BadgeNivel nivel={regiao.nivelRisco} />
      </View>
      <View style={styles.medidas}>
        <View style={styles.medida}>
          <Ionicons name="thermometer" size={16} color={cores.primaria} />
          <Text style={styles.medidaTexto}>{numero(regiao.temperatura)} °C</Text>
        </View>
        <View style={styles.medida}>
          <Ionicons name="rainy" size={16} color={cores.primaria} />
          <Text style={styles.medidaTexto}>{numero(regiao.precipitacao)} mm/h</Text>
        </View>
        <View style={styles.medida}>
          <Ionicons name="water" size={16} color={cores.primaria} />
          <Text style={styles.medidaTexto}>{numero(regiao.nivelAgua, 0)} cm na via</Text>
        </View>
      </View>
    </Pressable>
  );
}

function LinhaFonte({ fonte }: { fonte: FonteStatus }) {
  const cor = COR_STATUS[fonte.status] ?? "#616161";
  return (
    <View
      style={styles.fonte}
      accessible
      accessibilityLabel={`${fonte.nome}: ${ROTULO_STATUS[fonte.status]}. ${fonte.detalhe}. Confiança base ${fonte.confiancaBase} por cento.`}
    >
      <Ionicons name={iconeOrigem[fonte.origem]} size={26} color={cores.primaria} />
      <View style={styles.fonteTextos}>
        <Text style={styles.fonteNome}>{fonte.nome}</Text>
        <Text style={styles.fonteDetalhe}>
          {fonte.detalhe} · última: {tempoRelativo(fonte.ultimaAtualizacao)} · confiança base {fonte.confiancaBase}%
        </Text>
      </View>
      <Text style={[styles.fonteStatus, { color: cor }]}>● {ROTULO_STATUS[fonte.status]}</Text>
    </View>
  );
}
