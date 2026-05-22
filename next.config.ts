import type { NextConfig } from "next";

// URL du CDN Cloudflare R2 — utilisée comme destination du proxy /pdf/*
const R2_CDN = "https://cdn.ihsan-coran.fr/coran";

// Build ID utilisé pour invalider le cache du service worker à chaque deploy.
// - Sur Vercel : utilise le SHA du commit pour garantir un nouveau SW à chaque push.
// - En local   : timestamp du build (change à chaque `next build`).
const BUILD_ID =
  process.env.VERCEL_GIT_COMMIT_SHA?.slice(0, 12) ||
  Date.now().toString(36);

const nextConfig: NextConfig = {
  // Force Next.js à bundler ces packages via ESM (le CJS exporte 0 icônes → hydration mismatch)
  transpilePackages: ["@hugeicons/react", "@hugeicons/core-free-icons"],

  // Exposé côté client (cf. pwa-register.tsx → register `/sw.js?v=BUILD_ID`)
  env: {
    NEXT_PUBLIC_BUILD_ID: BUILD_ID,
  },

  /**
   * Proxy /pdf/* → CDN Cloudflare R2
   *
   * En production (Vercel), définir NEXT_PUBLIC_CDN_URL=/pdf dans les variables
   * d'environnement Vercel. Ainsi, les PDFs sont chargés via le serveur Vercel
   * (sans CORS, sans ERR_CONNECTION_CLOSED) plutôt que directement depuis le
   * navigateur vers le CDN.
   *
   * En développement local, laisser NEXT_PUBLIC_CDN_URL vide → charge
   * directement depuis le CDN (pas de proxy).
   */
  async rewrites() {
    return [
      {
        source: "/pdf/:path*",
        destination: `${R2_CDN}/:path*`,
      },
    ];
  },
};

export default nextConfig;
