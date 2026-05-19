/**
 * Configuration de l'internationalisation (i18n).
 * Approche : préférence stockée en localStorage (clé `ql-locale`),
 * fournie via le LanguageProvider — pas de routing par URL.
 */

export const LOCALES = ["fr", "en", "ar", "ru"] as const;
export type Locale = (typeof LOCALES)[number];

export const DEFAULT_LOCALE: Locale = "fr";

/** Langues écrites de droite à gauche. */
export const RTL_LOCALES: Locale[] = ["ar"];

/** Nom de chaque langue dans sa propre langue. */
export const LOCALE_NAMES: Record<Locale, string> = {
  fr: "Français",
  en: "English",
  ar: "العربية",
  ru: "Русский",
};

export function isRTL(locale: Locale): boolean {
  return RTL_LOCALES.includes(locale);
}

export function isLocale(value: string): value is Locale {
  return (LOCALES as readonly string[]).includes(value);
}
