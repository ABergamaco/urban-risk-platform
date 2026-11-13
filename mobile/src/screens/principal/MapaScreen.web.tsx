/**
 * MAPA - versão NAVEGADOR (Expo Web).
 * O Metro usa este arquivo na web e o MapaScreen.tsx no celular.
 *
 * Usa Leaflet + OpenStreetMap (gratuitos, sem chave de API), porque o
 * react-native-maps não funciona no navegador.
 */
import "leaflet/dist/leaflet.css";
import React, { useState } from "react";
import { View } from "react-native";
import { Circle, CircleMarker, MapContainer, Popup, TileLayer, Tooltip } from "react-leaflet";
import { CompositeScreenProps } from "@react-navigation/native";
import { BottomTabScreenProps } from "@react-navigation/bottom-tabs";
import { NativeStackScreenProps } from "@react-navigation/native-stack";

import { RootStackParamList, TabParamList } from "../../navigation/types";
import { TipoRisco } from "../../types/tipoRisco";
import { useDadosMapa } from "../../hooks/useDadosMapa";
import { EstadoTela, FiltroMapa, LegendaMapa } from "../../components";
import { mapaStyles as styles } from "../../styles/mapa.styles";
import { cores, coresNivel } from "../../styles/theme";
import { rotuloNivel, rotuloOrigem, tempoRelativo } from "../../utils/formatadores";
import { limitesRegioes, posicaoNoMapa, raioMarcador } from "../../utils/mapa";

type Props = CompositeScreenProps<
  BottomTabScreenProps<TabParamList, "Mapa">,
  NativeStackScreenProps<RootStackParamList>
>;

export default function MapaScreen({ navigation }: Props) {
  const [tipo, setTipo] = useState<TipoRisco | "TODOS">("TODOS");
  const { alertas, regioes, erro, carregando, carregar } = useDadosMapa(tipo);

  if (carregando || (erro && alertas.length === 0)) {
    return <EstadoTela carregando={carregando} erro={erro} onTentarNovamente={carregar} />;
  }

  const lim = limitesRegioes(regioes);

  return (
    <View style={styles.container}>
      <FiltroMapa tipo={tipo} onTipo={setTipo} quantidade={alertas.length} />
      <View style={styles.mapa}>
        <MapContainer
          bounds={[[lim.minLat, lim.minLng], [lim.maxLat, lim.maxLng]]}
          boundsOptions={{ padding: [30, 30] }}
          style={{ height: "100%", width: "100%" }}
        >
          <TileLayer
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          />

          {/* Áreas das regiões, coloridas pelo pior alerta ativo */}
          {regioes.map((r) => {
            const cor = coresNivel[r.nivelRisco] ?? coresNivel.NORMAL;
            return (
              <Circle
                key={`regiao-${r.id}`}
                center={[r.latitude, r.longitude]}
                radius={1300}
                pathOptions={{ color: cor.fundo, fillColor: cor.fundo, fillOpacity: 0.12, weight: 1 }}
              >
                <Tooltip direction="top" offset={[0, -10]}>
                  {r.nome}: {rotuloNivel[r.nivelRisco]} ({r.alertasAtivos} alerta(s))
                </Tooltip>
              </Circle>
            );
          })}

          {/* Um ponto por alerta */}
          {alertas.map((e) => {
            const pos = posicaoNoMapa(e);
            const cor = coresNivel[e.nivelAlerta] ?? coresNivel.INFORMATIVO;
            return (
              <CircleMarker
                key={e.id}
                center={[pos.latitude, pos.longitude]}
                radius={raioMarcador(e)}
                pathOptions={{ color: "#FFFFFF", weight: 3, fillColor: cor.fundo, fillOpacity: 1 }}
              >
                <Popup>
                  <div style={{ fontFamily: "sans-serif", maxWidth: 240 }}>
                    <div style={{ fontWeight: "bold", color: cor.fundo, fontSize: 12, textTransform: "uppercase" }}>
                      {rotuloNivel[e.nivelAlerta]} · prioridade {Math.round(e.prioridade)}
                    </div>
                    <div style={{ fontWeight: "bold", fontSize: 15, margin: "4px 0" }}>{e.titulo}</div>
                    <div style={{ fontSize: 13 }}>
                      Origem: {rotuloOrigem[e.origem]} ({e.fonte})<br />
                      Confiança: {e.confianca}% · {tempoRelativo(e.atualizadoEm)}
                    </div>
                    <button
                      onClick={() => navigation.navigate("EventoDetalhe", { eventoId: e.id })}
                      style={{
                        marginTop: 8, width: "100%", minHeight: 40, border: "none", borderRadius: 8,
                        background: cores.primaria, color: "#fff", fontWeight: "bold", cursor: "pointer",
                      }}
                    >
                      Ver detalhes
                    </button>
                  </div>
                </Popup>
              </CircleMarker>
            );
          })}
        </MapContainer>
        <LegendaMapa />
      </View>
    </View>
  );
}
