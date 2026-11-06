// Guarda la app en la tablet para que abra sin internet.
// Siempre responde con la copia guardada y, si hay internet, la actualiza para la próxima vez.
var CACHE = 'congeladores-v1';
var ARCHIVOS = ['./', 'index.html', 'manifest.webmanifest', 'icono-192.png', 'icono-512.png'];

self.addEventListener('install', function (e) {
  e.waitUntil(caches.open(CACHE).then(function (c) { return c.addAll(ARCHIVOS); }));
  self.skipWaiting();
});

self.addEventListener('activate', function (e) {
  e.waitUntil(caches.keys().then(function (claves) {
    return Promise.all(claves.filter(function (k) { return k !== CACHE; }).map(function (k) { return caches.delete(k); }));
  }).then(function () { return self.clients.claim(); }));
});

self.addEventListener('fetch', function (e) {
  if (e.request.method !== 'GET' || new URL(e.request.url).origin !== location.origin) return;
  e.respondWith(caches.open(CACHE).then(function (c) {
    return c.match(e.request, { ignoreSearch: true }).then(function (guardada) {
      var red = fetch(e.request).then(function (r) {
        if (r && r.ok) c.put(e.request, r.clone());
        return r;
      }).catch(function () { return guardada; });
      if (guardada) {
        try { e.waitUntil(red.catch(function () {})); } catch (err) {}
        return guardada;
      }
      return red;
    });
  }));
});
