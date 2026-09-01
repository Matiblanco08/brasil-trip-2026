const CACHE = 'brasil-2026-v3';
const SHELL = [
  './',
  './index.html',
  './style.css',
  './config.js',
  './schemas.js',
  './api.js',
  './state.js',
  './views.js',
  './app.js',
  './manifest.json',
  './nosotros.jpg'
];

self.addEventListener('install', (e) => {
  e.waitUntil(caches.open(CACHE).then((c) => c.addAll(SHELL)));
  self.skipWaiting();
});

self.addEventListener('activate', (e) => {
  e.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(keys.filter((k) => k !== CACHE).map((k) => caches.delete(k)))
    )
  );
  self.clients.claim();
});

// Network-first for the Apps Script API, cache-first for the app shell.
self.addEventListener('fetch', (e) => {
  const url = e.request.url;
  if (url.indexOf('script.google.com') !== -1) {
    e.respondWith(fetch(e.request).catch(() => caches.match(e.request)));
    return;
  }
  e.respondWith(
    caches.match(e.request).then((cached) => cached || fetch(e.request))
  );
});
