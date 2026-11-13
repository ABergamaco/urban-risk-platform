import React, { useCallback, useEffect, useState } from "react";
import { ScrollView, Text, View } from "react-native";
import { NativeStackScreenProps } from "@react-navigation/native-stack";

import { RootStackParamList } from "../navigation/types";
import { useSessao } from "../context/SessaoContext";
import { useRecarregarAoReconectar } from "../context/ConexaoContext";
import { Evento } from "../interfaces/evento";
import { Leitura } from "../interfaces/leitura";
import { buscarEvento, buscarLeiturasDoEvento, resolverEvento, validarEvento } from "../services/eventoService";
import { mensagemErroApi } from "../utils/apiErro";
import { dataHora, lerData, numero, rotuloSeveridade, rotuloNivel, tempoRelativo, tendenciaInfo } from "../utils/formatadores";
import { BadgeNivel, BarraConfianca, Botao, Campo, ChipOrigem, EstadoTela, Mensagem } from "../components";
import { detalheStyles as styles } from "../styles/detalhe.styles";
import { coresNivel } from "../styles/theme";

type Props = NativeStackScreenProps<RootStackParamList, "EventoDetalhe">;

/** O que fazer em cada tipo de risco (orientações simples para o morador). */
const ORIENTACOES: Record<string, string[]> = {
  ALAGAMENTO: [
    "Não atravesse ruas alagadas, a pé ou de carro.",
    "Desligue a energia da casa se a água entrar.",
    "Em emergência ligue 199 (Defesa Civil) ou 193 (Bombeiros).",
  ],
  ILHA_DE_CALOR: [
    "Beba água com frequência, mesmo sem sede.",
    "Evite sol direto entre 10h e 16h.",
    "Atenção redobrada com idosos, crianças e pets.",
  ],
  INTERRUPCAO_SERVICO: [
    "Desligue aparelhos da tomada para evitar danos na volta da energia.",
    "Economize a água armazenada.",
    "Informe a concessionária com o número do seu imóvel.",
  ],
};

const BASE_ORIGEM: Record<string, number> = { SENSOR: 80, BASE_PUBLICA: 85, COMUNIDADE: 35 };
const PESO: Record<string, number> = { BAIXA: 1, MODERADA: 2, ALTA: 3, CRITICA: 4 };

/** Mesma fórmula do backend (CalculoRisco.prioridade), só para mostrar as parcelas. */
function parcelasPrioridade(e: Evento) {
  const minutos = Math.max(0, (Date.now() - lerData(e.escaladoEm).getTime()) / 60000);
  return {
    gravidade: (PESO[e.severidade] / 4) * 50,
    confianca: e.confianca * 0.35,
    recencia: 15 * (1 - Math.min(minutos, 360) / 360),
    tendencia: e.ajusteTendencia ?? 0,
  };
}

