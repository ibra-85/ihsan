"use client";

import { useEffect, useState, useMemo } from "react";
import { useTheme } from "@/components/theme-provider";
import { HugeiconsIcon, type IconSvgElement } from "@hugeicons/react";
import {
  Setting06Icon,
  Moon01Icon,
  Sun01Icon,
  ComputerIcon,
  Download01Icon,
  StickyNote01Icon,
  BookBookmark01Icon,
  Clock01Icon,
  BookOpenTextIcon,
  PaintBrush01Icon,
  Database01Icon,
  AlertCircleIcon,
  Delete01Icon,
} from "@hugeicons/core-free-icons";
import {
  getSettings, saveSettings, getNotes, exportNotesAsTxt, getBookmarks,
  type AppSettings,
} from "@/lib/store";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { cn } from "@/lib/utils";

const ACCENTS: { id: AppSettings["accent"]; label: string; value: string }[] = [
  { id: "green",  label: "Vert",   value: "oklch(0.527 0.154 150.069)" },
  { id: "blue",   label: "Bleu",   value: "oklch(0.546 0.245 262.881)" },
  { id: "purple", label: "Violet", value: "oklch(0.491 0.27 292.581)"  },
  { id: "amber",  label: "Doré",   value: "oklch(0.666 0.179 58.318)"  },
  { id: "rose",   label: "Rose",   value: "oklch(0.586 0.253 17.585)"  },
];

const THEMES: { id: "system" | "light" | "dark"; label: string; icon: IconSvgElement }[] = [
  { id: "system", label: "Système", icon: ComputerIcon },
  { id: "light",  label: "Clair",   icon: Sun01Icon    },
  { id: "dark",   label: "Sombre",  icon: Moon01Icon   },
];

function formatDuration(seconds: number): string {
  if (seconds < 60) return `${seconds}s`;
  const min = Math.floor(seconds / 60);
  if (min < 60) return `${min} min`;
  const h = Math.floor(min / 60);
  const remMin = min % 60;
  return remMin > 0 ? `${h}h ${remMin}min` : `${h}h`;
}

function readLocalStorageSize(): number {
  if (typeof window === "undefined") return 0;
  let total = 0;
  for (const k of Object.keys(localStorage)) {
    if (!k.startsWith("ql-")) continue;
    total += (k.length + (localStorage.getItem(k)?.length ?? 0)) * 2; // UTF-16
  }
  return total;
}

