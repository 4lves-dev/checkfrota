const CACHE = "checkfrota-v94";
const ASSETS = ["./", "./index.html", "./gestao.html", "./lider.html?v=84", "./instalar-gestao.html", "./instalar-lider.html", "./aprovacao.html?v=84", "./styles.css?v=90", "./supabase-config.js?v=1", "./app.js?v=94", "./manifest.webmanifest", "./gestao-manifest.webmanifest", "./lider-manifest.webmanifest", "./icons/icon.svg"];

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

