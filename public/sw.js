/**
 * Service Worker — Ihsan PWA
 * Stratégie :
 *  - App shell (JS/CSS/HTML) : Cache First (mise à jour en arrière-plan)
 *  - PDFs                    : Cache on demand (mis en cache à la première visite)
 *  - API / données externes  : Network First
 *
 * Versionning : à chaque déploiement, le client enregistre /sw.js?v=BUILD_ID
 * où BUILD_ID est le SHA du commit (Vercel) ou un timestamp (local). Le
 * navigateur détecte un changement d'URL et installe un nouveau SW. Les noms
 * de caches d'app/font incluent ce BUILD_ID, donc l'ancien JS Next.js est
 * purgé à l'activation. Le cache PDF reste constant (ihsan-pdf-v2) pour
 * préserver les téléchargements de l'utilisateur entre versions.
 */

const VERSION = new URL(self.location.href).searchParams.get("v") || "dev";
const CACHE_APP  = `ihsan-app-${VERSION}`;
const CACHE_FONT = `ihsan-fonts-${VERSION}`;
const CACHE_PDF  = "ihsan-pdf-v2";

const CDN_HOST   = "cdn.ihsan-coran.fr";

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
          // Purge tous les anciens caches d'app/font (versions précédentes).
          // Garde le cache PDF (constant entre versions) et les caches courants.
          .filter(k => k !== CACHE_APP && k !== CACHE_FONT && k !== CACHE_PDF)
          .map(k => caches.delete(k))
      )
    )
  );
  self.clients.claim();
});

// Permet au client de demander un skipWaiting (quand l'utilisateur clique
// sur "Recharger pour mettre à jour" — cf. pwa-register.tsx).
self.addEventListener("message", event => {
  if (event.data === "SKIP_WAITING") self.skipWaiting();
});

/* ── Fetch ─────────────────────────────────────── */
self.addEventListener("fetch", event => {
  const { request } = event;
  const url = new URL(request.url);

  // Ignorer les requêtes non-GET et cross-origin non pertinentes
  if (request.method !== "GET") return;

  // PDFs locaux (legacy) → Cache on demand
  if (url.pathname.startsWith("/docs/") && url.pathname.endsWith(".pdf")) {
    event.respondWith(cacheThenNetwork(CACHE_PDF, request));
    return;
  }

  // PDFs hébergés sur le CDN Cloudflare R2 → cache avec support Range
  if (url.hostname === CDN_HOST && url.pathname.endsWith(".pdf")) {
    event.respondWith(pdfFromCdn(request));
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

/**
 * PDFs du CDN avec support des Range requests.
 *
 * Stratégie :
 * 1. Construire une URL de cache sans le header Range (clé canonique = URL complète).
 * 2. Si le PDF complet est en cache : extraire le slice demandé et répondre 206.
 * 3. Sinon : faire un fetch complet (sans Range) en parallèle pour cacher la version
 *    complète, et servir la requête courante depuis le réseau (avec Range si demandé).
 *
 * Pourquoi pas juste cache.put(request) ? Parce que :
 *  - Une réponse 206 ne peut pas être mise en cache (Cache API rejette).
 *  - On veut une seule entrée canonique par PDF, pas une par byte-range.
 */
async function pdfFromCdn(request) {
  const cache = await caches.open(CACHE_PDF);
  const cacheKey = new Request(request.url, { method: "GET" });
  const cached = await cache.match(cacheKey);
  const rangeHeader = request.headers.get("range");

  if (cached) {
    if (!rangeHeader) return cached.clone();
    return sliceResponse(cached, rangeHeader);
  }

  // Pas en cache : déclencher un téléchargement complet en arrière-plan pour
  // remplir le cache, sans bloquer la requête courante.
  if (!rangeHeader) {
    // Le client demande déjà tout le fichier — on peut directement cacher.
    try {
      const response = await fetch(request);
      if (response.ok && response.status === 200) {
        cache.put(cacheKey, response.clone()).catch(() => {});
      }
      return response;
    } catch {
      return new Response("PDF non disponible hors ligne.", { status: 503 });
    }
  }

  // Range demandé : on sert la requête Range au client, et on lance le full-fetch en parallèle.
  prefetchFullPdf(cache, cacheKey);
  try {
    return await fetch(request);
  } catch {
    return new Response("PDF non disponible hors ligne.", { status: 503 });
  }
}

/** Télécharge le PDF complet sans Range et le met en cache (idempotent). */
const inFlightPrefetch = new Set();
async function prefetchFullPdf(cache, cacheKey) {
  const url = cacheKey.url;
  if (inFlightPrefetch.has(url)) return;
  inFlightPrefetch.add(url);
  try {
    const existing = await cache.match(cacheKey);
    if (existing) return;
    const fullReq = new Request(url, { method: "GET" });
    const res = await fetch(fullReq);
    if (res.ok && res.status === 200) {
      await cache.put(cacheKey, res.clone());
    }
  } catch {
    /* silencieux : on réessaiera à la prochaine ouverture */
  } finally {
    inFlightPrefetch.delete(url);
  }
}

/** Extrait un sous-ensemble d'octets d'une Response complète et renvoie un 206. */
async function sliceResponse(fullResponse, rangeHeader) {
  const match = /^bytes=(\d*)-(\d*)$/.exec(rangeHeader.trim());
  const buffer = await fullResponse.clone().arrayBuffer();
  const total = buffer.byteLength;
  if (!match) return new Response(buffer, { status: 200 });

  let start = match[1] ? parseInt(match[1], 10) : 0;
  let end = match[2] ? parseInt(match[2], 10) : total - 1;
  if (Number.isNaN(start) || Number.isNaN(end) || start > end || start >= total) {
    return new Response(null, { status: 416 });
  }
  if (end >= total) end = total - 1;

  const slice = buffer.slice(start, end + 1);
  const headers = new Headers(fullResponse.headers);
  headers.set("Content-Range", `bytes ${start}-${end}/${total}`);
  headers.set("Content-Length", String(slice.byteLength));
  headers.set("Accept-Ranges", "bytes");
  return new Response(slice, { status: 206, statusText: "Partial Content", headers });
}
