/**
 * Notificações no CELULAR/EMULADOR (Android e iOS) com expo-notifications.
 * No navegador o Metro usa o arquivo notificacaoService.web.ts no lugar deste.
 *
 * São notificações LOCAIS: o próprio app consulta o backend e, quando chega um
 * alerta grave, mostra a notificação do sistema. Funcionam no Expo Go.
 */
import * as Notifications from "expo-notifications";
import { Platform } from "react-native";

Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowBanner: true,
    shouldShowList: true,
    shouldPlaySound: true,
    shouldSetBadge: false,
  }),
});

export async function pedirPermissaoNotificacao(): Promise<boolean> {
  if (Platform.OS === "android") {
    await Notifications.setNotificationChannelAsync("alertas", {
      name: "Alertas de risco",
      importance: Notifications.AndroidImportance.MAX,
    });
  }
  const atual = await Notifications.getPermissionsAsync();
  if (atual.granted) return true;
  const pedido = await Notifications.requestPermissionsAsync();
  return pedido.granted;
}

export async function notificar(titulo: string, corpo: string, eventoId: number): Promise<void> {
  await Notifications.scheduleNotificationAsync({
    content: { title: titulo, body: corpo, data: { eventoId } },
    trigger: null, // mostrar agora
  });
}

/** Chama o callback quando o usuário toca na notificação. Retorna função para cancelar. */
export function aoTocarNotificacao(callback: (eventoId: number) => void): () => void {
  const assinatura = Notifications.addNotificationResponseReceivedListener((resposta) => {
    const id = resposta.notification.request.content.data?.eventoId;
    if (typeof id === "number") callback(id);
  });
  return () => assinatura.remove();
}
