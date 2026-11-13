// Service Worker for 环游世界英语学习 PWA
// v16：HTML/CSS/JS 改 stale-while-revalidate（弱网先给缓存，秒开），
//      图片走 cache-first（含 jsDelivr 跨域 opaque 响应），第二次访问 0 网络。
const CACHE_NAME = 'travelling-english-v16';
const IMG_CACHE = 'te-images-v1';
const IMG_CACHE_LIMIT = 120;

const CRITICAL_ASSETS = [
  '/english-learning/',
  '/english-learning/index.html',
  '/english-learning/feedback.html',
  '/english-learning/teacher.html',
  '/english-learning/gallery.html',
  '/english-learning/css/style.css',
  '/english-learning/js/app.js',
  '/english-learning/js/data.js',
  '/english-learning/js/supabase-auth.js',
  '/english-learning/js/speaking.js',
  '/english-learning/js/writing.js',
  '/english-learning/js/portfolio.js',
  '/english-learning/manifest.json',
  '/english-learning/checkin/',
  '/english-learning/checkin/index.html',
  '/english-learning/checkin/manifest.json',
  '/english-learning/checkin/icon.svg'
];

// Install: 预缓存关键资源
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll(CRITICAL_ASSETS).catch((err) => {
        console.warn('SW install cache fail (non-critical):', err);
      });
    })
  );
  self.skipWaiting();
});

// Activate: 清理旧缓存
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keys) => {
      return Promise.all(
        keys.filter((k) => k !== CACHE_NAME && k !== IMG_CACHE).map((k) => caches.delete(k))
      );
    })
  );
  self.clients.claim();
});

// 控制图片缓存体积：超过上限就丢掉最早的一批
async function trimImageCache(cache) {
  const keys = await cache.keys();
  if (keys.length <= IMG_CACHE_LIMIT) return;
  const extra = keys.length - IMG_CACHE_LIMIT;
  for (let i = 0; i < extra; i++) await cache.delete(keys[i]);
}

self.addEventListener('fetch', (event) => {
  const req = event.request;
  if (req.method !== 'GET') return;

  const url = req.url;
  // Supabase 接口不缓存
  if (url.includes('supabase.co')) return;

  // ① 图片：缓存优先（含 jsDelivr 的 opaque 响应），后台刷新
  if (req.destination === 'image') {
    event.respondWith(
      caches.open(IMG_CACHE).then(async (cache) => {
        const hit = await cache.match(req);
        const network = fetch(req)
          .then((res) => {
            if (res && (res.ok || res.type === 'opaque')) {
              cache.put(req, res.clone()).then(() => trimImageCache(cache));
            }
            return res;
          })
          .catch(() => null);
        if (hit) {
          event.waitUntil(network);
          return hit;
        }
        return (await network) || Response.error();
      })
    );
    return;
  }

  // ② 页面 / 脚本 / 样式 / 字体：先给缓存（秒开），同时后台更新
  const isDoc = req.destination === 'document';
  const isAsset = ['script', 'style', 'font'].includes(req.destination);
  if (isDoc || isAsset) {
    event.respondWith(
      caches.open(CACHE_NAME).then(async (cache) => {
        const hit = await cache.match(req);
        const network = fetch(req)
          .then((res) => {
            if (res && res.ok) cache.put(req, res.clone());
            return res;
          })
          .catch(() => null);
        if (hit) {
          event.waitUntil(network);
          return hit;
        }
        const res = await network;
        if (res) return res;
        if (isDoc) {
          const fallback = await cache.match('/english-learning/index.html');
          if (fallback) return fallback;
        }
        return Response.error();
      })
    );
    return;
  }

  // ③ 其余：网络优先，失败回退缓存
  event.respondWith(
    fetch(req)
      .then((response) => response)
      .catch(() => caches.match(req))
  );
});
