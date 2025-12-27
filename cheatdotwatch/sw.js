const CACHE_NAME = 'cheatdotwatch-v1';
const ASSETS = [
  './',
  'index.html',
  'manifest.json',
  'https://fonts.googleapis.com/icon?family=Material+Icons'
];

// Instalacja i natychmiastowe wymuszenie aktywacji
self.addEventListener('install', (e) => {
  self.skipWaiting(); 
  e.waitUntil(
    caches.open(CACHE_NAME).then((cache) => cache.addAll(ASSETS))
  );
});

// Przejęcie kontroli nad stroną bez konieczności odświeżania
self.addEventListener('activate', (e) => {
  e.waitUntil(clients.claim());
});

self.addEventListener('fetch', (e) => {
  e.respondWith(
    caches.match(e.request).then((res) => res || fetch(e.request))
  );
});

// Obsługa kliknięcia w powiadomienie (wymagane przez Androida)
self.addEventListener('notificationclick', (event) => {
  event.notification.close();
  event.waitUntil(
    clients.matchAll({ type: 'window', includeUncontrolled: true }).then((clientList) => {
      if (clientList.length > 0) return clientList[0].focus();
      return clients.openWindow('./');
    })
  );
});