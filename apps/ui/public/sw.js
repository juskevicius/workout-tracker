const cacheName = 'v5';

const appShellFiles = ['/index.html', '/manifest.json'];

self.addEventListener('install', (event) => {
  event.waitUntil(
    (async () => {
      const cache = await caches.open(cacheName);
      await cache.addAll(appShellFiles);
    })()
  );
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    (async () => {
      const names = await caches.keys();
      await Promise.all(
        names.map((name) => {
          if (name !== cacheName) {
            return caches.delete(name);
          }
          return undefined;
        })
      );
      await clients.claim();
    })()
  );
});

self.addEventListener('fetch', (event) => {
  event.respondWith(
    (async () => {
      const resource = await caches.match(event.request);

      if (event.request.mode === 'navigate') {
        const resource = await caches.match('/index.html');
        return resource || fetch('/index.html');
      }

      if (resource) {
        return resource;
      }
      const response = await fetch(event.request);
      const cache = await caches.open(cacheName);
      cache.put(event.request, response.clone());
      return response;
    })()
  );
});
