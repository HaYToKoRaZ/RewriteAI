const CACHE_NAME = 'rewriteai-v1';
const ASSETS_TO_CACHE = [
  './',
  'index.html',
  'styles.css',
  'script.js',
  'privacy.html',
  'favicon.ico',
  'assets/icons/icon32.png',
  'assets/icons/icon51.png',
  'assets/icons/icon68.png',
  'assets/badges/helium.png',
  'assets/badges/chrome.svg',
  'assets/badges/edge.svg',
  'assets/badges/github-icon.svg'
];

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll(ASSETS_TO_CACHE);
    }).then(() => self.skipWaiting())
  );
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keys) => {
      return Promise.all(
        keys.map((key) => {
          if (key !== CACHE_NAME) {
            return caches.delete(key);
          }
        })
      );
    }).then(() => self.clients.claim())
  );
});

self.addEventListener('fetch', (event) => {
  if (event.request.method !== 'GET') return;
  const url = new URL(event.request.url);

  // Do not intercept worker telemetry pings
  if (url.origin.includes('workers.dev')) return;

  event.respondWith(
    caches.match(event.request).then((cachedResponse) => {
      if (cachedResponse) {
        // Return from cache, revalidate in background
        fetch(event.request).then((networkResponse) => {
          if (networkResponse && networkResponse.status === 200) {
            caches.open(CACHE_NAME).then((cache) => cache.put(event.request, networkResponse));
          }
        }).catch(() => {});
        return cachedResponse;
      }
      return fetch(event.request);
    })
  );
});
