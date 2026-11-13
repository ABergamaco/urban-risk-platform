import React from "react";
import { Text, View } from "react-native";
import { Ionicons } from "@expo/vector-icons";

import { Indicadores } from "../interfaces/indicadores";
import { indicadoresStyles as styles } from "../styles/componentes.styles";
import { cores } from "../styles/theme";
import { numero } from "../utils/formatadores";

type Props = { dados: Indicadores; latenciaMs: number | null };

function idade(seg: number | null): string {
  if (seg === null) return "sem dados";
  if (seg < 60) return `há ${seg}s`;
  if (seg < 3600) return `há ${Math.floor(seg / 60)} min`;
  return `há ${Math.floor(seg / 3600)} h`;
}

function intervalo(seg: number): string {
  if (seg === 0) return "tempo real";
  return seg < 60 ? `a cada ${seg}s` : `a cada ${Math.round(seg / 60)} min`;
}

/** Os três indicadores do enunciado: tempo de atualização, qualidade dos alertas e facilidade de uso. */
export default function CardIndicadores({ dados, latenciaMs }: Props) {
  const t = dados.tempoAtualizacao;
  const q = dados.qualidade;
  return (
    <View style={styles.grade}>
      {/* Tempo de atualização */}
      <View style={styles.cartao} accessible accessibilityLabel={`Tempo de atualização: do sensor até o app em até ${t.tempoMaximoAteAppSegundos} segundos.`}>
        <View style={styles.topo}>
          <Ionicons name="timer-outline" size={22} color={cores.primaria} />
          <Text style={styles.titulo}>Tempo de atualização</Text>
        </View>
        <Text style={styles.destaque}>até {numero(t.tempoMaximoAteAppSegundos, 0)} s</Text>
        <Text style={styles.legenda}>do sensor até o alerta no app</Text>
        {t.fontes.map((f) => (
          <Linha key={f.origem} rotulo={f.nome} valor={`${intervalo(f.intervaloSegundos)} · ${idade(f.idadeUltimoDadoSegundos)}`} />
        ))}
        <Linha rotulo="Processamento por leitura" valor={`${numero(t.processamentoMedioMs)} ms`} />
        <Linha rotulo="Latência da API" valor={latenciaMs === null ? "-" : `${latenciaMs} ms`} />
      </View>

      {/* Qualidade dos alertas */}
      <View style={styles.cartao} accessible accessibilityLabel={`Qualidade dos alertas: confiança média ${q.confiancaMedia} por cento.`}>
        <View style={styles.topo}>
          <Ionicons name="shield-checkmark" size={22} color={cores.primaria} />
          <Text style={styles.titulo}>Qualidade dos alertas</Text>
        </View>
        <Text style={styles.destaque}>{numero(q.confiancaMedia, 0)}%</Text>
        <Text style={styles.legenda}>confiança média dos {q.alertasAtivos} alertas ativos</Text>
        <Linha rotulo="Com confiança alta" valor={`${numero(q.percentualConfiancaAlta, 0)}%`} />
        <Linha rotulo="Confirmados por outra fonte" valor={`${numero(q.percentualCorroborados, 0)}%`} />
        <Linha rotulo="Validados por agente" valor={`${q.validadosPorAgente}`} />
        <Linha rotulo="Falsos alarmes descartados" valor={`${q.descartadosFalsoAlarme} (${numero(q.taxaFalsoAlarme, 0)}%)`} />
        <Linha rotulo="Relatos repetidos agrupados" valor={`${q.relatosAgrupados}`} />
        <Linha rotulo="Com análise de tendência" valor={`${q.alertasComTendencia}`} />
        <Linha rotulo="Alertas preditivos" valor={`${q.alertasPreditivos}`} />
        {q.tempoMedioValidacaoMinutos !== null && (
          <Linha rotulo="Tempo médio até validação" valor={`${numero(q.tempoMedioValidacaoMinutos)} min`} />
        )}
      </View>

      {/* Facilidade de uso */}
      <View style={styles.cartao}>
        <View style={styles.topo}>
          <Ionicons name="accessibility" size={22} color={cores.primaria} />
          <Text style={styles.titulo}>Facilidade de uso</Text>
        </View>
        <Text style={styles.destaque}>4 passos</Text>
        <Text style={styles.legenda}>para relatar uma ocorrência</Text>
        <Linha rotulo="Ver um alerta" valor="1 toque" />
        <Linha rotulo="Nível do alerta" valor="cor + ícone + texto" />
        <Linha rotulo="Contraste" valor="WCAG AA (4,5:1)" />
        <Linha rotulo="Sem conexão" valor="mantém últimos dados" />
        <Linha rotulo="Relatos (24 h)" valor={`${dados.uso.relatos24h}`} />
      </View>
    </View>
  );
}

function Linha({ rotulo, valor }: { rotulo: string; valor: string }) {
  return (
    <View style={styles.linha}>
      <Text style={styles.linhaRotulo}>{rotulo}</Text>
      <Text style={styles.linhaValor}>{valor}</Text>
    </View>
  );
}
