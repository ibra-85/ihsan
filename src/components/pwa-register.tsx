"use client";

import { useEffect } from "react";

/**
 * Enregistre le service worker PWA en production uniquement.
 * En développement, désinscrit tout SW existant et vide ses caches
 * pour éviter de servir d'anciens chunks Next.js (le SW cache /_next/static/
 * en Cache First, ce qui sert l'ancien JS après recompile).
 */
export function PwaRegister() {
  useEffect(() => {
    if (!("serviceWorker" in navigator)) return;

    if (process.env.NODE_ENV !== "production") {
      // Dev : désinscrire le SW et vider les caches pour voir les modifs en temps réel
      navigator.serviceWorker.getRegistrations().then(regs => {
        regs.forEach(reg => reg.unregister());
      });
      if ("caches" in window) {
        caches.keys().then(keys => keys.forEach(k => caches.delete(k)));
      }
      return;
    }

    // Production : enregistrer le SW
    navigator.serviceWorker
      .register("/sw.js", { scope: "/" })
      .catch(err => console.warn("[PWA] SW registration failed:", err));
  }, []);

  return null;
}
