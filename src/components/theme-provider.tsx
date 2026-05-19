"use client";

import { createContext, useContext, useEffect, useState, useCallback } from "react";
import { getSettings, saveSettings, type AppSettings } from "@/lib/store";

type Theme = "light" | "dark" | "system";

interface ThemeContextValue {
  theme: Theme;
  setTheme: (t: Theme) => void;
  resolvedTheme: "light" | "dark";
}

const ThemeContext = createContext<ThemeContextValue>({
  theme: "system",
  setTheme: () => {},
  resolvedTheme: "light",
});

export function useTheme() {
  return useContext(ThemeContext);
}

function getSystemDark() {
  if (typeof window === "undefined") return false;
  return window.matchMedia("(prefers-color-scheme: dark)").matches;
}

function applyTheme(theme: Theme) {
  const dark = theme === "dark" || (theme === "system" && getSystemDark());
  document.documentElement.classList.toggle("dark", dark);
  return dark;
}

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const [theme, setThemeState] = useState<Theme>("system");
  const [resolvedTheme, setResolvedTheme] = useState<"light" | "dark">("light");
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    const saved = (localStorage.getItem("ql-theme") as Theme) ?? "system";
    setThemeState(saved);
    const dark = applyTheme(saved);
    setResolvedTheme(dark ? "dark" : "light");

    // accent
    const s = getSettings();
    if (s.accent && s.accent !== "green") {
      document.documentElement.setAttribute("data-accent", s.accent);
    }

    // system theme listener
    const mq = window.matchMedia("(prefers-color-scheme: dark)");
    const onMq = () => {
      const cur = (localStorage.getItem("ql-theme") as Theme) ?? "system";
      if (cur === "system") {
        const d = applyTheme("system");
        setResolvedTheme(d ? "dark" : "light");
      }
    };
    mq.addEventListener("change", onMq);

    // settings change listener (accent)
    const onSettings = () => {
      const updated = getSettings();
      if (updated.accent && updated.accent !== "green") {
        document.documentElement.setAttribute("data-accent", updated.accent);
      } else {
        document.documentElement.removeAttribute("data-accent");
      }
    };
    window.addEventListener("ql-settings-change", onSettings);

    setMounted(true);
    return () => {
      mq.removeEventListener("change", onMq);
      window.removeEventListener("ql-settings-change", onSettings);
    };
  }, []);

  const setTheme = useCallback((t: Theme) => {
    setThemeState(t);
    localStorage.setItem("ql-theme", t);
    const dark = applyTheme(t);
    setResolvedTheme(dark ? "dark" : "light");
  }, []);

  // Prevent flash: render children immediately, class already applied above
  return (
    <ThemeContext.Provider value={{ theme, setTheme, resolvedTheme }}>
      {children}
    </ThemeContext.Provider>
  );
}
