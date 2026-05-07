/* Acroma Web Push Service Worker */

self.addEventListener("install", () => {
  self.skipWaiting();
});

self.addEventListener("activate", (event) => {
  event.waitUntil(self.clients.claim());
});

self.addEventListener("push", (event) => {
  if (!event.data) return;
  let payload;
  try {
    payload = event.data.json();
  } catch {
    payload = { title: "Acroma", body: event.data.text() };
  }

  const { title = "Acroma", body = "", data = {} } = payload;

  event.waitUntil(
    self.registration.showNotification(title, {
      body,
      icon: "/icon-192.png",
      badge: "/badge.png",
      data,
      tag: data.id || data.screen || "acroma",
      renotify: true,
    }),
  );
});

self.addEventListener("notificationclick", (event) => {
  event.notification.close();
  const data = event.notification.data || {};
  const target = pickRoute(data);

  event.waitUntil(
    self.clients
      .matchAll({ type: "window", includeUncontrolled: true })
      .then((clients) => {
        for (const client of clients) {
          if (client.url.endsWith(target) && "focus" in client) {
            return client.focus();
          }
        }
        if (self.clients.openWindow) return self.clients.openWindow(target);
      }),
  );
});

function pickRoute(data) {
  const id = data.id;
  switch (data.screen) {
    case "order":
      return id ? `/dashboard/orders/${id}` : "/dashboard/orders";
    case "conversation":
      return id
        ? `/dashboard/conversations/${id}`
        : "/dashboard/conversations";
    default:
      return "/dashboard";
  }
}
