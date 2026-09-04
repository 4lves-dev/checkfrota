const CACHE = "checkfrota-v172";
const ASSETS = ["./", "./index.html", "./gestao.html?v=172", "./lider.html?v=172", "./instalar-gestao.html?v=172", "./instalar-lider.html?v=172", "./aprovacao.html?v=172", "./styles.css?v=172", "./supabase-config.js?v=172", "./onesignal.js?v=172", "./app.js?v=172", "./manifest.webmanifest", "./gestao-manifest.webmanifest", "./lider-manifest.webmanifest", "./icons/icon.svg", "./version.json"];

self.addEventListener("install", (event) => event.waitUntil(caches.open(CACHE).then((cache) => cache.addAll(ASSETS)).then(() => self.skipWaiting())));
self.addEventListener("activate", (event) => event.waitUntil(caches.keys().then((keys) => Promise.all(keys.filter((key) => key !== CACHE).map((key) => caches.delete(key)))).then(() => self.clients.claim())));
self.addEventListener("fetch", (event) => {
  if (event.request.method !== "GET") return;
  if (event.request.mode === "navigate") {
    event.respondWith(fetch(event.request).then((response) => {
      const copy = response.clone();
      void caches.open(CACHE).then((cache) => cache.put(event.request, copy));
      return response;
    }).catch(() => caches.match(event.request).then((cached) => cached || caches.match("./index.html"))));
    return;
  }
  event.respondWith(caches.match(event.request).then((cached) => cached || fetch(event.request)));
});

self.addEventListener("push", (event) => {
  let payload = { title: "URBAM Frotas Líder", body: "Há um novo chamado para aprovação." };
  try { payload = { ...payload, ...event.data.json() }; } catch (_) {}
  event.waitUntil(self.registration.showNotification(payload.title, {
    body: payload.body,
    icon: "icons/icon.svg",
    tag: payload.tag || "urbam-frota-lider"
  }));
});

self.addEventListener("notificationclick", (event) => {
  event.notification.close();
  event.waitUntil(clients.matchAll({ type: "window", includeUncontrolled: true }).then((windows) => {
    const open = windows.find((client) => client.url.includes("lider.html"));
    return open ? open.focus() : clients.openWindow("./lider.html?v=172");
  }));
});

