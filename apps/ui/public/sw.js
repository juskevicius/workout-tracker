const cacheName = 'v1';

const appShellFiles = ['/index.html', '/manifest.json'];

self.addEventListener('install', (event) => {
  event.waitUntil(
    (async () => {
      const cache = await caches.open(cacheName);
      await cache.addAll(appShellFiles);
    })()
  );
});

const NON_ASSET_PATHS = [
  'welcome',
  'log',
  'timer',
  'plan',
  'schedule',
  'exercises',
  'extra-features',
];

self.addEventListener('fetch', (event) => {
  event.respondWith(
    (async () => {
      const resource = await caches.match(event.request);

      const path = new URL(event.request.url).pathname.split('/')[1]; // Get the first segment of the path
      if (NON_ASSET_PATHS.includes(path)) {
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
