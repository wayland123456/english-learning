// Service Worker for 环游世界英语学习 PWA
const CACHE_NAME = 'travelling-english-v11';

const CRITICAL_ASSETS = [
  '/english-learning/',
  '/english-learning/index.html',
  '/english-learning/feedback.html',
  '/english-learning/teacher.html',
  '/english-learning/css/style.css',
  '/english-learning/js/app.js',
  '/english-learning/js/data.js',
  '/english-learning/js/supabase-auth.js',
  '/english-learning/js/speaking.js',
  '/english-learning/js/writing.js',
  '/english-learning/js/portfolio.js',
  '/english-learning/manifest.json'
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
        keys.filter((k) => k !== CACHE_NAME).map((k) => caches.delete(k))
      );
    })
  );
  self.clients.claim();
});

// Fetch: 网络优先，失败时回退缓存
self.addEventListener('fetch', (event) => {
  // 跳过 Supabase API 请求（不做缓存）
  if (event.request.url.includes('supabase.co')) return;

  event.respondWith(
    fetch(event.request)
      .then((response) => {
        // 缓存成功的 HTML/CSS/JS 请求
        if (response.ok && (event.request.destination === 'document' ||
            event.request.destination === 'script' ||
            event.request.destination === 'style')) {
          const clone = response.clone();
          caches.open(CACHE_NAME).then((cache) => {
            cache.put(event.request, clone);
          });
        }
        return response;
      })
      .catch(() => {
        return caches.match(event.request);
      })
  );
});
