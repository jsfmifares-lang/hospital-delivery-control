import { toast } from "sonner";

let swRegistration: ServiceWorkerRegistration | null = null;

async function initServiceWorker() {
  if ("serviceWorker" in navigator && !swRegistration) {
    try {
      swRegistration = await navigator.serviceWorker.register("/sw.js");
      console.log("Service Worker registrado");
    } catch (e) {
      console.log("Service Worker nao registrado:", e);
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
  } catch (e) {
    console.error("Erro ao tocar som:", e);
  }
}

function showWinNotification(title: string, body: string) {
  if (!("Notification" in window)) {
    console.log("Browser nao suporta Notification API");
    return;
  }

  console.log("Permissao notificacao:", Notification.permission);

  playNotificationSound();

  if (Notification.permission === "granted") {
    try {
      const n = new Notification(title, {
        body,
        icon: "/favicon.ico",
        requireInteraction: true,
        silent: true,
      });
      n.onclick = () => {
        window.focus();
        n.close();
      };
      console.log("Notificacao Windows enviada:", title);
    } catch (e) {
      console.error("Erro Notification API, tentando Service Worker:", e);
      tryViaSW(title, body);
    }
  } else if (Notification.permission === "default") {
    Notification.requestPermission().then((perm) => {
      console.log("Permissao apos pedido:", perm);
      if (perm === "granted") {
        try {
          const n = new Notification(title, {
            body,
            icon: "/favicon.ico",
            requireInteraction: true,
            silent: true,
          });
          n.onclick = () => {
            window.focus();
            n.close();
          };
        } catch (e) {
          tryViaSW(title, body);
        }
      }
    });
  } else {
    console.log("Notificacoes bloqueadas, tentando Service Worker");
    tryViaSW(title, body);
  }
}

async function tryViaSW(title: string, body: string) {
  try {
    await initServiceWorker();
    if (swRegistration && swRegistration.active) {
      swRegistration.active.postMessage({
        type: "SHOW_NOTIFICATION",
        title,
        body,
        icon: "/favicon.ico",
      });
      console.log("Notificacao via Service Worker:", title);
    }
  } catch (e) {
    console.error("Erro via SW:", e);
  }
}

export function notifyCreated(username: string, hospitalName: string) {
  const msg = `${username} criou nova entrega em ${hospitalName}`;
  console.log("[NOTIFY] Created:", msg);
  toast.success("Nova Entrega", {
    description: msg,
    style: {
      background: "linear-gradient(135deg, #22c55e 0%, #16a34a 100%)",
      color: "#fff",
      border: "none",
      fontSize: "14px",
    },
    duration: Infinity,
    action: { label: "Fechar", onClick: () => {} },
  });
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
  console.log("[NOTIFY] StatusUpdated:", msg);
  toast.success("Status Atualizado", {
    description: msg,
    style: {
      background: "linear-gradient(135deg, #3b82f6 0%, #2563eb 100%)",
      color: "#fff",
      border: "none",
      fontSize: "14px",
    },
    duration: Infinity,
    action: { label: "Fechar", onClick: () => {} },
  });
  showWinNotification("Status Atualizado", msg);
}

export function notifyHospitalCreated(username: string, hospitalName: string) {
  const msg = `${username} cadastrou ${hospitalName}`;
  console.log("[NOTIFY] HospitalCreated:", msg);
  toast.success("Hospital Cadastrado", {
    description: msg,
    style: {
      background: "linear-gradient(135deg, #8b5cf6 0%, #7c3aed 100%)",
      color: "#fff",
      border: "none",
      fontSize: "14px",
    },
    duration: Infinity,
    action: { label: "Fechar", onClick: () => {} },
  });
  showWinNotification("Hospital Cadastrado", msg);
}

export function notifyHospitalUpdated(username: string, hospitalName: string) {
  const msg = `${username} atualizou ${hospitalName}`;
  console.log("[NOTIFY] HospitalUpdated:", msg);
  toast.success("Hospital Atualizado", {
    description: msg,
    style: {
      background: "linear-gradient(135deg, #f59e0b 0%, #d97706 100%)",
      color: "#fff",
      border: "none",
      fontSize: "14px",
    },
    duration: Infinity,
    action: { label: "Fechar", onClick: () => {} },
  });
  showWinNotification("Hospital Atualizado", msg);
}

export function notifyHospitalDeleted(username: string, hospitalName: string) {
  const msg = `${username} excluiu ${hospitalName}`;
  console.log("[NOTIFY] HospitalDeleted:", msg);
  toast.error("Hospital Excluido", {
    description: msg,
    style: {
      background: "linear-gradient(135deg, #ef4444 0%, #dc2626 100%)",
      color: "#fff",
      border: "none",
      fontSize: "14px",
    },
    duration: Infinity,
    action: { label: "Fechar", onClick: () => {} },
  });
  showWinNotification("Hospital Excluido", msg);
}

export function requestNotificationPermission() {
  initServiceWorker();
  if ("Notification" in window) {
    if (Notification.permission === "default") {
      Notification.requestPermission().then((perm) => {
        console.log("Permissao de notificacao:", perm);
      });
    } else {
      console.log("Permissao de notificacao ja:", Notification.permission);
    }
  }
}
