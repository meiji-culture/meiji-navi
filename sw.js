// めいじ応援ナビ service worker
// 方針：画面（HTML）はネットワーク優先で常に最新を取りに行き、失敗時のみキャッシュを使う。
// 画像などの静的ファイルはキャッシュ優先。予定データはアプリ側で都度取得する。
const CACHE = 'meiji-navi-v8';
const SHELL = ['./', './index.html', './manifest.json', './icon-192.png', './icon-512.png', './banner.png', './logo.png'];

self.addEventListener('install', (e) => {
  e.waitUntil(caches.open(CACHE).then((c) => c.addAll(SHELL)).then(() => self.skipWaiting()));
});

self.addEventListener('activate', (e) => {
  e.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(keys.filter((k) => k !== CACHE).map((k) => caches.delete(k)))
    ).then(() => self.clients.claim())
  );
});

self.addEventListener('fetch', (e) => {
  const url = new URL(e.request.url);
  if (e.request.method !== 'GET') return;
  if (url.origin !== location.origin) return;
  const isPage = e.request.mode === 'navigate' || url.pathname.endsWith('/') || url.pathname.endsWith('index.html');
  if (isPage) {
    e.respondWith(
      fetch(e.request).then((res) => {
        const copy = res.clone();
        caches.open(CACHE).then((c) => c.put('./index.html', copy));
        return res;
      }).catch(() => caches.match('./index.html'))
    );
  } else {
    e.respondWith(caches.match(e.request).then((hit) => hit || fetch(e.request)));
  }
});
