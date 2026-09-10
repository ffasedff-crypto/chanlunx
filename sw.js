// ChanlunX 缠论 —— 离线应用壳缓存（让"添加到主屏幕"后可秒开、弱网可用）
const CACHE = 'chanlunx-static-v2';  // 静态托管专用缓存；网络优先加载 HTML，避免旧版缓存干扰
const ASSETS = [
  './',
  './chanlun_chart.html',
  './chanlun.js',
  './manifest.json',
  './icon.svg'
];

self.addEventListener('install', (e) => {
  e.waitUntil(
    caches.open(CACHE).then((c) => c.addAll(ASSETS).catch(() => {})).then(() => self.skipWaiting())
  );
});

self.addEventListener('activate', (e) => {
  // 清掉所有旧版本缓存（包括 v1 和任何无名缓存）
  e.waitUntil(
    caches.keys().then((ks) => Promise.all(ks.map((k) => caches.delete(k)))).then(() => self.clients.claim())
  );
});

self.addEventListener('fetch', (e) => {
  const req = e.request;
  if (req.method !== 'GET') return;
  const url = new URL(req.url);
  // 跨域请求（外部行情数据：腾讯/雪球/东方财富等）：永远走网络，不缓存，保证 K 线实时
  if (url.origin !== self.location.origin) {
    e.respondWith(fetch(req));
    return;
  }
  // /api/* 行情数据：永远走网络，不缓存
  if (url.pathname.indexOf('/api/') === 0) {
    e.respondWith(fetch(req));
    return;
  }
  // HTML：网络优先 + 强制重新校验；失败时回退到缓存
  // 注意：必须先 clone 再交给 caches.put，且 put 用的是「clone 出来的副本」，
  // 不能在异步回调里再 clone 原始 fr（那时 fr 已被返回消费 → "Response body is already used"）。
  if (url.pathname.endsWith('.html') || url.pathname === '/' || url.pathname.endsWith('/')) {
    e.respondWith(
      fetch(req, { cache: 'reload' }).then((fr) => {
        const copy = fr.clone();
        caches.open(CACHE).then((c) => c.put(req, copy)).catch(() => {});
        return fr;
      }).catch(() => caches.match(req).then((r) => r || caches.match('./')))
    );
    return;
  }
  // JS/CSS/SVG/icon/manifest：缓存优先（离线可用）
  if (url.pathname.endsWith('.js') || url.pathname.endsWith('.css') || url.pathname.endsWith('.svg') || url.pathname.endsWith('manifest.json')) {
    e.respondWith(
      caches.match(req).then((r) => r || fetch(req).then((fr) => {
        const copy = fr.clone();
        caches.open(CACHE).then((c) => c.put(req, copy)).catch(() => {});
        return fr;
      }).catch(() => caches.match(req)))
    );
    return;
  }
  // 其他：网络优先，失败回退缓存
  e.respondWith(fetch(req).catch(() => caches.match(req)));
});