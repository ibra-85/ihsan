"use client";

import { useEffect, useState, useMemo, useRef } from "react";
import { toast } from "sonner";
import { useTheme } from "@/components/theme-provider";
import { useI18n } from "@/components/i18n-provider";
import { HugeiconsIcon, type IconSvgElement } from "@hugeicons/react";
import {
  Setting06Icon,
  Moon01Icon,
  Sun01Icon,
  ComputerIcon,
  Download01Icon,
  Upload01Icon,
  StickyNote01Icon,
  BookBookmark01Icon,
  Clock01Icon,
  BookOpenTextIcon,
  PaintBrush01Icon,
  Database01Icon,
  AlertCircleIcon,
  Delete01Icon,
  CloudDownloadIcon,
} from "@hugeicons/core-free-icons";
import {
  getSettings, saveSettings, getNotes, exportNotesAsTxt, getBookmarks,
  exportAllData, importAllData,
  type AppSettings,
} from "@/lib/store";
import { listCachedPdfs, clearPdfCache, type CachedPdfMeta } from "@/lib/pdf-cache";
import type { Dictionary } from "@/lib/dictionaries";
import { useConfirm } from "@/components/confirm-provider";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { cn } from "@/lib/utils";

type SettingsKey = keyof Dictionary["settings"];

const ACCENTS: { id: AppSettings["accent"]; labelKey: SettingsKey; value: string }[] = [
  { id: "green",  labelKey: "accentGreen",  value: "oklch(0.527 0.154 150.069)" },
  { id: "blue",   labelKey: "accentBlue",   value: "oklch(0.546 0.245 262.881)" },
  { id: "purple", labelKey: "accentPurple", value: "oklch(0.491 0.27 292.581)"  },
  { id: "amber",  labelKey: "accentAmber",  value: "oklch(0.666 0.179 58.318)"  },
  { id: "rose",   labelKey: "accentRose",   value: "oklch(0.586 0.253 17.585)"  },
];

const THEMES: { id: "system" | "light" | "dark"; labelKey: SettingsKey; icon: IconSvgElement }[] = [
  { id: "system", labelKey: "themeSystem", icon: ComputerIcon },
  { id: "light",  labelKey: "themeLight",  icon: Sun01Icon    },
  { id: "dark",   labelKey: "themeDark",   icon: Moon01Icon   },
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
    total += (k.length + (localStorage.getItem(k)?.length ?? 0)) * 2;
  }
  return total;
}

