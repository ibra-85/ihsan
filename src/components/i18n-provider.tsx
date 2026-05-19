"use client";

import { createContext, useContext, useState, useEffect, useCallback } from "react";
import { DEFAULT_LOCALE, isLocale, isRTL, type Locale } from "@/lib/i18n";
import { dictionaries, format, type Dictionary } from "@/lib/dictionaries";

type I18nContextValue = {
  locale: Locale;
  setLocale: (l: Locale) => void;
  t: Dictionary;
  /** Interpole `{clé}` dans une chaîne traduite. */
  f: (template: string, vars: Record<string, string | number>) => string;
};

const I18nContext = createContext<I18nContextValue>({
  locale: DEFAULT_LOCALE,
  setLocale: () => {},
  t: dictionaries[DEFAULT_LOCALE],
  f: format,
});

export function useI18n(): I18nContextValue {
  return useContext(I18nContext);
}

const STORAGE_KEY = "ql-locale";

export function LanguageProvider({ children }: { children: React.ReactNode }) {
  // Lecture synchrone de la préférence — sûr car les pages consommatrices
  // sont rendues côté client (dynamic ssr:false), pas de mismatch d'hydratation.
  const [locale, setLocaleState] = useState<Locale>(() => {
    if (typeof window === "undefined") return DEFAULT_LOCALE;
    const saved = localStorage.getItem(STORAGE_KEY);
    return saved && isLocale(saved) ? saved : DEFAULT_LOCALE;
  });

  // Applique lang + dir (RTL pour l'arabe) sur <html>
  useEffect(() => {
    document.documentElement.lang = locale;
    document.documentElement.dir = isRTL(locale) ? "rtl" : "ltr";
  }, [locale]);

  const setLocale = useCallback((l: Locale) => {
    try { localStorage.setItem(STORAGE_KEY, l); } catch { /* ignore */ }
    setLocaleState(l);
  }, []);

  const value: I18nContextValue = {
    locale,
    setLocale,
    t: dictionaries[locale],
    f: format,
  };

  return <I18nContext.Provider value={value}>{children}</I18nContext.Provider>;
}
