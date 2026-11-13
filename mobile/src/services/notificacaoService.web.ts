/**
 * Notificações no NAVEGADOR (Expo Web), usando a Notification API do browser.
 * O Metro escolhe este arquivo automaticamente quando o app roda na web.
 *
 * Obs.: o navegador pede permissão na primeira vez. Se o usuário negar,
 * o app continua mostrando o banner de alerta dentro da própria tela.
 */
let callbackToque: ((eventoId: number) => void) | null = null;

export async function pedirPermissaoNotificacao(): Promise<boolean> {
  if (typeof window === "undefined" || !("Notification" in window)) return false;
  if (Notification.permission === "granted") return true;
  if (Notification.permission === "denied") return false;
  const resultado = await Notification.requestPermission();
  return resultado === "granted";
}

export async function notificar(titulo: string, corpo: string, eventoId: number): Promise<void> {
  if (typeof window === "undefined" || !("Notification" in window)) return;
  if (Notification.permission !== "granted") return;
  const n = new Notification(titulo, { body: corpo, tag: `evento-${eventoId}` });
  n.onclick = () => {
    window.focus();
    callbackToque?.(eventoId);
    n.close();
  };
}

export function aoTocarNotificacao(callback: (eventoId: number) => void): () => void {
  callbackToque = callback;
  return () => {
    callbackToque = null;
  };
}
