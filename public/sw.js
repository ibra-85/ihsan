/**
 * Service Worker — Ihsan PWA
 * Stratégie :
 *  - App shell (JS/CSS/HTML) : Cache First (mise à jour en arrière-plan)
 *  - PDFs                    : Cache on demand (mis en cache à la première visite)
 *  - API / données externes  : Network First
 */

const CACHE_APP   = "ihsan-app-v1";
const CACHE_PDF   = "ihsan-pdf-v1";
const CACHE_FONT  = "ihsan-fonts-v1";

const APP_SHELL = [
  "/",
  "/bookmarks",
  "/settings",
];

/* ── Installation ─────────────────────────────── */
self.addEventListener("install", event => {
  event.waitUntil(
    caches.open(CACHE_APP).then(cache =>
      cache.addAll(APP_SHELL).catch(() => {/* ignore offline install */})
    )
  );
  self.skipWaiting();
});

/* ── Activation — nettoyage anciens caches ────── */
self.addEventListener("activate", event => {
  event.waitUntil(
    caches.keys().then(keys =>
      Promise.all(
        keys
          .filter(k => ![CACHE_APP, CACHE_PDF, CACHE_FONT].includes(k))
          .map(k => caches.delete(k))
      )
    )
  );
  self.clients.claim();
});

/* ── Fetch ─────────────────────────────────────── */
self.addEventListener("fetch", event => {
  const { request } = event;
  const url = new URL(request.url);

  // Ignorer les requêtes non-GET et cross-origin non pertinentes
  if (request.method !== "GET") return;

  // PDFs → Cache on demand
  if (url.pathname.startsWith("/docs/") && url.pathname.endsWith(".pdf")) {
    event.respondWith(cacheThenNetwork(CACHE_PDF, request));
    return;
  }

  // Fonts (Google Fonts, unpkg) → Cache First
  if (
    url.hostname.includes("fonts.googleapis.com") ||
    url.hostname.includes("fonts.gstatic.com") ||
    url.hostname.includes("unpkg.com")
  ) {
    event.respondWith(cacheFirst(CACHE_FONT, request));
    return;
  }

  // Navigation HTML → Network First avec fallback cache
  if (request.mode === "navigate") {
    event.respondWith(networkFirst(CACHE_APP, request));
    return;
  }

  // Assets Next.js (_next/static) → Cache First
  if (url.pathname.startsWith("/_next/static/")) {
    event.respondWith(cacheFirst(CACHE_APP, request));
    return;
  }

  // Reste → Network (pas de cache)
});

/* ── Stratégies ────────────────────────────────── */

/** Cache First : cache → réseau (+ mise en cache) */
async function cacheFirst(cacheName, request) {
  const cached = await caches.match(request);
  if (cached) return cached;
  try {
    const response = await fetch(request);
    if (response.ok) {
      const cache = await caches.open(cacheName);
      cache.put(request, response.clone());
    }
    return response;
  } catch {
    return new Response("Hors ligne", { status: 503 });
  }
}

/** Network First : réseau → cache en fallback */
async function networkFirst(cacheName, request) {
  try {
    const response = await fetch(request);
    if (response.ok) {
      const cache = await caches.open(cacheName);
      cache.put(request, response.clone());
    }
    return response;
  } catch {
    const cached = await caches.match(request);
    return cached ?? new Response("Hors ligne — rechargez quand vous serez connecté.", {
      status: 503,
      headers: { "Content-Type": "text/plain; charset=utf-8" },
    });
  }
}

/** Cache on demand (PDFs) : cache → réseau (+ mise en cache) */
async function cacheThenNetwork(cacheName, request) {
  const cached = await caches.match(request);
  if (cached) return cached;
  try {
    const response = await fetch(request);
    if (response.ok) {
      const cache = await caches.open(cacheName);
      cache.put(request, response.clone());
    }
    return response;
  } catch {
    return new Response("PDF non disponible hors ligne.", { status: 503 });
  }
}