function formatBytes(bytes: number): string {
  if (bytes < 1024) return `${bytes} o`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} Ko`;
  return `${(bytes / 1024 / 1024).toFixed(2)} Mo`;
}

export default function SettingsContent() {
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);
  const [accent, setAccent] = useState<AppSettings["accent"]>("green");

  // Stats locales
  const [stats, setStats] = useState({ bookmarks: 0, notes: 0, docs: 0, readSec: 0, bytes: 0 });

  const refreshStats = () => {
    if (typeof window === "undefined") return;
    const progressKeys = Object.keys(localStorage).filter(k => k.startsWith("ql-progress-"));
    const docsRead = progressKeys.filter(k => Number(localStorage.getItem(k)) > 1).length;
    const timeKeys = Object.keys(localStorage).filter(k => k.startsWith("ql-time-"));
    const readSec = timeKeys.reduce((sum, k) => sum + Number(localStorage.getItem(k) ?? 0), 0);
    setStats({
      bookmarks: getBookmarks().length,
      notes: getNotes().length,
      docs: docsRead,
      readSec,
      bytes: readLocalStorageSize(),
    });
  };

  useEffect(() => {
    setMounted(true);
    setAccent(getSettings().accent);
    refreshStats();
  }, []);

  const changeAccent = (id: AppSettings["accent"]) => {
    setAccent(id);
    saveSettings({ accent: id });
    if (id !== "green") {
      document.documentElement.setAttribute("data-accent", id);
    } else {
      document.documentElement.removeAttribute("data-accent");
    }
    window.dispatchEvent(new Event("ql-settings-change"));
  };

  const clearKeys = (keys: string[], confirmMsg: string, successMsg: string) => {
    if (!confirm(confirmMsg)) return;
    keys.forEach(k => {
      if (k.endsWith("*")) {
        const prefix = k.slice(0, -1);
        Object.keys(localStorage).filter(x => x.startsWith(prefix)).forEach(x => localStorage.removeItem(x));
      } else {
        localStorage.removeItem(k);
      }
    });
    refreshStats();
    alert(successMsg);
  };

  const currentAccentLabel = useMemo(() => ACCENTS.find(c => c.id === accent)?.label, [accent]);

  return (
    <div className="max-w-2xl mx-auto px-4 py-8">

      {/* En-tête */}
      <div className="flex items-center gap-3 mb-8">
        <div className="size-11 rounded-xl bg-primary/10 flex items-center justify-center shrink-0">
          <HugeiconsIcon icon={Setting06Icon} className="size-5 text-primary" />
        </div>
        <div>
          <h1 className="text-xl font-bold">Paramètres</h1>
          <p className="text-sm text-muted-foreground">Personnalisez l&apos;application et gérez vos données</p>
        </div>
      </div>

      <div className="flex flex-col gap-4">

        {/* ─── Apparence ─── */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <HugeiconsIcon icon={PaintBrush01Icon} className="size-4 text-primary" />
              Apparence
            </CardTitle>
            <CardDescription>Thème et couleur d&apos;accent</CardDescription>
          </CardHeader>
          <Separator />
          <CardContent className="pt-5 flex flex-col gap-6">

            {/* Thème */}
            <div>
              <p className="text-sm font-medium mb-3">Thème</p>
              <div className="grid grid-cols-3 gap-2">
                {THEMES.map(({ id, label, icon }) => {
                  const active = mounted && theme === id;
                  return (
                    <button
                      key={id}
                      onClick={() => setTheme(id)}
                      className={cn(
                        "flex flex-col items-center justify-center gap-2 py-4 rounded-xl border-2 transition-all cursor-pointer",
                        active
                          ? "border-primary bg-primary/10 text-primary"
                          : "border-border bg-muted text-muted-foreground hover:border-primary/40"
                      )}
                    >
                      <HugeiconsIcon icon={icon} className="size-5" />
                      <span className="text-xs font-semibold">{label}</span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Accent — Select dropdown */}
            <div>
              <label htmlFor="accent-select" className="block text-sm font-medium mb-3">
                Couleur d&apos;accent
              </label>
              <Select value={accent} onValueChange={(v) => changeAccent(v as AppSettings["accent"])}>
                <SelectTrigger id="accent-select" className="w-full">
                  <SelectValue>
                    <span className="flex items-center gap-2.5">
                      <span
                        className="size-4 rounded-full shrink-0 ring-1 ring-border"
                        style={{ background: ACCENTS.find(c => c.id === accent)?.value }}
                      />
                      <span>{currentAccentLabel}</span>
                    </span>
                  </SelectValue>
                </SelectTrigger>
                <SelectContent>
                  {ACCENTS.map(c => (
                    <SelectItem key={c.id} value={c.id}>
                      <span className="flex items-center gap-2.5">
                        <span
                          className="size-4 rounded-full shrink-0 ring-1 ring-border"
                          style={{ background: c.value }}
                        />
                        <span>{c.label}</span>
                      </span>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <p className="text-xs text-muted-foreground mt-2">
                Appliquée aux liens, boutons et accents visuels
              </p>
            </div>
          </CardContent>
        </Card>

        {/* ─── Statistiques ─── */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <HugeiconsIcon icon={Clock01Icon} className="size-4 text-primary" />
              Vos statistiques
            </CardTitle>
            <CardDescription>Aperçu de votre activité de lecture</CardDescription>
          </CardHeader>
          <Separator />
          <CardContent className="pt-5">
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              <StatCard icon={BookBookmark01Icon} label="Marque-pages" value={stats.bookmarks} />
              <StatCard icon={StickyNote01Icon}    label="Notes"        value={stats.notes} />
              <StatCard icon={BookOpenTextIcon}    label="Documents lus" value={stats.docs} />
              <StatCard icon={Clock01Icon}         label="Temps total"   value={stats.readSec >= 60 ? formatDuration(stats.readSec) : "—"} small />
            </div>
          </CardContent>
        </Card>

        {/* ─── Données ─── */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <HugeiconsIcon icon={Database01Icon} className="size-4 text-primary" />
              Données locales
            </CardTitle>
            <CardDescription>
              Toutes vos données sont stockées localement ({formatBytes(stats.bytes)})
            </CardDescription>
          </CardHeader>
          <Separator />
          <CardContent className="pt-5 flex flex-col gap-2">

            {/* Export */}
            <div className="flex items-center justify-between gap-3 p-3 rounded-lg bg-muted/40">
              <div className="min-w-0 flex-1">
                <p className="text-sm font-medium">Exporter les notes</p>
                <p className="text-xs text-muted-foreground">
                  Téléchargez toutes vos notes au format .txt
                </p>
              </div>
              <Button
                variant="outline"
                size="sm"
                disabled={stats.notes === 0}
                onClick={() => exportNotesAsTxt()}
                className="shrink-0"
              >
                <HugeiconsIcon icon={Download01Icon} data-icon="inline-start" />
                Exporter
              </Button>
            </div>

            {/* Suppressions ciblées */}
            <div className="flex items-center justify-between gap-3 p-3 rounded-lg bg-muted/40">
              <div className="min-w-0 flex-1">
                <p className="text-sm font-medium">Supprimer les marque-pages</p>
                <p className="text-xs text-muted-foreground">
                  {stats.bookmarks} entrée{stats.bookmarks > 1 ? "s" : ""} sauvegardée{stats.bookmarks > 1 ? "s" : ""}
                </p>
              </div>
              <Button
                variant="ghost"
                size="sm"
                disabled={stats.bookmarks === 0}
                onClick={() => clearKeys(
                  ["ql-bookmarks"],
                  `Supprimer les ${stats.bookmarks} marque-pages ?`,
                  "Marque-pages supprimés."
                )}
                className="shrink-0 text-muted-foreground hover:text-destructive"
              >
                <HugeiconsIcon icon={Delete01Icon} />
              </Button>
            </div>

            <div className="flex items-center justify-between gap-3 p-3 rounded-lg bg-muted/40">
              <div className="min-w-0 flex-1">
                <p className="text-sm font-medium">Supprimer les notes</p>
                <p className="text-xs text-muted-foreground">
                  {stats.notes} note{stats.notes > 1 ? "s" : ""} enregistrée{stats.notes > 1 ? "s" : ""}
                </p>
              </div>
              <Button
                variant="ghost"
                size="sm"
                disabled={stats.notes === 0}
                onClick={() => clearKeys(
                  ["ql-notes"],
                  `Supprimer les ${stats.notes} notes ?`,
                  "Notes supprimées."
                )}
                className="shrink-0 text-muted-foreground hover:text-destructive"
              >
                <HugeiconsIcon icon={Delete01Icon} />
              </Button>
            </div>

            <div className="flex items-center justify-between gap-3 p-3 rounded-lg bg-muted/40">
              <div className="min-w-0 flex-1">
                <p className="text-sm font-medium">Réinitialiser la progression</p>
                <p className="text-xs text-muted-foreground">
                  Oublier les pages et temps de lecture
                </p>
              </div>
              <Button
                variant="ghost"
                size="sm"
                disabled={stats.docs === 0 && stats.readSec === 0}
                onClick={() => clearKeys(
                  ["ql-progress-*", "ql-time-*"],
                  "Réinitialiser toute la progression de lecture ?",
                  "Progression réinitialisée."
                )}
                className="shrink-0 text-muted-foreground hover:text-destructive"
              >
                <HugeiconsIcon icon={Delete01Icon} />
              </Button>
            </div>

          </CardContent>
        </Card>

        {/* ─── Zone dangereuse ─── */}
        <Card className="border-destructive/30">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-destructive">
              <HugeiconsIcon icon={AlertCircleIcon} className="size-4" />
              Zone dangereuse
            </CardTitle>
            <CardDescription>
              Action irréversible — toutes vos données seront perdues
            </CardDescription>
          </CardHeader>
          <Separator />
          <CardContent className="pt-5">
            <Button
              variant="destructive"
              className="w-full sm:w-auto"
              onClick={() => {
                if (!confirm("Supprimer TOUTES vos données ? Marque-pages, notes, progression, paramètres. Action irréversible.")) return;
                if (!confirm("Vraiment sûr ? Confirmez une dernière fois.")) return;
                Object.keys(localStorage).filter(k => k.startsWith("ql-")).forEach(k => localStorage.removeItem(k));
                alert("Toutes vos données ont été supprimées.");
                window.location.reload();
              }}
            >
              <HugeiconsIcon icon={Delete01Icon} data-icon="inline-start" />
              Réinitialiser toutes les données
            </Button>
          </CardContent>
        </Card>

        {/* ─── À propos ─── */}
        <Card>
          <CardHeader>
            <CardTitle>À propos</CardTitle>
          </CardHeader>
          <Separator />
          <CardContent className="pt-5">
            <div className="flex items-center gap-3 mb-3">
              <span className="text-3xl">☪️</span>
              <div>
                <p className="font-semibold">Ihsan</p>
                <p className="text-xs text-muted-foreground">Version 1.0.0</p>
              </div>
            </div>
            <p className="text-sm text-muted-foreground leading-relaxed">
              Bibliothèque islamique numérique — Coran, sciences islamiques et apprentissage.
              Toutes les données sont sauvegardées localement dans votre navigateur, aucune
              information n&apos;est envoyée à un serveur externe.
            </p>
          </CardContent>
        </Card>

      </div>
    </div>
  );
}

/* ─────────────────────────────────────────────────────────── */

function StatCard({
  icon, label, value, small,
}: {
  icon: IconSvgElement;
  label: string;
  value: string | number;
  small?: boolean;
}) {
  return (
    <div className="rounded-lg border bg-muted/30 p-3 flex flex-col gap-1">
      <div className="flex items-center gap-1.5 text-muted-foreground">
        <HugeiconsIcon icon={icon} className="size-3.5" />
        <span className="text-[10px] uppercase tracking-wide font-semibold">{label}</span>
      </div>
      <p className={cn(
        "font-bold tabular-nums text-foreground",
        small ? "text-base" : "text-xl"
      )}>
        {value}
      </p>
    </div>
  );
}
