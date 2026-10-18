// Avengers Countdown service worker: the shelf opens without a connection.
// Pages: network first, the last copy when offline. Build assets: cache first (their names are hashed).
// Covers and icons: the cached copy right away, refreshed in the background.
const CACHE = 'ac-v1';

self.addEventListener('install', event => {
  event.waitUntil(caches.open(CACHE).then(c => c.add('/')).then(() => self.skipWaiting()));
});

self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys()
      .then(keys => Promise.all(keys.filter(k => k !== CACHE).map(k => caches.delete(k))))
      .then(() => self.clients.claim()),
  );
});

const put = (req, res) => {
  if (res.ok) { const copy = res.clone(); caches.open(CACHE).then(c => c.put(req, copy)); }
  return res;
};

self.addEventListener('fetch', event => {
  const req = event.request;
  if (req.method !== 'GET') return;
  const url = new URL(req.url);
  // Supabase, TMDB logos and anything else off-site go straight to the network
  if (url.origin !== self.location.origin || url.pathname === '/sw.js') return;

  if (req.mode === 'navigate') {
    event.respondWith(
      fetch(req).then(res => put(req, res))
        .catch(async () => (await caches.match(req)) ?? (await caches.match('/')) ?? Response.error()),
    );
    return;
  }
  if (url.pathname.startsWith('/_next/static/')) {
    event.respondWith(caches.match(req).then(hit => hit ?? fetch(req).then(res => put(req, res))));
    return;
  }
  if (url.pathname.startsWith('/covers/') || /\.(png|ico|webmanifest)$/.test(url.pathname)) {
    event.respondWith(caches.match(req).then(hit => {
      const fresh = fetch(req).then(res => put(req, res));
      if (hit) { event.waitUntil(fresh.catch(() => {})); return hit; }
      return fresh;
    }));
  }
});
