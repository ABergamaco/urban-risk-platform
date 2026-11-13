import React, { useEffect, useState } from "react";
import { KeyboardAvoidingView, Platform, ScrollView, Text, View } from "react-native";
import { NativeStackScreenProps } from "@react-navigation/native-stack";

import { RootStackParamList } from "../../navigation/types";
import { useSessao } from "../../context/SessaoContext";
import { Regiao } from "../../interfaces/regiao";
import { Perfil } from "../../types/perfil";
import { listarRegioes } from "../../services/regiaoService";
import { cadastrarUsuario } from "../../services/usuarioService";
import { mensagemErroApi } from "../../utils/apiErro";
import { Botao, Campo, Mensagem, Seletor } from "../../components";
import { formStyles as styles } from "../../styles/auth.styles";

type Props = NativeStackScreenProps<RootStackParamList, "Cadastro">;

export default function CadastroScreen({ navigation }: Props) {
  const { entrar } = useSessao();
  const [nome, setNome] = useState("");
  const [email, setEmail] = useState("");
  const [senha, setSenha] = useState("");
  const [perfil, setPerfil] = useState<Perfil>("MORADOR");
  const [codigoAgente, setCodigoAgente] = useState("");
  const [regiaoId, setRegiaoId] = useState<number | null>(null);
  const [regioes, setRegioes] = useState<Regiao[]>([]);
  const [carregando, setCarregando] = useState(false);
  const [erro, setErro] = useState<string | null>(null);

  useEffect(() => {
    listarRegioes().then(setRegioes).catch(() => setRegioes([]));
  }, []);

  async function handleCadastrar() {
    setErro(null);
    if (nome.trim().length < 3) return setErro("Informe seu nome (mínimo 3 letras).");
    if (!email.includes("@")) return setErro("Informe um e-mail válido.");
    if (senha.length < 6) return setErro("A senha precisa ter pelo menos 6 caracteres.");
    if (perfil === "AGENTE" && !codigoAgente.trim()) return setErro("Agentes locais precisam do código do órgão.");

    setCarregando(true);
    try {
      const usuario = await cadastrarUsuario({
        nome: nome.trim(),
        email: email.trim(),
        senha,
        perfil,
        regiaoId: regiaoId ?? undefined,
        codigoAgente: perfil === "AGENTE" ? codigoAgente.trim() : undefined,
      });
      entrar(usuario);
    } catch (e) {
      setErro(mensagemErroApi(e, "Não foi possível criar a conta."));
    } finally {
      setCarregando(false);
    }
  }

  return (
    <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === "ios" ? "padding" : undefined}>
      <ScrollView contentContainerStyle={styles.container} keyboardShouldPersistTaps="handled">
        <View style={styles.cartao}>
          <Text style={styles.titulo} accessibilityRole="header">Criar conta</Text>
          <Text style={styles.subtitulo}>Seu nome nunca aparece nos relatos públicos.</Text>

          <Campo rotulo="Nome" value={nome} onChangeText={setNome} autoComplete="name" />
          <Campo
            rotulo="E-mail"
            value={email}
            onChangeText={setEmail}
            keyboardType="email-address"
            autoCapitalize="none"
            autoComplete="email"
          />
          <Campo rotulo="Senha" value={senha} onChangeText={setSenha} secureTextEntry ajuda="Mínimo de 6 caracteres" />

          <Text style={styles.secao}>Eu sou</Text>
          <Seletor<Perfil>
            rotuloGrupo="Perfil"
            selecionado={perfil}
            onSelecionar={setPerfil}
            opcoes={[
              { valor: "MORADOR", rotulo: "Morador", icone: "home" },
              { valor: "AGENTE", rotulo: "Agente local", icone: "shield-checkmark" },
            ]}
          />
          <View style={styles.espaco} />

          {perfil === "AGENTE" && (
            <Campo
              rotulo="Código do agente"
              value={codigoAgente}
              onChangeText={setCodigoAgente}
              autoCapitalize="characters"
              ajuda="Fornecido pela Defesa Civil/subprefeitura. Demonstração: DEFESA2026"
            />
          )}

          {regioes.length > 0 && (
            <>
              <Text style={styles.secao}>Meu bairro (opcional)</Text>
              <Seletor<number | null>
                rotuloGrupo="Bairro"
                selecionado={regiaoId}
                onSelecionar={setRegiaoId}
                opcoes={[{ valor: null, rotulo: "Nenhum" }, ...regioes.map((r) => ({ valor: r.id, rotulo: r.nome }))]}
              />
              <View style={styles.espaco} />
            </>
          )}

          {erro && <Mensagem tipo="erro" texto={erro} />}

          <View style={styles.rodape}>
            <Botao titulo="Criar conta" icone="person-add" onPress={handleCadastrar} carregando={carregando} />
            <Text style={styles.link} accessibilityRole="link" onPress={() => navigation.replace("Login")}>
              Já tenho conta
            </Text>
          </View>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}
