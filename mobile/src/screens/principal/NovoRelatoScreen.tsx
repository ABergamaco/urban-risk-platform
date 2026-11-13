import React, { useEffect, useState } from "react";
import { Pressable, ScrollView, Text, View } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { CompositeScreenProps } from "@react-navigation/native";
import { BottomTabScreenProps } from "@react-navigation/bottom-tabs";
import { NativeStackScreenProps } from "@react-navigation/native-stack";

import { RootStackParamList, TabParamList } from "../../navigation/types";
import { useSessao } from "../../context/SessaoContext";
import { Evento } from "../../interfaces/evento";
import { Regiao } from "../../interfaces/regiao";
import { TipoRisco, TIPOS_RISCO } from "../../types/tipoRisco";
import { Severidade } from "../../types/severidade";
import { listarRegioes } from "../../services/regiaoService";
import { enviarRelato } from "../../services/relatoService";
import { mensagemErroApi } from "../../utils/apiErro";
import { iconeTipo, rotuloTipo } from "../../utils/formatadores";
import { AlertaCard, Botao, Campo, EstadoTela, Mensagem, Seletor } from "../../components";
import { relatoStyles as styles } from "../../styles/relato.styles";
import { cores } from "../../styles/theme";

type Props = CompositeScreenProps<
  BottomTabScreenProps<TabParamList, "Relatar">,
  NativeStackScreenProps<RootStackParamList>
>;

const MAX = 500;

/** Registro comunitário: o morador informa o que está vendo na rua. */
export default function NovoRelatoScreen({ navigation }: Props) {
  const { usuario } = useSessao();
  const [regioes, setRegioes] = useState<Regiao[]>([]);
  const [tipo, setTipo] = useState<TipoRisco | null>(null);
  const [regiaoId, setRegiaoId] = useState<number | null>(usuario?.regiao?.id ?? null);
  const [severidade, setSeveridade] = useState<Severidade>("MODERADA");
  const [descricao, setDescricao] = useState("");
  const [enviando, setEnviando] = useState(false);
  const [erro, setErro] = useState<string | null>(null);
  const [resultado, setResultado] = useState<Evento | null>(null);
  const [carregandoRegioes, setCarregandoRegioes] = useState(true);

  useEffect(() => {
    listarRegioes()
      .then(setRegioes)
      .catch((e) => setErro(mensagemErroApi(e, "Não foi possível carregar as regiões.")))
      .finally(() => setCarregandoRegioes(false));
  }, []);

  async function handleEnviar() {
    setErro(null);
    if (!tipo) return setErro("Escolha o tipo de ocorrência.");
    if (!regiaoId) return setErro("Escolha o bairro da ocorrência.");
    if (descricao.trim().length < 10) return setErro("Descreva em pelo menos 10 caracteres o que está vendo.");
    if (!usuario) return;

    setEnviando(true);
    try {
      const evento = await enviarRelato({ usuarioId: usuario.id, regiaoId, tipo, descricao: descricao.trim(), severidade });
      setResultado(evento);
      setDescricao("");
      setTipo(null);
    } catch (e) {
      setErro(mensagemErroApi(e, "Não foi possível enviar o relato."));
    } finally {
      setEnviando(false);
    }
  }

  if (carregandoRegioes) return <EstadoTela carregando />;

  // Tela de sucesso
  if (resultado) {
    const somado = resultado.confirmacoes > 0; // evento novo começa com 0 confirmações
    return (
      <ScrollView contentContainerStyle={styles.container}>
        <View style={[styles.cartao, styles.sucesso]}>
          <Ionicons name="checkmark-circle" size={56} color={cores.sucesso} style={{ alignSelf: "center" }} />
          <Text style={[styles.titulo, { textAlign: "center" }]} accessibilityRole="header">Relato enviado. Obrigado!</Text>
          <Mensagem
            tipo="sucesso"
            texto={
              somado
                ? "Já existia um relato parecido nesta região. O seu foi somado como confirmação e a confiança do alerta subiu."
                : `Seu relato virou um alerta com confiança inicial de ${resultado.confianca}%. Ela sobe quando vizinhos confirmam, quando um sensor indica o mesmo risco ou quando um agente valida.`
            }
          />
          <AlertaCard evento={resultado} onPress={() => navigation.navigate("EventoDetalhe", { eventoId: resultado.id })} />
          <Botao titulo="Fazer outro relato" icone="add" variante="secundario" onPress={() => setResultado(null)} />
        </View>
      </ScrollView>
    );
  }

  return (
    <ScrollView contentContainerStyle={styles.container} keyboardShouldPersistTaps="handled">
      <View style={styles.cartao}>
        <Text style={styles.titulo} accessibilityRole="header">Relatar ocorrência</Text>
        <Text style={styles.subtitulo}>Conte o que está acontecendo agora na sua rua.</Text>

        <Text style={styles.secao}>1. O que está acontecendo?</Text>
        <View style={styles.tipos} accessibilityRole="radiogroup">
          {TIPOS_RISCO.map((t) => {
            const ativo = tipo === t;
            return (
              <Pressable
                key={t}
                onPress={() => setTipo(t)}
                style={[styles.tipo, ativo && styles.tipoAtivo]}
                accessibilityRole="radio"
                accessibilityState={{ selected: ativo, checked: ativo }}
                accessibilityLabel={rotuloTipo[t]}
              >
                <Ionicons name={iconeTipo[t]} size={32} color={ativo ? "#FFFFFF" : cores.primaria} />
                <Text style={[styles.tipoTexto, ativo && styles.tipoTextoAtivo]}>{rotuloTipo[t]}</Text>
              </Pressable>
            );
          })}
        </View>

        <Text style={styles.secao}>2. Onde?</Text>
        <Seletor<number | null>
          rotuloGrupo="Bairro"
          selecionado={regiaoId}
          onSelecionar={setRegiaoId}
          opcoes={regioes.map((r) => ({ valor: r.id, rotulo: r.nome, icone: "location" as const }))}
        />

        <Text style={styles.secao}>3. Quão grave parece?</Text>
        <Seletor<Severidade>
          rotuloGrupo="Gravidade"
          selecionado={severidade}
          onSelecionar={setSeveridade}
          opcoes={[
            { valor: "BAIXA", rotulo: "Pouco" },
            { valor: "MODERADA", rotulo: "Moderado" },
            { valor: "ALTA", rotulo: "Muito grave" },
          ]}
        />

        <Text style={styles.secao}>4. Descreva</Text>
        <Campo
          rotulo="Descrição"
          multilinha
          value={descricao}
          onChangeText={(t) => setDescricao(t.slice(0, MAX))}
          placeholder="Ex.: Água na altura da calçada na Rua X, perto do mercado."
        />
        <Text style={styles.contador}>{descricao.length}/{MAX}</Text>

        <View style={styles.lgpd}>
          <Ionicons name="lock-closed" size={18} color={cores.primaria} />
          <Text style={styles.lgpdTexto}>
            Seu nome e e-mail não aparecem para ninguém. O relato é publicado como "Relato de morador (anônimo)"
            e a localização é aproximada (~100 m).
          </Text>
        </View>

        {erro && <Mensagem tipo="erro" texto={erro} />}
        <View style={{ height: 10 }} />
        <Botao titulo="Enviar relato" icone="send" onPress={handleEnviar} carregando={enviando} />
      </View>
    </ScrollView>
  );
}
