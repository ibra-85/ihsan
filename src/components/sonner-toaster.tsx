"use client";

import { Toaster } from "sonner";
import { useTheme } from "@/components/theme-provider";

/** Toaster Sonner synchronisé avec le thème de l'application. */
export function SonnerToaster() {
  const { resolvedTheme } = useTheme();
  return (
    <Toaster
      theme={resolvedTheme === "dark" ? "dark" : "light"}
      position="top-center"
      richColors
      closeButton
      toastOptions={{ duration: 3500 }}
    />
  );
}
