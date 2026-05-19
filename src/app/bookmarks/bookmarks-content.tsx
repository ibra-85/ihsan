"use client";

import { useEffect, useState, useMemo } from "react";
import { useRouter } from "next/navigation";
import { HugeiconsIcon } from "@hugeicons/react";
import {
  BookBookmark01Icon,
  Delete01Icon,
  ArrowRight01Icon,
  Search01Icon,
  Cancel01Icon,
  BookOpenTextIcon,
} from "@hugeicons/core-free-icons";
import { toast } from "sonner";
import { getBookmarks, removeBookmark, type Bookmark } from "@/lib/store";
import { getDocument, CATEGORIES } from "@/lib/documents";
import { useI18n } from "@/components/i18n-provider";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Separator } from "@/components/ui/separator";
import { useConfirm } from "@/components/confirm-provider";
import Link from "next/link";
import { cn } from "@/lib/utils";

/** Format relatif localisé via Intl.RelativeTimeFormat. */
function formatRelative(ts: number, locale: string): string {
  const sec = Math.round((ts - Date.now()) / 1000);
  const rtf = new Intl.RelativeTimeFormat(locale, { numeric: "auto" });
  if (Math.abs(sec) < 60) return rtf.format(sec, "second");
  const min = Math.round(sec / 60);
  if (Math.abs(min) < 60) return rtf.format(min, "minute");
  const hour = Math.round(sec / 3600);
  if (Math.abs(hour) < 24) return rtf.format(hour, "hour");
  const day = Math.round(sec / 86400);
  if (Math.abs(day) < 30) return rtf.format(day, "day");
  const month = Math.round(day / 30);
  if (Math.abs(month) < 12) return rtf.format(month, "month");
  return new Date(ts).toLocaleDateString(locale);
}

