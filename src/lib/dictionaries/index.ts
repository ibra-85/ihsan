import type { Locale } from "@/lib/i18n";
import { fr, type Dictionary } from "./fr";
import { en } from "./en";
import { ar } from "./ar";
import { ru } from "./ru";

export const dictionaries: Record<Locale, Dictionary> = { fr, en, ar, ru };

export type { Dictionary };

/** Interpole les variables `{clé}` d'une chaîne de traduction. */
export function format(template: string, vars: Record<string, string | number>): string {
  return template.replace(/\{(\w+)\}/g, (_, k) =>
    k in vars ? String(vars[k]) : `{${k}}`,
  );
}
