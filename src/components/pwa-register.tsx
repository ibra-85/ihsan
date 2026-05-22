"use client";

import { useEffect } from "react";
import { toast } from "sonner";
import { useI18n } from "@/components/i18n-provider";

/**
 * Enregistre le service worker PWA en production uniquement.
 * En développement, désinscrit tout SW existant et vide ses caches
 * pour éviter de servir d'anciens chunks Next.js.
 *
 * Stratégie de mise à jour :
 *  - Le SW est enregistré avec `?v=BUILD_ID` (cf. next.config.ts).
 *  - À chaque deploy, BUILD_ID change → le navigateur détecte un nouveau SW
 *    → il s'installe en arrière-plan, en attente.
 *  - On écoute `updatefound` et l'état `installed` du nouveau worker. Quand
 *    un autre SW contrôle déjà la page (= update, pas première install), on
 *    affiche un toast "Nouvelle version disponible — Recharger".
 *  - Au clic, on demande au nouveau SW de prendre le contrôle (`SKIP_WAITING`)
 *    et on recharge la page : l'utilisateur récupère le HTML/JS frais.
 */
export function PwaRegister() {
  const { t } = useI18n();
  useEffect(() => {
    if (!("serviceWorker" in navigator)) return;

    if (process.env.NODE_ENV !== "production") {
      navigator.serviceWorker.getRegistrations().then(regs => {
        regs.forEach(reg => reg.unregister());
      });
      if ("caches" in window) {
        caches.keys().then(keys => keys.forEach(k => caches.delete(k)));
      }
      return;
    }

    const buildId = process.env.NEXT_PUBLIC_BUILD_ID || "dev";

    navigator.serviceWorker
      .register(`/sw.js?v=${buildId}`, { scope: "/" })
      .then(registration => {
        // Vérification active à intervalles réguliers (toutes les 30 min) —
        // utile si l'utilisateur laisse l'onglet ouvert très longtemps.
        setInterval(() => registration.update().catch(() => {}), 30 * 60 * 1000);

        const promptUpdate = (worker: ServiceWorker) => {
          // Un toast persistant : l'utilisateur choisit quand recharger.
          toast(t.pwa.updateTitle, {
            description: t.pwa.updateDescription,
            duration: Infinity,
            action: {
              label: t.pwa.updateReload,
              onClick: () => {
                worker.postMessage("SKIP_WAITING");
                navigator.serviceWorker.addEventListener(
                  "controllerchange",
                  () => window.location.reload(),
                  { once: true },
                );
              },
            },
          });
        };

        // Cas 1 : un SW est déjà en attente au moment du register
        // (l'utilisateur revient sur une page après un deploy).
        if (registration.waiting && navigator.serviceWorker.controller) {
          promptUpdate(registration.waiting);
        }

        // Cas 2 : un nouveau SW est trouvé pendant la session.
        registration.addEventListener("updatefound", () => {
          const installing = registration.installing;
          if (!installing) return;
          installing.addEventListener("statechange", () => {
            // installed + controller existant = update (pas première install)
            if (installing.state === "installed" && navigator.serviceWorker.controller) {
              promptUpdate(installing);
            }
          });
        });
      })
      .catch(err => console.warn("[PWA] SW registration failed:", err));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return null;
}
