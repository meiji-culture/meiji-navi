// めいじ応援ナビ service worker（試作版）
// 方針：アプリの外枠だけをキャッシュし、予定データなど変わるものは常にネットワーク優先にする。
// バージョンを上げると古いキャッシュは破棄される（残留リスクへの対策）。
const CACHE = 'meiji-navi-v3';
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
  // 同一オリジンの静的ファイルだけキャッシュ優先。それ以外（地図・カレンダー等）はネットワーク。
  if (url.origin === location.origin) {
    e.respondWith(
      caches.match(e.request).then((hit) => hit || fetch(e.request))
    );
  }
});
