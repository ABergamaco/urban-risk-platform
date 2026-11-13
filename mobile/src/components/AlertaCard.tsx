import React from "react";
import { Pressable, Text, View } from "react-native";
import { Ionicons } from "@expo/vector-icons";

import { Evento } from "../interfaces/evento";
import { alertaCardStyles as styles } from "../styles/componentes.styles";
import { cores, coresNivel } from "../styles/theme";
import { iconeTipo, rotuloSeveridade, tempoRelativo, tendenciaInfo } from "../utils/formatadores";
import BadgeNivel from "./BadgeNivel";
import BarraConfianca from "./BarraConfianca";
import ChipOrigem from "./ChipOrigem";

type Props = {
  evento: Evento;
  onPress?: () => void;
  children?: React.ReactNode; // ações extras (ex.: botões do agente)
};

/** Card de alerta: nível, título, região, origem, confiança e selos. */
export default function AlertaCard({ evento, onPress, children }: Props) {
  const cor = coresNivel[evento.nivelAlerta] ?? coresNivel.INFORMATIVO;
  const tend = evento.tendencia ? tendenciaInfo[evento.tendencia] : undefined;
  return (
    <Pressable
      onPress={onPress}
      disabled={!onPress}
      accessibilityRole={onPress ? "button" : undefined}
      accessibilityLabel={`${evento.titulo}. ${evento.regiao.nome}. Gravidade ${rotuloSeveridade[evento.severidade]}. Confiança ${evento.confianca} por cento.`}
      accessibilityHint={onPress ? "Abre os detalhes do alerta" : undefined}
      style={({ pressed }) => [styles.card, pressed && { opacity: 0.85 }]}
    >
      <View style={[styles.faixa, { backgroundColor: cor.fundo }]} />
      <View style={styles.conteudo}>
        <View style={styles.topo}>
          <BadgeNivel nivel={evento.nivelAlerta} />
          <Text style={styles.prioridade}>Prioridade {Math.round(evento.prioridade)}</Text>
        </View>

        <View style={styles.tituloLinha}>
          <Ionicons name={iconeTipo[evento.tipo]} size={22} color={cores.primaria} />
          <Text style={styles.titulo}>{evento.titulo}</Text>
        </View>

        <Text style={styles.info}>
          {evento.regiao.nome} · {evento.regiao.zona} · Gravidade {rotuloSeveridade[evento.severidade].toLowerCase()} · {tempoRelativo(evento.atualizadoEm)}
        </Text>

        <ChipOrigem origem={evento.origem} fonte={evento.fonte} />

        {tend && (
          <View
            style={[styles.tendencia, { borderColor: tend.cor }]}
            accessible
            accessibilityLabel={`Tendência: ${tend.rotulo}. ${evento.previsaoTexto ?? ""}`}
          >
            <Ionicons name={tend.icone} size={18} color={tend.cor} />
            <Text style={[styles.tendenciaTexto, { color: tend.cor }]} numberOfLines={2}>
              {tend.rotulo}
              {evento.previsaoTexto ? ` · ${evento.previsaoTexto}` : ""}
            </Text>
          </View>
        )}
        <BarraConfianca confianca={evento.confianca} nivel={evento.nivelConfianca} />

        <View style={styles.selos}>
          {evento.validadoPorAgente && (
            <View style={styles.seloOk}>
              <Ionicons name="shield-checkmark" size={14} color={cores.sucesso} />
              <Text style={styles.seloOkTexto}>Validado por agente</Text>
            </View>
          )}
          {evento.fontesCorroborando > 0 && (
            <View style={styles.seloOk}>
              <Ionicons name="git-merge" size={14} color={cores.sucesso} />
              <Text style={styles.seloOkTexto}>
                +{evento.fontesCorroborando} fonte{evento.fontesCorroborando > 1 ? "s" : ""} confirma{evento.fontesCorroborando > 1 ? "m" : ""}
              </Text>
            </View>
          )}
          {evento.confirmacoes > 0 && (
            <View style={styles.seloOk}>
              <Ionicons name="people" size={14} color={cores.sucesso} />
              <Text style={styles.seloOkTexto}>{evento.confirmacoes} confirmaç{evento.confirmacoes > 1 ? "ões" : "ão"}</Text>
            </View>
          )}
          {evento.desatualizado && (
            <View style={styles.seloAviso}>
              <Ionicons name="time-outline" size={14} color={cores.aviso} />
              <Text style={styles.seloAvisoTexto}>Dado desatualizado</Text>
            </View>
          )}
        </View>
        {children}
      </View>
    </Pressable>
  );
}
