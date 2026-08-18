self.addEventListener("push", function (event) {
  const data = event.data ? event.data.json() : {};
  const title = data.title || "Hospital Delivery Control";
  const body = data.body || "";
  const icon = data.icon || "/favicon.ico";

  event.waitUntil(
    self.registration.showNotification(title, {
      body,
      icon,
      requireInteraction: true,
      silent: false,
    })
  );
});

self.addEventListener("message", function (event) {
  if (event.data && event.data.type === "SHOW_NOTIFICATION") {
    const { title, body, icon } = event.data;
    self.registration.showNotification(title || "Hospital Delivery Control", {
      body: body || "",
      icon: icon || "/favicon.ico",
      requireInteraction: true,
      silent: false,
    });
  }
});

self.addEventListener("notificationclick", function (event) {
  event.notification.close();
  event.waitUntil(
    clients.matchAll({ type: "window" }).then(function (clientList) {
      for (let i = 0; i < clientList.length; i++) {
        const client = clientList[i];
        if (client.url.includes(self.location.origin) && "focus" in client) {
          return client.focus();
        }
      }
      if (clients.openWindow) {
        return clients.openWindow("/");
      }
    })
  );
});
