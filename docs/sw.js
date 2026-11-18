// Service worker: makes the app installable and keeps it usable without a connection.
// Fresh content from the network wins; the cache is the fallback when the network is slow or missing.
// Tours saved for offline use (map tiles, terrain, summit pages) live in caches named "ag-offline-…", which updates keep.
const CACHE = 'alpengipfel-29677b02b57a';
const SHELL = ["./", "manifest.webmanifest", "data/peaks.json", "data/geo.json", "assets/app.css", "assets/app.js", "assets/fonts.css", "assets/fonts/barlow-condensed-latin-500-normal.woff2", "assets/fonts/barlow-condensed-latin-600-normal.woff2", "assets/fonts/barlow-condensed-latin-ext-500-normal.woff2", "assets/fonts/barlow-condensed-latin-ext-600-normal.woff2", "assets/fonts/barlow-latin-400-normal.woff2", "assets/fonts/barlow-latin-500-normal.woff2", "assets/fonts/barlow-latin-600-normal.woff2", "assets/fonts/barlow-latin-ext-400-normal.woff2", "assets/fonts/barlow-latin-ext-500-normal.woff2", "assets/fonts/barlow-latin-ext-600-normal.woff2", "assets/icon-180.png", "assets/icon-192.png", "assets/icon-512.png", "assets/leaflet-maplibre-gl.js", "assets/leaflet.js", "assets/maplibre-gl.css", "assets/maplibre-gl.js", "assets/supabase.js"];
const OFFLINE_HOSTS = ['tiles.openfreemap.org', 's3.amazonaws.com', 'api.met.no'];   // map, terrain, weather: from the offline store when there is no network

self.addEventListener('install', event => {
  event.waitUntil(caches.open(CACHE).then(cache => cache.addAll(SHELL)).then(() => self.skipWaiting()));
});
self.addEventListener('activate', event => {
  event.waitUntil(caches.keys().then(keys => Promise.all(keys.filter(k => k !== CACHE && !k.startsWith('ag-offline')).map(k => caches.delete(k)))).then(() => self.clients.claim()));
});
self.addEventListener('fetch', event => {
  const req = event.request, url = new URL(req.url);
  if (req.method !== 'GET') return;
  if (OFFLINE_HOSTS.includes(url.hostname)) {
    event.respondWith((async () => {
      const cached = await caches.match(req);
      if (!cached) return fetch(req);
      // a saved tile or forecast: use the network when it answers quickly, otherwise the saved copy
      try { return await Promise.race([fetch(req), new Promise((_, no) => setTimeout(no, navigator.onLine === false ? 0 : 3500))]); }
      catch (err) { return cached; }
    })());
    return;
  }
  if (url.origin !== location.origin || !url.pathname.startsWith(new URL(self.registration.scope).pathname)) return;
  event.respondWith((async () => {
    const cache = await caches.open(CACHE);
    const cached = (await cache.match(req, { ignoreSearch: true })) || (await caches.match(req, { ignoreSearch: true }));
    const network = fetch(req).then(res => { if (res.ok) cache.put(req, res.clone()); return res; });
    try {
      // with a cached copy at hand, wait at most 4 seconds for the network
      return await (cached ? Promise.race([network, new Promise((_, no) => setTimeout(no, 4000))]) : network);
    } catch (err) {
      if (cached) { network.catch(() => {}); return cached; }
      if (req.mode === 'navigate' && url.href !== self.registration.scope) return Response.redirect(self.registration.scope);   // unknown page offline: open the app itself
      return Response.error();
    }
  })());
});
