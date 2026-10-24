// ═══════════════════════════════════════════════════════
//  SUPORTE MEGA – Service Worker (PWA)
//  Permite instalação como app e cache básico de assets
// ═══════════════════════════════════════════════════════

const CACHE_NAME = 'suporte-mega-v1';

// Arquivos que serão cacheados para acesso offline básico
const ASSETS = [
  './',
  './index.html',
  './css/styles.css',
  './js/config.js',
  './js/ui.js',
  './js/auth.js',
  './js/chamados.js',
  './js/equipamentos.js',
  './js/relatorios.js',
  './js/app.js',
  './manifest.json',
  './icons/icon-192.png',
  './icons/icon-512.png'
];

// ── Instalação: cacheia os assets estáticos ──────────────
self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME).then(cache => cache.addAll(ASSETS))
  );
  self.skipWaiting();
});

// ── Ativação: remove caches antigos ─────────────────────
self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys().then(keys =>
      Promise.all(
        keys
          .filter(k => k !== CACHE_NAME)
          .map(k => caches.delete(k))
      )
    )
  );
  self.clients.claim();
});

// ── Fetch: Network First para o Supabase, Cache First para assets ──
self.addEventListener('fetch', event => {
  const url = new URL(event.request.url);

  // Requisições ao Supabase sempre vão para a rede (dados em tempo real)
  if (url.hostname.includes('supabase.co')) {
    event.respondWith(fetch(event.request));
    return;
  }

  // Para assets estáticos: tenta a rede primeiro, cai no cache se offline
  event.respondWith(
    fetch(event.request)
      .then(response => {
        // Atualiza o cache com a versão mais recente
        const clone = response.clone();
        caches.open(CACHE_NAME).then(cache => cache.put(event.request, clone));
        return response;
      })
      .catch(() => caches.match(event.request))
  );
});
