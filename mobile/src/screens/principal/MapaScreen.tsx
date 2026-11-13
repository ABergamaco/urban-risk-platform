/**
 * MAPA - versão CELULAR (Android/iOS) com react-native-maps.
 * No navegador o Metro usa o MapaScreen.web.tsx no lugar deste arquivo.
 */
import React, { useState } from "react";
import { Text, View } from "react-native";
import MapView, { Callout, Circle, Marker } from "react-native-maps";
import { CompositeScreenProps } from "@react-navigation/native";
import { BottomTabScreenProps } from "@react-navigation/bottom-tabs";
import { NativeStackScreenProps } from "@react-navigation/native-stack";

import { RootStackParamList, TabParamList } from "../../navigation/types";
import { TipoRisco } from "../../types/tipoRisco";
import { useDadosMapa } from "../../hooks/useDadosMapa";
import { EstadoTela, FiltroMapa, LegendaMapa } from "../../components";
import { mapaStyles as styles } from "../../styles/mapa.styles";
import { coresNivel } from "../../styles/theme";
import { rotuloNivel, rotuloOrigem } from "../../utils/formatadores";
import { limitesRegioes, posicaoNoMapa } from "../../utils/mapa";

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
        <MapView
          style={{ flex: 1 }}
          initialRegion={{
            latitude: (lim.minLat + lim.maxLat) / 2,
            longitude: (lim.minLng + lim.maxLng) / 2,
            latitudeDelta: (lim.maxLat - lim.minLat) * 1.5 + 0.02,
            longitudeDelta: (lim.maxLng - lim.minLng) * 1.5 + 0.02,
          }}
        >
          {regioes.map((r) => {
            const cor = coresNivel[r.nivelRisco] ?? coresNivel.NORMAL;
            return (
              <Circle
                key={`regiao-${r.id}`}
                center={{ latitude: r.latitude, longitude: r.longitude }}
                radius={1300}
                strokeColor={cor.fundo}
                fillColor={`${cor.fundo}22`}
              />
            );
          })}
          {alertas.map((e) => (
            <Marker
              key={e.id}
              coordinate={posicaoNoMapa(e)}
              pinColor={(coresNivel[e.nivelAlerta] ?? coresNivel.INFORMATIVO).fundo}
              accessibilityLabel={`${e.titulo}, ${rotuloNivel[e.nivelAlerta]}`}
            >
              <Callout onPress={() => navigation.navigate("EventoDetalhe", { eventoId: e.id })}>
                <View style={styles.callout}>
                  <Text style={styles.calloutTitulo}>{e.titulo}</Text>
                  <Text style={styles.calloutTexto}>{rotuloNivel[e.nivelAlerta]} · confiança {e.confianca}%</Text>
                  <Text style={styles.calloutTexto}>Origem: {rotuloOrigem[e.origem]}</Text>
                  <Text style={styles.calloutLink}>Toque para ver detalhes</Text>
                </View>
              </Callout>
            </Marker>
          ))}
        </MapView>
        <LegendaMapa />
      </View>
    </View>
  );
}
