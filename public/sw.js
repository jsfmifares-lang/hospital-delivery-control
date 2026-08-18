self.addEventListener("push", function (event) {
  const data = event.data ? event.data.json() : {};
  event.waitUntil(
    self.registration.showNotification(data.title || "Hospital Delivery Control", {
      body: data.body || "",
      icon: data.icon || "/favicon.ico",
      requireInteraction: true,
      silent: false,
    })
  );
});

self.addEventListener("message", function (event) {
  if (event.data && event.data.type === "SHOW_NOTIFICATION") {
    event.waitUntil(
      self.registration.showNotification(event.data.title || "Notificacao", {
        body: event.data.body || "",
        icon: event.data.icon || "/favicon.ico",
        requireInteraction: true,
        silent: false,
      })
    );
  }
});

self.addEventListener("notificationclick", function (event) {
  event.notification.close();
  event.waitUntil(
    clients.matchAll({ type: "window", includeUncontrolled: true }).then(function (clientList) {
      for (let i = 0; i < clientList.length; i++) {
        if (clientList[i].url.includes(self.location.origin) && "focus" in clientList[i]) {
          return clientList[i].focus();
        }
      }
      if (clients.openWindow) {
        return clients.openWindow("/");
      }
    })
  );
});