function formatBytes(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / 1024 / 1024).toFixed(2)} MB`;
}

export default function SettingsContent() {
  const { theme, setTheme } = useTheme();
  const { t, f } = useI18n();
  const confirm = useConfirm();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [mounted, setMounted] = useState(false);
  const [accent, setAccent] = useState<AppSettings["accent"]>("green");

  const [stats, setStats] = useState({ bookmarks: 0, notes: 0, docs: 0, readSec: 0, bytes: 0 });
  const [pdfCache, setPdfCache] = useState<CachedPdfMeta[]>([]);

  const refreshPdfCache = () => {
    listCachedPdfs().then((items) => setPdfCache(items));
  };

  useEffect(() => {
    refreshPdfCache();
    const onChange = () => refreshPdfCache();
    window.addEventListener("ql-pdf-cache-change", onChange);
    return () => window.removeEventListener("ql-pdf-cache-change", onChange);
  }, []);

  const pdfCacheBytes = pdfCache.reduce((s, p) => s + p.size, 0);

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

  const clearKeys = async (
    keys: string[], title: string, description: string, successMsg: string,
  ) => {
    const ok = await confirm({
      title, description, confirmText: t.common.delete, cancelText: t.common.cancel, destructive: true,
    });
    if (!ok) return;
    keys.forEach(k => {
      if (k.endsWith("*")) {
        const prefix = k.slice(0, -1);
        Object.keys(localStorage).filter(x => x.startsWith(prefix)).forEach(x => localStorage.removeItem(x));
      } else {
        localStorage.removeItem(k);
      }
    });
    refreshStats();
    toast.success(successMsg);
  };

  const handleExport = () => {
    exportAllData();
    toast.success(t.settings.toastExported);
  };

  const handleImportFile = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    e.target.value = "";
    if (!file) return;
    const ok = await confirm({
      title: t.settings.confirmImportTitle,
      description: t.settings.confirmImportDesc,
      confirmText: t.settings.import,
      cancelText: t.common.cancel,
    });
    if (!ok) return;
    try {
      await importAllData(file);
      toast.success(t.settings.toastImported);
      setTimeout(() => window.location.reload(), 900);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : t.settings.toastImportError);
    }
  };

  const currentAccent = useMemo(() => ACCENTS.find(c => c.id === accent), [accent]);

  return (
    <div className="max-w-2xl mx-auto px-4 py-8">

      {/* En-tête */}
      <div className="flex items-center gap-3 mb-8">
        <div className="size-11 rounded-xl bg-primary/10 flex items-center justify-center shrink-0">
          <HugeiconsIcon icon={Setting06Icon} className="size-5 text-primary" />
        </div>
        <div>
          <h1 className="text-xl font-bold">{t.settings.title}</h1>
          <p className="text-sm text-muted-foreground">{t.settings.subtitle}</p>
        </div>
      </div>

      <div className="flex flex-col gap-4">

        {/* ─── Apparence ─── */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <HugeiconsIcon icon={PaintBrush01Icon} className="size-4 text-primary" />
              {t.settings.appearance}
            </CardTitle>
            <CardDescription>{t.settings.appearanceDesc}</CardDescription>
          </CardHeader>
          <Separator />
          <CardContent className="pt-5 flex flex-col gap-6">

            {/* Thème */}
            <div>
              <p className="text-sm font-medium mb-3">{t.settings.theme}</p>
              <div className="grid grid-cols-3 gap-2">
                {THEMES.map(({ id, labelKey, icon }) => {
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
                      <span className="text-xs font-semibold">{t.settings[labelKey]}</span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Accent */}
            <div>
              <label htmlFor="accent-select" className="block text-sm font-medium mb-3">
                {t.settings.accent}
              </label>
              <Select value={accent} onValueChange={(v) => changeAccent(v as AppSettings["accent"])}>
                <SelectTrigger id="accent-select" className="w-full">
                  <SelectValue>
                    <span className="flex items-center gap-2.5">
                      <span
                        className="size-4 rounded-full shrink-0 ring-1 ring-border"
                        style={{ background: currentAccent?.value }}
                      />
                      <span>{currentAccent ? t.settings[currentAccent.labelKey] : ""}</span>
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
                        <span>{t.settings[c.labelKey]}</span>
                      </span>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <p className="text-xs text-muted-foreground mt-2">{t.settings.accentHint}</p>
            </div>
          </CardContent>
        </Card>

        {/* ─── Statistiques ─── */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <HugeiconsIcon icon={Clock01Icon} className="size-4 text-primary" />
              {t.settings.stats}
            </CardTitle>
            <CardDescription>{t.settings.statsDesc}</CardDescription>
          </CardHeader>
          <Separator />
          <CardContent className="pt-5">
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              <StatCard icon={BookBookmark01Icon} label={t.settings.statBookmarks} value={stats.bookmarks} />
              <StatCard icon={StickyNote01Icon}    label={t.settings.statNotes}     value={stats.notes} />
              <StatCard icon={BookOpenTextIcon}    label={t.settings.statDocs}      value={stats.docs} />
              <StatCard icon={Clock01Icon}         label={t.settings.statTime}      value={stats.readSec >= 60 ? formatDuration(stats.readSec) : "—"} small />
            </div>
          </CardContent>
        </Card>

        {/* ─── Données ─── */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <HugeiconsIcon icon={Database01Icon} className="size-4 text-primary" />
              {t.settings.data}
            </CardTitle>
            <CardDescription>
              {f(t.settings.dataDesc, { size: formatBytes(stats.bytes) })}
            </CardDescription>
          </CardHeader>
          <Separator />
          <CardContent className="pt-5 flex flex-col gap-2">

            <div className="flex items-center justify-between gap-3 p-3 rounded-lg bg-muted/40">
              <div className="min-w-0 flex-1">
                <p className="text-sm font-medium">{t.settings.exportNotes}</p>
                <p className="text-xs text-muted-foreground">{t.settings.exportNotesDesc}</p>
              </div>
              <Button
                variant="outline"
                size="sm"
                disabled={stats.notes === 0}
                onClick={() => exportNotesAsTxt()}
                className="shrink-0"
              >
                <HugeiconsIcon icon={Download01Icon} data-icon="inline-start" />
                {t.settings.export}
              </Button>
            </div>

            <div className="flex items-center justify-between gap-3 p-3 rounded-lg bg-muted/40">
              <div className="min-w-0 flex-1">
                <p className="text-sm font-medium">{t.settings.delBookmarks}</p>
                <p className="text-xs text-muted-foreground">
                  {f(t.settings.delBookmarksCount, { n: stats.bookmarks })}
                </p>
              </div>
              <Button
                variant="ghost"
                size="sm"
                disabled={stats.bookmarks === 0}
                onClick={() => clearKeys(
                  ["ql-bookmarks"],
                  t.settings.delBookmarks,
                  t.settings.confirmDelTitle,
                  t.settings.toastBookmarksDel,
                )}
                className="shrink-0 text-muted-foreground hover:text-destructive"
              >
                <HugeiconsIcon icon={Delete01Icon} />
              </Button>
            </div>

            <div className="flex items-center justify-between gap-3 p-3 rounded-lg bg-muted/40">
              <div className="min-w-0 flex-1">
                <p className="text-sm font-medium">{t.settings.delNotes}</p>
                <p className="text-xs text-muted-foreground">
                  {f(t.settings.delNotesCount, { n: stats.notes })}
                </p>
              </div>
              <Button
                variant="ghost"
                size="sm"
                disabled={stats.notes === 0}
                onClick={() => clearKeys(
                  ["ql-notes"],
                  t.settings.delNotes,
                  t.settings.confirmDelTitle,
                  t.settings.toastNotesDel,
                )}
                className="shrink-0 text-muted-foreground hover:text-destructive"
              >
                <HugeiconsIcon icon={Delete01Icon} />
              </Button>
            </div>

            <div className="flex items-center justify-between gap-3 p-3 rounded-lg bg-muted/40">
              <div className="min-w-0 flex-1">
                <p className="text-sm font-medium">{t.settings.delProgress}</p>
                <p className="text-xs text-muted-foreground">{t.settings.delProgressDesc}</p>
              </div>
              <Button
                variant="ghost"
                size="sm"
                disabled={stats.docs === 0 && stats.readSec === 0}
                onClick={() => clearKeys(
                  ["ql-progress-*", "ql-time-*"],
                  t.settings.delProgress,
                  t.settings.delProgressDesc,
                  t.settings.toastProgressReset,
                )}
                className="shrink-0 text-muted-foreground hover:text-destructive"
              >
                <HugeiconsIcon icon={Delete01Icon} />
              </Button>
            </div>

          </CardContent>
        </Card>

        {/* ─── Cache hors-ligne (PDFs) ─── */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <HugeiconsIcon icon={CloudDownloadIcon} className="size-4 text-primary" />
              {t.settings.offlineCache}
            </CardTitle>
            <CardDescription>{t.settings.offlineCacheDesc}</CardDescription>
          </CardHeader>
          <Separator />
          <CardContent className="pt-5 flex flex-col gap-3">
            {pdfCache.length === 0 ? (
              <p className="text-sm text-muted-foreground py-2">
                {t.settings.offlineCacheEmpty}
              </p>
            ) : (
              <>
                <div className="flex items-center justify-between gap-3 p-3 rounded-lg bg-muted/40">
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-medium">
                      {f(t.settings.offlineCacheSummary, {
                        n: String(pdfCache.length),
                        size: formatBytes(pdfCacheBytes),
                      })}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {t.settings.offlineCacheHint}
                    </p>
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={async () => {
                      const ok = await confirm({
                        title: t.settings.confirmClearCacheTitle,
                        description: t.settings.confirmClearCacheDesc,
                        confirmText: t.common.delete,
                        cancelText: t.common.cancel,
                        destructive: true,
                      });
                      if (!ok) return;
                      await clearPdfCache();
                      toast.success(t.settings.toastPdfCacheCleared);
                    }}
                    className="shrink-0 text-muted-foreground hover:text-destructive"
                  >
                    <HugeiconsIcon icon={Delete01Icon} />
                  </Button>
                </div>
                <ul className="text-xs text-muted-foreground space-y-1 ps-1">
                  {pdfCache.map((p) => (
                    <li key={p.docId} className="flex justify-between gap-3">
                      <span className="truncate">{p.filename}</span>
                      <span className="tabular-nums shrink-0">{formatBytes(p.size)}</span>
                    </li>
                  ))}
                </ul>
              </>
            )}
          </CardContent>
        </Card>

        {/* ─── Sauvegarde & transfert ─── */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <HugeiconsIcon icon={Upload01Icon} className="size-4 text-primary" />
              {t.settings.backup}
            </CardTitle>
            <CardDescription>{t.settings.backupDesc}</CardDescription>
          </CardHeader>
          <Separator />
          <CardContent className="pt-5 flex flex-col gap-2">
            <div className="flex items-center justify-between gap-3 p-3 rounded-lg bg-muted/40">
              <div className="min-w-0 flex-1">
                <p className="text-sm font-medium">{t.settings.exportData}</p>
                <p className="text-xs text-muted-foreground">{t.settings.exportDataDesc}</p>
              </div>
              <Button variant="outline" size="sm" onClick={handleExport} className="shrink-0">
                <HugeiconsIcon icon={Download01Icon} data-icon="inline-start" />
                {t.settings.export}
              </Button>
            </div>
            <div className="flex items-center justify-between gap-3 p-3 rounded-lg bg-muted/40">
              <div className="min-w-0 flex-1">
                <p className="text-sm font-medium">{t.settings.importData}</p>
                <p className="text-xs text-muted-foreground">{t.settings.importDataDesc}</p>
              </div>
              <Button variant="outline" size="sm" onClick={() => fileInputRef.current?.click()} className="shrink-0">
                <HugeiconsIcon icon={Upload01Icon} data-icon="inline-start" />
                {t.settings.import}
              </Button>
            </div>
            <input
              ref={fileInputRef}
              type="file"
              accept="application/json,.json"
              onChange={handleImportFile}
              className="hidden"
            />
            <p className="text-[11px] text-muted-foreground leading-relaxed pt-1">
              💡 {t.settings.backupHint}
            </p>
          </CardContent>
        </Card>

        {/* ─── Zone dangereuse ─── */}
        <Card className="border-destructive/30">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-destructive">
              <HugeiconsIcon icon={AlertCircleIcon} className="size-4" />
              {t.settings.danger}
            </CardTitle>
            <CardDescription>{t.settings.dangerDesc}</CardDescription>
          </CardHeader>
          <Separator />
          <CardContent className="pt-5">
            <Button
              variant="destructive"
              className="w-full sm:w-auto"
              onClick={async () => {
                const ok = await confirm({
                  title: t.settings.confirmResetTitle,
                  description: t.settings.confirmResetDesc,
                  confirmText: t.settings.confirmResetBtn,
                  cancelText: t.common.cancel,
                  destructive: true,
                });
                if (!ok) return;
                Object.keys(localStorage).filter(k => k.startsWith("ql-")).forEach(k => localStorage.removeItem(k));
                toast.success(t.settings.toastAllDeleted);
                setTimeout(() => window.location.reload(), 900);
              }}
            >
              <HugeiconsIcon icon={Delete01Icon} data-icon="inline-start" />
              {t.settings.resetAll}
            </Button>
          </CardContent>
        </Card>

        {/* ─── À propos ─── */}
        <Card>
          <CardHeader>
            <CardTitle>{t.settings.about}</CardTitle>
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
              {t.settings.aboutText}
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
