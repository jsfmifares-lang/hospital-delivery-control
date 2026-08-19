import { toast } from "sonner";

let swRegistration: ServiceWorkerRegistration | null = null;
let audioCtx: AudioContext | null = null;
const isEdge = navigator.userAgent.includes("Edg/");

async function initServiceWorker() {
  if ("serviceWorker" in navigator && !swRegistration) {
    try {
      swRegistration = await navigator.serviceWorker.register("/sw.js");
      await navigator.serviceWorker.ready;
    } catch (e) {}
  }
  return swRegistration;
}

function getAudioCtx(): AudioContext {
  if (!audioCtx) {
    audioCtx = new (window.AudioContext || (window as any).webkitAudioContext)();
  }
  if (audioCtx.state === "suspended") {
    audioCtx.resume();
  }
  return audioCtx;
}

function playNotificationSound() {
  try {
    const ctx = getAudioCtx();
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.type = "sine";
    const now = ctx.currentTime;
    osc.frequency.setValueAtTime(880, now);
    osc.frequency.setValueAtTime(1100, now + 0.08);
    osc.frequency.setValueAtTime(880, now + 0.16);
    osc.frequency.setValueAtTime(1320, now + 0.24);
    gain.gain.setValueAtTime(0.5, now);
    gain.gain.exponentialRampToValueAtTime(0.01, now + 0.4);
    osc.start(now);
    osc.stop(now + 0.4);
  } catch (e) {}
}

function showToast(title: string, msg: string, color: string, isError = false) {
  if (isEdge) return;
  const fn = isError ? toast.error : toast.success;
  fn(title, {
    description: msg,
    style: {
      background: color,
      color: "#fff",
      border: "none",
      fontSize: "14px",
    },
    duration: Infinity,
    action: { label: "Fechar", onClick: () => {} },
  });
}

async function showWinNotification(title: string, body: string) {
  playNotificationSound();
  console.log("Notificacao:", title, "| Permissao:", Notification.permission, "| Edge:", isEdge);

  if (!("Notification" in window)) {
    console.log("Notification API indisponivel, usando SW");
    await tryViaSW(title, body);
    return;
  }

  if (Notification.permission === "granted") {
    try {
      const n = new Notification(title, {
        body,
        icon: "/favicon.ico",
        requireInteraction: true,
        silent: true,
      });
      n.onclick = () => { window.focus(); n.close(); };
      console.log("Notificacao criada com sucesso");
    } catch (e) {
      console.log("Erro ao criar notificacao, usando SW:", e);
      await tryViaSW(title, body);
    }
  } else if (Notification.permission === "default") {
    console.log("Pedindo permissao...");
    const perm = await Notification.requestPermission();
    console.log("Permissao obtida:", perm);
    if (perm === "granted") {
      try {
        const n = new Notification(title, {
          body,
          icon: "/favicon.ico",
          requireInteraction: true,
          silent: true,
        });
        n.onclick = () => { window.focus(); n.close(); };
      } catch (e) {
        await tryViaSW(title, body);
      }
    }
  } else {
    console.log("Notificacoes bloqueadas, usando SW");
    await tryViaSW(title, body);
  }
}

async function tryViaSW(title: string, body: string) {
  try {
    const reg = await initServiceWorker();
    if (reg?.active) {
      reg.active.postMessage({ type: "SHOW_NOTIFICATION", title, body, icon: "/favicon.ico" });
    }
  } catch (e) {}
}

export function notifyCreated(username: string, hospitalName: string) {
  const msg = `${username} criou nova entrega em ${hospitalName}`;
  showWinNotification("Nova Entrega", msg);
}

export function notifyStatusUpdated(
  username: string,
  hospitalName: string,
  newStatus: string,
  count: number
) {
  const suffix = count > 1 ? ` (${count} entregas)` : "";
  const msg = `${username} atualizou ${hospitalName}${suffix} para "${newStatus}"`;
  showWinNotification("Status Atualizado", msg);
}

export function notifyHospitalCreated(username: string, hospitalName: string) {
  const msg = `${username} cadastrou ${hospitalName}`;
  showWinNotification("Hospital Cadastrado", msg);
}

export function notifyHospitalUpdated(username: string, hospitalName: string) {
  const msg = `${username} atualizou ${hospitalName}`;
  showWinNotification("Hospital Atualizado", msg);
}

export function notifyHospitalDeleted(username: string, hospitalName: string) {
  const msg = `${username} excluiu ${hospitalName}`;
  showWinNotification("Hospital Excluido", msg);
}

export function requestNotificationPermission() {
  initServiceWorker();
  if ("Notification" in window && Notification.permission === "default") {
    Notification.requestPermission();
  }
}