export default function EventoDetalheScreen({ route }: Props) {
  const { eventoId } = route.params;
  const { usuario } = useSessao();
  const [evento, setEvento] = useState<Evento | null>(null);
  const [leituras, setLeituras] = useState<Leitura[]>([]);
  const [erro, setErro] = useState<string | null>(null);
  const [mensagem, setMensagem] = useState<{ tipo: "erro" | "sucesso"; texto: string } | null>(null);
  const [enviando, setEnviando] = useState(false);
  const [observacao, setObservacao] = useState("");

  const carregar = useCallback(async () => {
    try {
      const [e, l] = await Promise.all([buscarEvento(eventoId), buscarLeiturasDoEvento(eventoId, 20)]);
      setEvento(e);
      setLeituras(l.slice().reverse()); // mais antiga -> mais recente
      setErro(null);
    } catch (e) {
      setErro(mensagemErroApi(e, "Não foi possível carregar o alerta."));
    }
  }, [eventoId]);

  useEffect(() => {
    carregar();
    const timer = setInterval(carregar, 15000); // mantém o detalhe atualizado (tendência, confiança)
    return () => clearInterval(timer);
  }, [carregar]);
  useRecarregarAoReconectar(carregar);

  async function acao(fn: () => Promise<Evento>, sucesso: string) {
    setEnviando(true);
    setMensagem(null);
    try {
      const atualizado = await fn();
      setEvento(atualizado);
      setMensagem({ tipo: "sucesso", texto: sucesso });
    } catch (e) {
      setMensagem({ tipo: "erro", texto: mensagemErroApi(e, "Não foi possível concluir a ação.") });
    } finally {
      setEnviando(false);
    }
  }

  if (!evento) return <EstadoTela carregando={!erro} erro={erro} onTentarNovamente={carregar} />;

  const cor = coresNivel[evento.nivelAlerta] ?? coresNivel.INFORMATIVO;
  const ativo = evento.status === "ATIVO";
  const ehAgente = usuario?.perfil === "AGENTE";
  const ehMorador = usuario?.perfil === "MORADOR";

  return (
    <ScrollView contentContainerStyle={styles.container}>
      {/* Cabeçalho colorido pelo nível */}
      <View style={[styles.topo, { backgroundColor: cor.fundo }]}>
        <BadgeNivel nivel={evento.nivelAlerta} grande />
        <Text style={[styles.topoTitulo, { color: cor.texto }]} accessibilityRole="header">{evento.titulo}</Text>
        <Text style={[styles.topoInfo, { color: cor.texto }]}>
          {evento.regiao.nome} · {evento.regiao.zona} · atualizado {tempoRelativo(evento.atualizadoEm)}
        </Text>
      </View>

      {mensagem && <Mensagem tipo={mensagem.tipo} texto={mensagem.texto} />}

      <View style={styles.cartao}>
        <Text style={styles.cartaoTitulo}>O que está acontecendo</Text>
        <Text style={styles.texto}>{evento.descricao}</Text>
        {evento.observacaoAgente && <Text style={styles.textoSec}>Obs.: {evento.observacaoAgente}</Text>}
      </View>

      {ativo && (
        <View style={styles.cartao}>
          <Text style={styles.cartaoTitulo}>O que fazer</Text>
          {(ORIENTACOES[evento.tipo] ?? []).map((o) => (
            <Text key={o} style={styles.texto}>• {o}</Text>
          ))}
        </View>
      )}

      {/* Origem e confiança */}
      <View style={styles.cartao}>
        <Text style={styles.cartaoTitulo}>De onde veio e quanto confiar</Text>
        <ChipOrigem origem={evento.origem} fonte={evento.fonte} />
        <BarraConfianca confianca={evento.confianca} nivel={evento.nivelConfianca} />
        <Text style={[styles.textoSec, { marginTop: 6 }]}>Como a confiança foi calculada:</Text>
        <LinhaCalculo texto={`Base da origem (${evento.origemDescricao})`} valor={`${BASE_ORIGEM[evento.origem]}`} />
        {evento.confirmacoes > 0 && <LinhaCalculo texto={`${evento.confirmacoes} confirmação(ões) de moradores`} valor={`+${evento.confirmacoes * 10}`} />}
        {evento.contestacoes > 0 && <LinhaCalculo texto={`${evento.contestacoes} contestação(ões)`} valor={`-${evento.contestacoes * 15}`} />}
        {evento.fontesCorroborando > 0 && <LinhaCalculo texto={`${evento.fontesCorroborando} outra(s) fonte(s) confirmam`} valor={`+${evento.fontesCorroborando * 15}`} />}
        {evento.validadoPorAgente && <LinhaCalculo texto="Validado por agente local" valor="+40" />}
        {evento.desatualizado && <LinhaCalculo texto="Sensor sem dados recentes" valor="-25" />}
        <LinhaCalculo texto="Resultado (limitado entre 5 e 99)" valor={`${evento.confianca}%`} />
      </View>

      {/* Análise de tendência + composição da prioridade */}
      <View style={styles.cartao}>
        <Text style={styles.cartaoTitulo}>Por que esta prioridade</Text>
        {evento.tendencia && tendenciaInfo[evento.tendencia] && (
          <View style={styles.tendenciaBox}>
            <Text style={[styles.tendenciaTitulo, { color: tendenciaInfo[evento.tendencia].cor }]}>
              Tendência: {tendenciaInfo[evento.tendencia].rotulo}
            </Text>
            {evento.previsaoTexto && <Text style={styles.texto}>{evento.previsaoTexto}.</Text>}
            <Text style={styles.textoSec}>
              Análise de tendência: regressão linear sobre as últimas leituras do sensor da região.
              Riscos piorando ganham até +10 pontos de prioridade; riscos melhorando perdem 5.
            </Text>
          </View>
        )}
        {(() => {
          const p = parcelasPrioridade(evento);
          return (
            <>
              <LinhaCalculo texto={`Gravidade (${rotuloSeveridade[evento.severidade]})`} valor={`+${numero(p.gravidade)}`} />
              <LinhaCalculo texto={`Confiança (${evento.confianca}% × 0,35)`} valor={`+${numero(p.confianca)}`} />
              <LinhaCalculo texto="Recência (cai até zero em 6 h)" valor={`+${numero(p.recencia)}`} />
              <LinhaCalculo
                texto="Tendência (análise preditiva)"
                valor={`${p.tendencia >= 0 ? "+" : ""}${p.tendencia}`}
              />
              <LinhaCalculo texto="Prioridade (0 a 100)" valor={numero(evento.prioridade)} />
            </>
          );
        })()}
      </View>

      {/* Dados do evento */}
      <View style={styles.cartao}>
        <Text style={styles.cartaoTitulo}>Detalhes</Text>
        <View style={styles.grade}>
          <Item rotulo="Gravidade" valor={rotuloSeveridade[evento.severidade]} />
          <Item rotulo="Prioridade" valor={`${numero(evento.prioridade)} / 100`} />
          <Item rotulo="Nível" valor={rotuloNivel[evento.nivelAlerta]} />
          <Item rotulo="Situação" valor={evento.status === "ATIVO" ? "Ativo" : evento.status === "RESOLVIDO" ? "Resolvido" : "Descartado"} />
          <Item rotulo="Início" valor={dataHora(evento.criadoEm)} />
          <Item rotulo="Última atualização" valor={dataHora(evento.atualizadoEm)} />
        </View>
      </View>

      {/* Histórico das leituras da região */}
      {leituras.length > 1 && <GraficoLeituras leituras={leituras} />}

      {/* Ações */}
      {ativo && ehMorador && (
        <View style={styles.cartao}>
          <Text style={styles.cartaoTitulo}>Você está vendo isso?</Text>
          <Text style={styles.textoSec}>Sua resposta ajuda a confirmar ou derrubar o alerta. Ela é anônima.</Text>
          <View style={styles.acoes}>
            <Botao titulo="Sim, está acontecendo" icone="checkmark" variante="sucesso" carregando={enviando}
              onPress={() => acao(() => validarEvento(evento.id, usuario!.id, "CONFIRMAR"), "Obrigado! Sua confirmação aumentou a confiança do alerta.")} />
            <Botao titulo="Não está acontecendo" icone="close" variante="secundario" carregando={enviando}
              onPress={() => acao(() => validarEvento(evento.id, usuario!.id, "CONTESTAR"), "Obrigado! Registramos sua contestação.")} />
          </View>
        </View>
      )}

      {ativo && ehAgente && (
        <View style={styles.cartao}>
          <Text style={styles.cartaoTitulo}>Ações do agente local</Text>
          <View style={styles.acoes}>
            {!evento.validadoPorAgente && (
              <Botao titulo="Validar ocorrência" icone="shield-checkmark" variante="sucesso" carregando={enviando}
                dica="Aumenta a confiança e avisa os moradores"
                onPress={() => acao(() => validarEvento(evento.id, usuario!.id, "CONFIRMAR"), "Ocorrência validada. Moradores serão notificados.")} />
            )}
            {evento.origem === "COMUNIDADE" && (
              <Botao titulo="Descartar (falso alarme)" icone="trash" variante="perigo" carregando={enviando}
                onPress={() => acao(() => validarEvento(evento.id, usuario!.id, "CONTESTAR"), "Relato descartado.")} />
            )}
            <Campo rotulo="Observação (opcional)" value={observacao} onChangeText={setObservacao}
              placeholder="Ex.: equipe no local, água já baixou" />
            <Botao titulo="Marcar como resolvido" icone="checkmark-done" carregando={enviando}
              onPress={() => acao(() => resolverEvento(evento.id, usuario!.id, observacao), "Ocorrência encerrada.")} />
          </View>
        </View>
      )}

      {ativo && !usuario && (
        <Text style={styles.textoSec}>Entre com uma conta para confirmar ou contestar este alerta.</Text>
      )}
    </ScrollView>
  );
}

