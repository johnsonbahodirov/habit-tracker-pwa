const CACHE = 'habitflow-v1';
const FILES = ['./', './index.html', './manifest.webmanifest', './css/styles.css',
  './js/app.js', './js/db.js', './js/state.js', './js/ui.js', './js/stats.js',
  './js/i18n.js', './js/notifications.js', './js/backup.js', './icons/icon.svg'];

self.addEventListener('install', (e) => {
  e.waitUntil(caches.open(CACHE).then((c) => c.addAll(FILES)));
  self.skipWaiting();
});

self.addEventListener('activate', (e) => {
  e.waitUntil(caches.keys().then((keys) =>
    Promise.all(keys.filter((k) => k !== CACHE).map((k) => caches.delete(k)))));
  self.clients.claim();
});

self.addEventListener('fetch', (e) => {
  if (e.request.method !== 'GET') return;
  e.respondWith(caches.match(e.request).then((r) => r || fetch(e.request)));
});
