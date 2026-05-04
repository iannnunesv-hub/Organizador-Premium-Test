
const CACHE = 'org-v2';
const timers = new Map();

self.addEventListener('install', () => self.skipWaiting());
self.addEventListener('activate', e => e.waitUntil(clients.claim()));

self.addEventListener('fetch', e => {
  e.respondWith(
    caches.match(e.request).then(cached => {
      if (cached) return cached;
      return fetch(e.request).then(res => {
        caches.open(CACHE).then(c => c.put(e.request, res.clone()));
        return res;
      }).catch(() => cached);
    })
  );
});

self.addEventListener('message', ({ data }) => {
  if (!data) return;

  if (data.type === 'CLEAR_ALL') {
    timers.forEach(t => clearTimeout(t));
    timers.clear();
    return;
  }

  if (data.type === 'NOTIFY') {
    const { tag, title, body, delay } = data;
    if (timers.has(tag)) clearTimeout(timers.get(tag));
    if (delay > 0) {
      timers.set(tag, setTimeout(() => {
        self.registration.showNotification(title, {
          body,
          tag,
          icon: './icon.png',
          requireInteraction: false,
          vibrate: [200, 100, 200]
        });
        timers.delete(tag);
      }, delay));
    }
  }
});