export default function BookmarksContent() {
  const router = useRouter();
  const confirm = useConfirm();
  const { t, f, locale } = useI18n();
  const [bookmarks, setBookmarks] = useState<Bookmark[]>([]);
  const [search, setSearch] = useState("");

  useEffect(() => {
    setBookmarks(getBookmarks());
  }, []);

  const groups = useMemo(() => {
    const map = new Map<string, Bookmark[]>();
    for (const bm of bookmarks) {
      if (!map.has(bm.docId)) map.set(bm.docId, []);
      map.get(bm.docId)!.push(bm);
    }
    return Array.from(map.entries())
      .map(([docId, items]) => ({
        docId,
        items: items.sort((a, b) => a.page - b.page),
        lastActivity: Math.max(...items.map(i => i.createdAt)),
      }))
      .sort((a, b) => b.lastActivity - a.lastActivity);
  }, [bookmarks]);

  const filteredGroups = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return groups;
    return groups.filter(g => {
      const doc = getDocument(g.docId);
      return doc?.title[locale].toLowerCase().includes(q)
          || doc?.titleAr?.toLowerCase().includes(q);
    });
  }, [groups, search, locale]);

  const total = bookmarks.length;
  const docCount = groups.length;

  const removeBm = (e: React.MouseEvent, docId: string, page: number) => {
    e.stopPropagation();
    e.preventDefault();
    removeBookmark(docId, page);
    setBookmarks(getBookmarks());
  };

  const removeAllFromDoc = async (docId: string, docTitle: string) => {
    const count = bookmarks.filter(b => b.docId === docId).length;
    const ok = await confirm({
      title: t.bookmarks.confirmRemoveAllTitle,
      description: f(t.bookmarks.confirmRemoveAllDesc, { n: count, title: docTitle }),
      confirmText: t.common.delete,
      cancelText: t.common.cancel,
      destructive: true,
    });
    if (!ok) return;
    bookmarks.filter(b => b.docId === docId).forEach(b => removeBookmark(b.docId, b.page));
    setBookmarks(getBookmarks());
    toast.success(f(t.bookmarks.removedToast, { title: docTitle }));
  };

  return (
    <div className="max-w-3xl mx-auto px-4 py-8">

      {/* En-tête */}
      <div className="flex items-center gap-3 mb-6">
        <div className="size-11 rounded-xl bg-primary/10 flex items-center justify-center shrink-0">
          <HugeiconsIcon icon={BookBookmark01Icon} className="size-5 text-primary" />
        </div>
        <div className="flex-1 min-w-0">
          <h1 className="text-xl font-bold">{t.bookmarks.title}</h1>
          <p className="text-sm text-muted-foreground">
            {total > 0 ? f(t.bookmarks.countSummary, { n: total, docs: docCount }) : t.bookmarks.none}
          </p>
        </div>
      </div>

      {/* Empty state */}
      {total === 0 ? (
        <Card className="flex flex-col items-center text-center py-16 px-6 gap-3">
          <div className="text-6xl mb-2 opacity-80">🔖</div>
          <p className="font-semibold text-base">{t.bookmarks.emptyTitle}</p>
          <p className="text-sm text-muted-foreground max-w-sm leading-relaxed">
            {t.bookmarks.emptyHint}
          </p>
          <Button asChild size="sm" className="mt-3">
            <Link href="/">
              <HugeiconsIcon icon={BookOpenTextIcon} data-icon="inline-start" />
              {t.bookmarks.browse}
            </Link>
          </Button>
        </Card>
      ) : (
        <>
          {/* Recherche — seulement si > 3 marque-pages */}
          {total > 3 && (
            <div className="relative mb-4">
              <HugeiconsIcon icon={Search01Icon} className="absolute start-3 top-1/2 -translate-y-1/2 text-muted-foreground pointer-events-none size-4" />
              <Input
                value={search}
                onChange={e => setSearch(e.target.value)}
                placeholder={t.bookmarks.filterPlaceholder}
                className="ps-9 pe-9 h-10"
              />
              {search && (
                <button
                  onClick={() => setSearch("")}
                  className="absolute end-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                  aria-label={t.common.close}
                >
                  <HugeiconsIcon icon={Cancel01Icon} className="size-4" />
                </button>
              )}
            </div>
          )}

          {/* Résultats vides après recherche */}
          {filteredGroups.length === 0 ? (
            <Card className="text-center py-10 px-4">
              <p className="text-3xl mb-2">🔍</p>
              <p className="text-sm text-muted-foreground">{f(t.bookmarks.noMatch, { q: search })}</p>
              <Button size="sm" variant="ghost" onClick={() => setSearch("")} className="mt-3">
                {t.bookmarks.clearSearch}
              </Button>
            </Card>
          ) : (
            <div className="flex flex-col gap-3">
              {filteredGroups.map(group => {
                const doc = getDocument(group.docId);
                const catEmoji = CATEGORIES.find(c => c.id === doc?.category)?.emoji ?? "📖";
                const docTitle = doc?.title[locale] ?? group.docId;
                const pageCount = group.items.length;

                return (
                  <Card key={group.docId} className="overflow-hidden flex flex-col p-0">

                    {/* Header du groupe */}
                    <div className="px-4 py-3 flex items-center gap-3 bg-muted/30">
                      <span className="text-2xl shrink-0" aria-hidden>{catEmoji}</span>
                      <div className="flex-1 min-w-0">
                        <Link
                          href={`/doc/${group.docId}`}
                          className="text-sm font-semibold truncate hover:text-primary transition-colors block"
                          title={t.library.details}
                        >
                          {docTitle}
                        </Link>
                        {doc?.titleAr && (
                          <p
                            dir="rtl"
                            lang="ar"
                            className="text-xs text-muted-foreground truncate mt-0.5"
                            style={{ fontFamily: "var(--font-arabic, serif)" }}
                          >
                            {doc.titleAr}
                          </p>
                        )}
                      </div>
                      <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-1 rounded-full bg-primary/10 text-primary shrink-0 tabular-nums">
                        {pageCount} {t.bookmarks.pages}
                      </span>
                      <Button
                        variant="ghost"
                        size="icon-xs"
                        onClick={() => removeAllFromDoc(group.docId, docTitle)}
                        className="text-muted-foreground hover:text-destructive shrink-0"
                        title={t.bookmarks.removeAll}
                      >
                        <HugeiconsIcon icon={Delete01Icon} />
                      </Button>
                    </div>

                    <Separator />

                    {/* Liste des pages */}
                    <ul className="flex flex-col">
                      {group.items.map((bm, idx) => (
                        <li
                          key={`${bm.docId}-${bm.page}`}
                          onClick={() => router.push(`/reader/${bm.docId}#p${bm.page}`)}
                          className={cn(
                            "flex items-center gap-3 px-4 py-2.5 cursor-pointer hover:bg-muted/50 transition-colors group",
                            idx < group.items.length - 1 && "border-b"
                          )}
                        >
                          <span className="size-7 rounded-md bg-primary/10 text-primary text-xs font-bold flex items-center justify-center tabular-nums shrink-0">
                            {bm.page}
                          </span>
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-medium">{t.common.page} {bm.page}</p>
                            <p className="text-xs text-muted-foreground">{formatRelative(bm.createdAt, locale)}</p>
                          </div>
                          <HugeiconsIcon
                            icon={ArrowRight01Icon}
                            className="size-4 text-muted-foreground/40 group-hover:text-primary group-hover:translate-x-0.5 transition-all shrink-0 rtl:rotate-180"
                          />
                          <Button
                            variant="ghost"
                            size="icon-xs"
                            onClick={(e) => removeBm(e, bm.docId, bm.page)}
                            className="text-muted-foreground hover:text-destructive shrink-0 opacity-0 group-hover:opacity-100 focus:opacity-100 transition-opacity"
                            title={t.bookmarks.removeOne}
                          >
                            <HugeiconsIcon icon={Delete01Icon} />
                          </Button>
                        </li>
                      ))}
                    </ul>
                  </Card>
                );
              })}
            </div>
          )}
        </>
      )}
    </div>
  );
}