function Item({ rotulo, valor }: { rotulo: string; valor: string }) {
  return (
    <View style={styles.item} accessible accessibilityLabel={`${rotulo}: ${valor}`}>
      <Text style={styles.itemRotulo}>{rotulo}</Text>
      <Text style={styles.itemValor}>{valor}</Text>
    </View>
  );
}

function LinhaCalculo({ texto, valor }: { texto: string; valor: string }) {
  return (
    <View style={styles.calculoLinha}>
      <Text style={styles.calculoTexto}>{texto}</Text>
      <Text style={styles.calculoValor}>{valor}</Text>
    </View>
  );
}

/** Gráfico de barras simples com as últimas leituras (feito só com View, sem biblioteca). */
function GraficoLeituras({ leituras }: { leituras: Leitura[] }) {
  const energia = leituras[0].grandeza === "ENERGIA";
  const max = energia ? 1 : Math.max(...leituras.map((l) => l.valor), 1);
  const ultima = leituras[leituras.length - 1];
  const titulo = { NIVEL_AGUA: "Nível da água (cm)", TEMPERATURA: "Temperatura (°C)", ENERGIA: "Energia (1 = ok, 0 = falha)", PRECIPITACAO: "Chuva (mm/h)" }[ultima.grandeza];
  return (
    <View
      style={styles.cartao}
      accessible
      accessibilityLabel={`${titulo}: última leitura ${numero(ultima.valor)} ${ultima.unidade}, ${tempoRelativo(ultima.dataHora)}`}
    >
      <Text style={styles.cartaoTitulo}>Últimas leituras da região</Text>
      <Text style={styles.textoSec}>{titulo} · {ultima.fonte}</Text>
      <View style={styles.grafico}>
        {leituras.map((l) => (
          <View
            key={l.id}
            style={[styles.barra, {
              height: `${Math.max(3, (l.valor / max) * 100)}%`,
              backgroundColor: energia && l.valor < 0.5 ? "#B71C1C" : "#0B3954",
            }]}
          />
        ))}
      </View>
      <View style={styles.graficoLegenda}>
        <Text style={styles.textoSec}>{tempoRelativo(leituras[0].dataHora)}</Text>
        <Text style={styles.textoSec}>agora: {energia ? (ultima.valor >= 0.5 ? "ok" : "falha") : `${numero(ultima.valor)} ${ultima.unidade}`}</Text>
      </View>
    </View>
  );
}
