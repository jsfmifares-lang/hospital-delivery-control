import { toast } from "sonner";

function sendDesktopNotification(title: string, body: string) {
  if ("Notification" in window && Notification.permission === "granted") {
    const audio = new Audio("data:audio/wav;base64,UklGRnoGAABXQVZFZm10IBAAAAABAAEAQB8AAEAfAAABAAgAZGF0YQoGAACBhYqFbF1fdH+JkI+LhHtwa3V/g4iKi4aCfHd2fIGGiImJh4OAfXl5fYOGh4mJiIaCfnp7goSGh4mJiIaCfnp7goSGh4mJiIaCfnp7gA==");
    audio.volume = 0.5;
    audio.play().catch(() => {});

    new Notification(title, {
      body,
      icon: "/favicon.ico",
      requireInteraction: false,
    });
  }
}

export function notifyCreated(username: string, hospitalName: string) {
  const msg = `${username} criou nova entrega em ${hospitalName}`;
  toast.success("Nova Entrega", { description: msg });
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
  toast.success("Status Atualizado", { description: msg });
  sendDesktopNotification("Status Atualizado", msg);
}

export function notifyHospitalCreated(username: string, hospitalName: string) {
  const msg = `${username} cadastrou ${hospitalName}`;
  toast.success("Hospital Cadastrado", { description: msg });
  sendDesktopNotification("Hospital Cadastrado", msg);
}

export function notifyHospitalUpdated(username: string, hospitalName: string) {
  const msg = `${username} atualizou ${hospitalName}`;
  toast.success("Hospital Atualizado", { description: msg });
  sendDesktopNotification("Hospital Atualizado", msg);
}

export function notifyHospitalDeleted(username: string, hospitalName: string) {
  const msg = `${username} excluiu ${hospitalName}`;
  toast.success("Hospital Excluído", { description: msg });
  sendDesktopNotification("Hospital Excluído", msg);
}

export function requestNotificationPermission() {
  if ("Notification" in window && Notification.permission === "default") {
    Notification.requestPermission();
  }
}
