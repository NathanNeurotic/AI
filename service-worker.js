// Bump cache version to ensure users receive the latest files
const CACHE_NAME = 'ai-dashboard-cache-v2';
const URLS_TO_CACHE = [
  './index.html',
  './styles.css',
  './script.js',
  './services.json',
  './favicon.ico',
  './public/manifest.json'
];

self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME).then(cache => cache.addAll(URLS_TO_CACHE))
  );
  self.skipWaiting();
});

self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys().then(keys =>
      Promise.all(keys.filter(key => key !== CACHE_NAME).map(key => caches.delete(key)))
    )
  );
  self.clients.claim();
});

self.addEventListener('fetch', event => {
  const requestUrl = new URL(event.request.url);

  // Network first for script.js and services.json
  if (requestUrl.pathname.endsWith('/script.js') || requestUrl.pathname.endsWith('/services.json')) {
    event.respondWith(
      fetch(event.request).catch(() => caches.match(event.request))
    );
    return;
  }

  // Cache first for other requests
  event.respondWith(
    caches.match(event.request).then(response => response || fetch(event.request))
  );
});
