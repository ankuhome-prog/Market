// Minimal Service Worker 
self.addEventListener('install', (e) => {
  self.skipWaiting(); 
});

self.addEventListener('activate', (e) => {
  e.waitUntil(clients.claim());
});

// Browsers require this event to be present for PWA installation
self.addEventListener('fetch', (e) => {
  // We provide no logic here, so it defaults to regular network behavior
  return; 
});