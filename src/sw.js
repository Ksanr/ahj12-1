const CACHE_NAME = 'app-cache-v1';
const STATIC_URLS = [
  '/',
  '/index.html',
  '/main.js',
  '/styles.css',
];

// Установка – кешируем статику
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => cache.addAll(STATIC_URLS))
  );
  self.skipWaiting();
});

// Активация – удаляем старые кеши
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keys) => Promise.all(
      keys.filter((key) => key !== CACHE_NAME).map((key) => caches.delete(key))
    ))
  );
  self.clients.claim();
});

// Стратегия: сначала сеть, при ошибке – кеш для API,
// для статики – stale-while-revalidate
self.addEventListener('fetch', (event) => {
  const url = new URL(event.request.url);

  // API-запросы: NetworkFirst
  if (url.pathname.startsWith('/api/')) {
    event.respondWith(
      fetch(event.request)
        .then((response) => {
          const clone = response.clone();
          caches.open(CACHE_NAME).then((cache) => cache.put(event.request, clone));
          return response;
        })
        .catch(() => caches.match(event.request))
    );
    return;
  }

  // Статика: StaleWhileRevalidate
  event.respondWith(
    caches.match(event.request).then((cached) => {
      const fetchPromise = fetch(event.request).then((response) => {
        caches.open(CACHE_NAME).then((cache) => cache.put(event.request, response.clone()));
        return response;
      });
      return cached || fetchPromise;
    })
  );
});