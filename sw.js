const CACHE_NAME = 'market-v1';
const ASSETS = [
  './',
  './index.html',
  './logos/rupee.png',
  // Keep your other static assets here
];

self.addEventListener('install', (e) => {
  e.waitUntil(caches.open(CACHE_NAME).then(cache => cache.addAll(ASSETS)));
});

self.addEventListener('fetch', (e) => {
    e.respondWith(
        caches.match(e.request).then((cachedResponse) => {
            const networkFetch = fetch(e.request).then((networkResponse) => {
                // If we get a fresh response, update the cache
                if (networkResponse && networkResponse.status === 200) {
                    caches.open(CACHE_NAME).then((cache) => {
                        cache.put(e.request, networkResponse.clone());
                    });
                }
                return networkResponse;
            });

            // Return the cached version if we have it, 
            // otherwise wait for the network
            return cachedResponse || networkFetch;
        })
    );
});