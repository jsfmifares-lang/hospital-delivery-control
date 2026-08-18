import { toast } from "sonner";

let swRegistration: ServiceWorkerRegistration | null = null;
const isEdge = navigator.userAgent.includes("Edg/");

async function initServiceWorker() {
  if ("serviceWorker" in navigator && !swRegistration) {
    try {
      swRegistration = await navigator.serviceWorker.register("/sw.js");
    } catch (e) {
      console.log("SW error:", e);
    }
  }
}

function playNotificationSound() {
  try {
    const ctx = new (window.AudioContext || (window as any).webkitAudioContext)();
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
    setTimeout(() => ctx.close(), 500);
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

function showWinNotification(title: string, body: string) {
  if (!("Notification" in window)) return;

  playNotificationSound();

  if (Notification.permission === "granted") {
    try {
      const n = new Notification(title, {
        body,
        icon: "/favicon.ico",
        requireInteraction: true,
        silent: true,
      });
      n.onclick = () => { window.focus(); n.close(); };
    } catch (e) {
      tryViaSW(title, body);
    }
  } else if (Notification.permission === "default") {
    Notification.requestPermission().then((perm) => {
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
          tryViaSW(title, body);
        }
      }
    });
  } else {
    tryViaSW(title, body);
  }
}

async function tryViaSW(title: string, body: string) {
  try {
    await initServiceWorker();
    if (swRegistration?.active) {
      swRegistration.active.postMessage({ type: "SHOW_NOTIFICATION", title, body, icon: "/favicon.ico" });
    }
  } catch (e) {}
}

export function notifyCreated(username: string, hospitalName: string) {
  const msg = `${username} criou nova entrega em ${hospitalName}`;
  showToast("Nova Entrega", msg, "linear-gradient(135deg, #22c55e 0%, #16a34a 100%)");
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
  showToast("Status Atualizado", msg, "linear-gradient(135deg, #3b82f6 0%, #2563eb 100%)");
  showWinNotification("Status Atualizado", msg);
}

export function notifyHospitalCreated(username: string, hospitalName: string) {
  const msg = `${username} cadastrou ${hospitalName}`;
  showToast("Hospital Cadastrado", msg, "linear-gradient(135deg, #8b5cf6 0%, #7c3aed 100%)");
  showWinNotification("Hospital Cadastrado", msg);
}

export function notifyHospitalUpdated(username: string, hospitalName: string) {
  const msg = `${username} atualizou ${hospitalName}`;
  showToast("Hospital Atualizado", msg, "linear-gradient(135deg, #f59e0b 0%, #d97706 100%)");
  showWinNotification("Hospital Atualizado", msg);
}

export function notifyHospitalDeleted(username: string, hospitalName: string) {
  const msg = `${username} excluiu ${hospitalName}`;
  showToast("Hospital Excluido", msg, "linear-gradient(135deg, #ef4444 0%, #dc2626 100%)", true);
  showWinNotification("Hospital Excluido", msg);
}

export function requestNotificationPermission() {
  initServiceWorker();
  if ("Notification" in window && Notification.permission === "default") {
    Notification.requestPermission();
  }
}
