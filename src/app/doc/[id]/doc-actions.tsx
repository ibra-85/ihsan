"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { HugeiconsIcon } from "@hugeicons/react";
import {
  BookOpenTextIcon,
  Download01Icon,
  Share01Icon,
  CopyCheckIcon,
  Clock01Icon,
  BookBookmark01Icon,
  StickyNote01Icon,
  ArrowRight01Icon,
} from "@hugeicons/core-free-icons";
import {
  getBookmarks, getNotes, getLastPage, getReadingTime, formatReadingTime,
} from "@/lib/store";
import { getDocumentUrl } from "@/lib/documents";
import { useI18n } from "@/components/i18n-provider";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { cn } from "@/lib/utils";

export function DocActions({
  docId, filename, title, totalPages,
}: {
  docId: string;
  filename: string;
  title: string;
  totalPages?: number;
}) {
  const { t, f } = useI18n();
  const [stats, setStats] = useState({ page: 1, bookmarks: 0, notes: 0, time: 0 });
  const [shared, setShared] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    setStats({
      page: getLastPage(docId),
      bookmarks: getBookmarks().filter(b => b.docId === docId).length,
      notes: getNotes(docId).length,
      time: getReadingTime(docId),
    });
  }, [docId]);

  const hasProgress = mounted && (stats.page > 1 || stats.bookmarks > 0 || stats.notes > 0 || stats.time >= 60);
  const progressPct = totalPages && stats.page > 1
    ? Math.min(100, Math.round((stats.page / totalPages) * 100))
    : null;

  const share = async () => {
    const url = `${window.location.origin}/reader/${docId}`;
    try {
      if (navigator.share) {
        await navigator.share({ title: `Ihsan — ${title}`, url });
      } else {
        await navigator.clipboard.writeText(url);
        setShared(true);
        setTimeout(() => setShared(false), 2000);
      }
    } catch { /* annulé */ }
  };

  return (
    <>
      {/* Actions principales */}
      <div className="flex flex-col sm:flex-row gap-2 mb-6">
        <Button asChild size="lg" className="flex-1 h-12 text-base font-semibold">
          <Link href={`/reader/${docId}${hasProgress && stats.page > 1 ? `#p${stats.page}` : ""}`}>
            <HugeiconsIcon icon={BookOpenTextIcon} data-icon="inline-start" />
            {hasProgress && stats.page > 1 ? f(t.doc.resume, { n: stats.page }) : t.doc.readDoc}
          </Link>
        </Button>
        <Button asChild variant="outline" size="lg" className="h-12">
          <a href={getDocumentUrl(filename)} download target="_blank" rel="noopener">
            <HugeiconsIcon icon={Download01Icon} data-icon="inline-start" />
            {t.doc.download}
          </a>
        </Button>
        <Button variant="outline" size="lg" onClick={share} className="h-12" title={t.doc.share}>
          <HugeiconsIcon icon={shared ? CopyCheckIcon : Share01Icon} />
        </Button>
      </div>

      {/* Bloc stats personnelles — affiché seulement si activité */}
      {hasProgress && (
        <Card className="mb-6 p-4 bg-primary/5 border-primary/20">
          <p className="text-xs font-semibold uppercase tracking-wider text-primary mb-3">
            {t.doc.yourReading}
          </p>

          {/* Barre de progression */}
          {progressPct !== null && totalPages && (
            <div className="mb-4">
              <div className="flex items-center justify-between text-xs mb-1.5">
                <span className="text-muted-foreground">
                  {f(t.doc.pageOf, { n: stats.page, total: totalPages })}
                </span>
                <span className="font-semibold text-primary tabular-nums">{progressPct}%</span>
              </div>
              <div className="h-2 bg-muted rounded-full overflow-hidden">
                <div
                  className="h-full bg-primary transition-all duration-500 ease-out"
                  style={{ width: `${progressPct}%` }}
                />
              </div>
            </div>
          )}

          {/* Mini stats */}
          <div className="grid grid-cols-3 gap-2">
            <MiniStat icon={BookBookmark01Icon} value={stats.bookmarks} label={t.doc.miscBookmarks} />
            <MiniStat icon={StickyNote01Icon}    value={stats.notes}     label={t.doc.miscNotes} />
            <MiniStat icon={Clock01Icon}         value={stats.time >= 60 ? formatReadingTime(stats.time) : "—"} label={t.doc.miscTime} />
          </div>

          {stats.page > 1 && (
            <Button asChild size="sm" variant="ghost" className="w-full mt-3 text-primary hover:text-primary hover:bg-primary/10">
              <Link href={`/reader/${docId}#p${stats.page}`}>
                {t.doc.resumeReading}
                <HugeiconsIcon icon={ArrowRight01Icon} data-icon="inline-end" className="rtl:rotate-180" />
              </Link>
            </Button>
          )}
        </Card>
      )}
    </>
  );
}

function MiniStat({ icon, value, label }: { icon: Parameters<typeof HugeiconsIcon>[0]["icon"]; value: string | number; label: string }) {
  const isEmpty = value === 0 || value === "—";
  return (
    <div className={cn(
      "flex flex-col items-center justify-center text-center gap-0.5 py-2 rounded-lg bg-background/60",
      isEmpty && "opacity-50"
    )}>
      <HugeiconsIcon icon={icon} className="size-4 text-primary" />
      <p className="text-sm font-bold tabular-nums leading-tight">{value}</p>
      <p className="text-[10px] uppercase tracking-wide text-muted-foreground leading-tight">{label}</p>
    </div>
  );
}
