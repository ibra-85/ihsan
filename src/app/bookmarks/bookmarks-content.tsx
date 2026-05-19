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
import { getBookmarks, removeBookmark, type Bookmark } from "@/lib/store";
import { getDocument, CATEGORIES } from "@/lib/documents";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Separator } from "@/components/ui/separator";
import Link from "next/link";
import { cn } from "@/lib/utils";

/** Format relatif léger en français (sans lib). */
function formatRelative(ts: number): string {
  const diff = Date.now() - ts;
  const sec  = Math.floor(diff / 1000);
  const min  = Math.floor(sec / 60);
  const hour = Math.floor(min / 60);
  const day  = Math.floor(hour / 24);
  if (sec < 60)  return "à l'instant";
  if (min < 60)  return `il y a ${min} min`;
  if (hour < 24) return `il y a ${hour} h`;
  if (day === 1) return "hier";
  if (day < 7)   return `il y a ${day} jours`;
  if (day < 30)  return `il y a ${Math.floor(day / 7)} sem.`;
  if (day < 365) return `il y a ${Math.floor(day / 30)} mois`;
  return new Date(ts).toLocaleDateString("fr-FR");
}

export default function BookmarksContent() {
  const router = useRouter();
  const [bookmarks, setBookmarks] = useState<Bookmark[]>([]);
  const [search, setSearch] = useState("");

  useEffect(() => {
    setBookmarks(getBookmarks());
  }, []);

  /* Grouper par document, trier par dernière activité */
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
      return doc?.title.toLowerCase().includes(q)
          || doc?.titleAr?.toLowerCase().includes(q);
    });
  }, [groups, search]);

  const total = bookmarks.length;
  const docCount = groups.length;

  const removeBm = (e: React.MouseEvent, docId: string, page: number) => {
    e.stopPropagation();
    e.preventDefault();
    removeBookmark(docId, page);
    setBookmarks(getBookmarks());
  };

  const removeAllFromDoc = (docId: string, docTitle: string) => {
    const count = bookmarks.filter(b => b.docId === docId).length;
    if (!confirm(`Supprimer les ${count} marque-page${count > 1 ? "s" : ""} de « ${docTitle} » ?`)) return;
    bookmarks.filter(b => b.docId === docId).forEach(b => removeBookmark(b.docId, b.page));
    setBookmarks(getBookmarks());
  };

  return (
    <div className="max-w-3xl mx-auto px-4 py-8">

      {/* En-tête */}
      <div className="flex items-center gap-3 mb-6">
        <div className="size-11 rounded-xl bg-primary/10 flex items-center justify-center shrink-0">
          <HugeiconsIcon icon={BookBookmark01Icon} className="size-5 text-primary" />
        </div>
        <div className="flex-1 min-w-0">
          <h1 className="text-xl font-bold">Marque-pages</h1>
          {total > 0 ? (
            <p className="text-sm text-muted-foreground">
              <span className="font-medium text-foreground">{total}</span> page{total > 1 ? "s" : ""} dans{" "}
              <span className="font-medium text-foreground">{docCount}</span> document{docCount > 1 ? "s" : ""}
            </p>
          ) : (
            <p className="text-sm text-muted-foreground">Aucun marque-page enregistré</p>
          )}
        </div>
      </div>

      {/* Empty state */}
      {total === 0 ? (
        <Card className="flex flex-col items-center text-center py-16 px-6 gap-3">
          <div className="text-6xl mb-2 opacity-80">🔖</div>
          <p className="font-semibold text-base">Aucun marque-page</p>
          <p className="text-sm text-muted-foreground max-w-sm leading-relaxed">
            Pendant la lecture, cliquez sur l&apos;icône marque-page de la barre d&apos;outils pour sauvegarder la page courante.
          </p>
          <Button asChild size="sm" className="mt-3">
            <Link href="/">
              <HugeiconsIcon icon={BookOpenTextIcon} data-icon="inline-start" />
              Parcourir la bibliothèque
            </Link>
          </Button>
        </Card>
      ) : (
        <>
          {/* Recherche — seulement si > 3 marque-pages */}
          {total > 3 && (
            <div className="relative mb-4">
              <HugeiconsIcon icon={Search01Icon} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground pointer-events-none size-4" />
              <Input
                value={search}
                onChange={e => setSearch(e.target.value)}
                placeholder="Filtrer par document..."
                className="pl-9 pr-9 h-10"
              />
              {search && (
                <button
                  onClick={() => setSearch("")}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                  aria-label="Effacer"
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
              <p className="text-sm text-muted-foreground">Aucun document correspondant à « {search} »</p>
              <Button size="sm" variant="ghost" onClick={() => setSearch("")} className="mt-3">
                Effacer la recherche
              </Button>
            </Card>
          ) : (
            <div className="flex flex-col gap-3">
              {filteredGroups.map(group => {
                const doc = getDocument(group.docId);
                const catEmoji = CATEGORIES.find(c => c.id === doc?.category)?.emoji ?? "📖";
                const docTitle = doc?.title ?? group.docId;
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
                          title="Voir les détails du document"
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
                        {pageCount} page{pageCount > 1 ? "s" : ""}
                      </span>
                      <Button
                        variant="ghost"
                        size="icon-xs"
                        onClick={() => removeAllFromDoc(group.docId, docTitle)}
                        className="text-muted-foreground hover:text-destructive shrink-0"
                        title="Supprimer tous les marque-pages de ce document"
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
                            <p className="text-sm font-medium">Page {bm.page}</p>
                            <p className="text-xs text-muted-foreground">{formatRelative(bm.createdAt)}</p>
                          </div>
                          <HugeiconsIcon
                            icon={ArrowRight01Icon}
                            className="size-4 text-muted-foreground/40 group-hover:text-primary group-hover:translate-x-0.5 transition-all shrink-0"
                          />
                          <Button
                            variant="ghost"
                            size="icon-xs"
                            onClick={(e) => removeBm(e, bm.docId, bm.page)}
                            className="text-muted-foreground hover:text-destructive shrink-0 opacity-0 group-hover:opacity-100 focus:opacity-100 transition-opacity"
                            title="Supprimer ce marque-page"
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
