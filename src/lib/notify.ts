import { toast } from "sonner";

function playNotificationSound() {
  try {
    const ctx = new AudioContext();
    const oscillator = ctx.createOscillator();
    const gainNode = ctx.createGain();

    oscillator.connect(gainNode);
    gainNode.connect(ctx.destination);

    oscillator.type = "sine";
    oscillator.frequency.setValueAtTime(800, ctx.currentTime);
    oscillator.frequency.setValueAtTime(1000, ctx.currentTime + 0.1);
    oscillator.frequency.setValueAtTime(800, ctx.currentTime + 0.2);

    gainNode.gain.setValueAtTime(0.3, ctx.currentTime);
    gainNode.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.4);

    oscillator.start(ctx.currentTime);
    oscillator.stop(ctx.currentTime + 0.4);
  } catch {}
}

function sendDesktopNotification(title: string, body: string) {
  if ("Notification" in window && Notification.permission === "granted") {
    playNotificationSound();

    const n = new Notification(title, {
      body,
      icon: "/favicon.ico",
      requireInteraction: true,
      silent: false,
    });

    n.onclick = () => {
      window.focus();
      n.close();
    };
  }
}

export function notifyCreated(username: string, hospitalName: string) {
  const msg = `${username} criou nova entrega em ${hospitalName}`;
  toast.success("Nova Entrega", {
    description: msg,
    style: {
      background: "linear-gradient(135deg, #22c55e 0%, #16a34a 100%)",
      color: "#fff",
      border: "none",
    },
    duration: Infinity,
  });
  sendDesktopNotification("Nova Entrega", msg);
}

export function notifyStatusUpdated(
  username: string,
  hospitalName: string,
  newStatus: string,
  count: number
) {
  const suffix = count > 1 ? ` (${count} entregas)` : "";
  const msg = `${username} atualizou ${hospitalName}${suffix} para "${newStatus}"`;
  toast.success("Status Atualizado", {
    description: msg,
    style: {
      background: "linear-gradient(135deg, #3b82f6 0%, #2563eb 100%)",
      color: "#fff",
      border: "none",
    },
    duration: Infinity,
  });
  sendDesktopNotification("Status Atualizado", msg);
}

export function notifyHospitalCreated(username: string, hospitalName: string) {
  const msg = `${username} cadastrou ${hospitalName}`;
  toast.success("Hospital Cadastrado", {
    description: msg,
    style: {
      background: "linear-gradient(135deg, #8b5cf6 0%, #7c3aed 100%)",
      color: "#fff",
      border: "none",
    },
    duration: Infinity,
  });
  sendDesktopNotification("Hospital Cadastrado", msg);
}

export function notifyHospitalUpdated(username: string, hospitalName: string) {
  const msg = `${username} atualizou ${hospitalName}`;
  toast.success("Hospital Atualizado", {
    description: msg,
    style: {
      background: "linear-gradient(135deg, #f59e0b 0%, #d97706 100%)",
      color: "#fff",
      border: "none",
    },
    duration: Infinity,
  });
  sendDesktopNotification("Hospital Atualizado", msg);
}

export function notifyHospitalDeleted(username: string, hospitalName: string) {
  const msg = `${username} excluiu ${hospitalName}`;
  toast.success("Hospital Excluído", {
    description: msg,
    style: {
      background: "linear-gradient(135deg, #ef4444 0%, #dc2626 100%)",
      color: "#fff",
      border: "none",
    },
    duration: Infinity,
  });
  sendDesktopNotification("Hospital Excluído", msg);
}

export function requestNotificationPermission() {
  if ("Notification" in window && Notification.permission === "default") {
    Notification.requestPermission();
  }
}
