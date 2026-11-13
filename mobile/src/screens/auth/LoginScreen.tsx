import React, { useState } from "react";
import { KeyboardAvoidingView, Platform, ScrollView, Text, View } from "react-native";
import { NativeStackScreenProps } from "@react-navigation/native-stack";

import { RootStackParamList } from "../../navigation/types";
import { useSessao } from "../../context/SessaoContext";
import { login } from "../../services/usuarioService";
import { mensagemErroApi } from "../../utils/apiErro";
import { Botao, Campo, Mensagem } from "../../components";
import { formStyles as styles } from "../../styles/auth.styles";

type Props = NativeStackScreenProps<RootStackParamList, "Login">;

export default function LoginScreen({ navigation }: Props) {
  const { entrar } = useSessao();
  const [email, setEmail] = useState("");
  const [senha, setSenha] = useState("");
  const [carregando, setCarregando] = useState(false);
  const [erro, setErro] = useState<string | null>(null);

  async function handleEntrar() {
    if (!email.trim() || !senha) {
      setErro("Preencha e-mail e senha.");
      return;
    }
    setCarregando(true);
    setErro(null);
    try {
      const usuario = await login(email.trim(), senha);
      entrar(usuario); // o App troca para a área principal automaticamente
    } catch (e) {
      setErro(mensagemErroApi(e, "Não foi possível entrar."));
    } finally {
      setCarregando(false);
    }
  }

  return (
    <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === "ios" ? "padding" : undefined}>
      <ScrollView contentContainerStyle={styles.container} keyboardShouldPersistTaps="handled">
        <View style={styles.cartao}>
          <Text style={styles.titulo} accessibilityRole="header">Entrar</Text>
          <Text style={styles.subtitulo}>Moradores e agentes locais usam o mesmo acesso.</Text>

          <Campo
            rotulo="E-mail"
            value={email}
            onChangeText={setEmail}
            keyboardType="email-address"
            autoCapitalize="none"
            autoComplete="email"
            placeholder="voce@email.com"
          />
          <Campo
            rotulo="Senha"
            value={senha}
            onChangeText={setSenha}
            secureTextEntry
            autoComplete="password"
            onSubmitEditing={handleEntrar}
          />

          {erro && <Mensagem tipo="erro" texto={erro} />}

          <View style={styles.rodape}>
            <Botao titulo="Entrar" icone="log-in" onPress={handleEntrar} carregando={carregando} />
            <Text style={styles.link} accessibilityRole="link" onPress={() => navigation.replace("Cadastro")}>
              Não tem conta? Cadastre-se
            </Text>
          </View>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}
