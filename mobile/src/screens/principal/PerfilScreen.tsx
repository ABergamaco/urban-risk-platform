import React, { useEffect, useState } from "react";
import { ScrollView, Text, View } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { CompositeScreenProps } from "@react-navigation/native";
import { BottomTabScreenProps } from "@react-navigation/bottom-tabs";
import { NativeStackScreenProps } from "@react-navigation/native-stack";

import { RootStackParamList, TabParamList } from "../../navigation/types";
import { useSessao } from "../../context/SessaoContext";
import { Regiao } from "../../interfaces/regiao";
import { TipoRisco } from "../../types/tipoRisco";
import { listarRegioes } from "../../services/regiaoService";
import { simularEvento } from "../../services/eventoService";
import { mensagemErroApi } from "../../utils/apiErro";
import { Botao, Mensagem, Seletor } from "../../components";
import { perfilStyles as styles } from "../../styles/perfil.styles";
import { cores } from "../../styles/theme";

type Props = CompositeScreenProps<
  BottomTabScreenProps<TabParamList, "Perfil">,
  NativeStackScreenProps<RootStackParamList>
>;

export default function PerfilScreen({ navigation }: Props) {
  const { usuario, sair } = useSessao();
  const [regioes, setRegioes] = useState<Regiao[]>([]);
  const [regiaoSim, setRegiaoSim] = useState<number | null>(null);
  const [tipoSim, setTipoSim] = useState<TipoRisco>("ALAGAMENTO");
  const [modoSim, setModoSim] = useState<"IMEDIATO" | "GRADUAL">("IMEDIATO");
  const [simulando, setSimulando] = useState(false);
  const [mensagem, setMensagem] = useState<{ tipo: "erro" | "sucesso"; texto: string } | null>(null);

  useEffect(() => {
    listarRegioes()
      .then((r) => {
        setRegioes(r);
        setRegiaoSim(r[0]?.id ?? null);
      })
      .catch(() => setRegioes([]));
  }, []);

  async function handleSimular() {
    if (!regiaoSim) return;
    setSimulando(true);
    setMensagem(null);
    try {
      const gradual = tipoSim === "ALAGAMENTO" && modoSim === "GRADUAL";
      const evento = await simularEvento(regiaoSim, tipoSim, gradual ? "GRADUAL" : "IMEDIATO");
      setMensagem({
        tipo: "sucesso",
        texto: gradual
          ? `${evento.fonte}: a água começou a subir. Em ~1 min a análise de tendência mostra a previsão, e o alerta preditivo é enviado antes de ficar grave.`
          : `${evento.fonte} disparou "${evento.titulo}". A notificação chega em até 15 segundos.`,
      });
    } catch (e) {
      setMensagem({ tipo: "erro", texto: mensagemErroApi(e, "Não foi possível simular o evento.") });
    } finally {
      setSimulando(false);
    }
  }

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <View style={styles.cartao}>
        {usuario ? (
          <View style={styles.linha}>
            <Ionicons name={usuario.perfil === "AGENTE" ? "shield-checkmark" : "person-circle"} size={56} color={cores.primaria} />
            <View style={{ flex: 1 }}>
              <Text style={styles.nome}>{usuario.nome}</Text>
              <Text style={styles.info}>{usuario.perfil === "AGENTE" ? "Agente local" : "Morador"}</Text>
              <Text style={styles.info}>{usuario.email}</Text>
              {usuario.regiao && <Text style={styles.info}>Bairro: {usuario.regiao.nome}</Text>}
            </View>
          </View>
        ) : (
          <>
            <Text style={styles.titulo}>Você está como visitante</Text>
            <Text style={styles.texto}>Entre para enviar relatos e confirmar alertas da sua região.</Text>
          </>
        )}
        <Botao
          titulo={usuario ? "Sair" : "Entrar ou criar conta"}
          icone={usuario ? "log-out" : "log-in"}
          variante={usuario ? "secundario" : "primario"}
          onPress={sair}
        />
      </View>

      <View style={styles.cartao}>
        <Text style={styles.titulo}>Seus dados (LGPD)</Text>
        <Text style={styles.texto}>• Relatos são públicos só como "Relato de morador (anônimo)": nome e e-mail nunca aparecem.</Text>
        <Text style={styles.texto}>• A localização do relato é arredondada (~100 m) para não expor seu endereço.</Text>
        <Text style={styles.texto}>• A senha é guardada apenas como hash criptográfico (SHA-256 com salt).</Text>
        <Text style={styles.texto}>• Seu voto (confirmar/contestar) é anônimo e só serve para evitar votos repetidos.</Text>
      </View>

      <View style={styles.cartao}>
        <Text style={styles.titulo}>Modo demonstração</Text>
        <Text style={styles.texto}>
          Força um cenário crítico nos sensores simulados para mostrar o alerta, a notificação e a priorização ao vivo.
        </Text>
        <Text style={styles.rotulo}>Região</Text>
        <Seletor<number | null>
          rotuloGrupo="Região da simulação"
          selecionado={regiaoSim}
          onSelecionar={setRegiaoSim}
          opcoes={regioes.map((r) => ({ valor: r.id, rotulo: r.nome }))}
        />
        <Text style={styles.rotulo}>Cenário</Text>
        <Seletor<TipoRisco>
          rotuloGrupo="Cenário da simulação"
          selecionado={tipoSim}
          onSelecionar={setTipoSim}
          opcoes={[
            { valor: "ALAGAMENTO", rotulo: "Alagamento", icone: "water" },
            { valor: "ILHA_DE_CALOR", rotulo: "Onda de calor", icone: "sunny" },
            { valor: "INTERRUPCAO_SERVICO", rotulo: "Queda de energia", icone: "flash-off" },
          ]}
        />
        {tipoSim === "ALAGAMENTO" && (
          <>
            <Text style={styles.rotulo}>Como a água sobe</Text>
            <Seletor<"IMEDIATO" | "GRADUAL">
              rotuloGrupo="Modo da simulação"
              selecionado={modoSim}
              onSelecionar={setModoSim}
              opcoes={[
                { valor: "IMEDIATO", rotulo: "De uma vez (crítico)" },
                { valor: "GRADUAL", rotulo: "Aos poucos (tendência)", icone: "trending-up" },
              ]}
            />
          </>
        )}
        {mensagem && <Mensagem tipo={mensagem.tipo} texto={mensagem.texto} />}
        <Botao titulo="Simular evento" icone="flask" onPress={handleSimular} carregando={simulando} desabilitado={!regiaoSim} />
        <Botao titulo="Ver alertas" icone="list" variante="secundario" onPress={() => navigation.navigate("Alertas")} />
      </View>
    </ScrollView>
  );
}
