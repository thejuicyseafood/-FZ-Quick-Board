const CACHE='fz-quick-board-r3i-pwa-fix-v2';
const ROOT='/-FZ-Quick-Board/';
const SHELL=[
  ROOT,
  ROOT+'index.html',
  ROOT+'manifest.webmanifest',
  ROOT+'icon-192.png',
  ROOT+'icon-512.png'
];

self.addEventListener('install', event => {
  event.waitUntil(caches.open(CACHE).then(c => c.addAll(SHELL)).then(() => self.skipWaiting()));
});

self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys()
      .then(keys => Promise.all(keys.filter(k => k.startsWith('fz-quick-board-') && k !== CACHE).map(k => caches.delete(k))))
      .then(() => self.clients.claim())
  );
});

self.addEventListener('fetch', event => {
  if (event.request.method !== 'GET') return;
  const u = new URL(event.request.url);
  if (u.origin !== self.location.origin) return;

  if (event.request.mode === 'navigate') {
    event.respondWith(
      fetch(event.request, {cache:'no-store'})
        .then(r => { const x=r.clone(); caches.open(CACHE).then(c=>c.put(ROOT+'index.html',x)); return r; })
        .catch(() => caches.match(ROOT+'index.html'))
    );
    return;
  }

  event.respondWith(
    caches.match(event.request, {ignoreSearch:true})
      .then(hit => hit || fetch(event.request).then(r => {
        const x=r.clone(); caches.open(CACHE).then(c=>c.put(event.request,x)); return r;
      }))
  );
});
