"use client";

import { useState, useMemo, useEffect, useRef } from "react";
import Link from "next/link";
import { HugeiconsIcon } from "@hugeicons/react";
import {
  Search01Icon,
  BookOpenTextIcon,
  Download01Icon,
  Clock01Icon,
  Cancel01Icon,
  InformationCircleIcon,
  FilterIcon,
  Tick01Icon,
} from "@hugeicons/core-free-icons";
import { DOCUMENTS, CATEGORIES, LANGUAGES, filterDocuments, type DocCategory, type DocLanguage } from "@/lib/documents";
import { getLastPage, getReadingTime, formatReadingTime } from "@/lib/store";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardFooter } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Popover, PopoverTrigger, PopoverContent } from "@/components/ui/popover";
import { cn } from "@/lib/utils";

const LEVEL_CLASS: Record<string, string> = {
  "debutant":      "bg-success/15 text-success",
  "intermediaire": "bg-warning/15 text-warning",
  "avance":        "bg-destructive/15 text-destructive",
};

const LANG: Record<string, string> = {
  ar: "Arabe", fr: "Français", "ar-fr": "AR / FR",
  ru: "Russe", ce: "Tchétchène", "ar-ru": "AR / Russe", "ar-ce": "AR / Tchét.",
};

const CAT_LIST = CATEGORIES.filter(c => c.id !== "all");
const LANG_LIST = LANGUAGES.filter(l => l.id !== "all");

export default function LibraryContent() {
  const [search, setSearch] = useState("");
  const [cats, setCats]     = useState<Set<DocCategory>>(new Set());
  const [langs, setLangs]   = useState<Set<DocLanguage>>(new Set());

  const filtered = useMemo(
    () => filterDocuments(DOCUMENTS, cats, search, langs),
    [cats, search, langs]
  );

  const toggleCat  = (id: DocCategory) => {
    setCats(p => { const n = new Set(p); n.has(id) ? n.delete(id) : n.add(id); return n; });
  };
  const toggleLang = (id: DocLanguage) => {
    setLangs(p => { const n = new Set(p); n.has(id) ? n.delete(id) : n.add(id); return n; });
  };

  const [progressMap, setProgressMap] = useState<Record<string, number>>({});
  const [timeMap, setTimeMap] = useState<Record<string, number>>({});
  useEffect(() => {
    const progress: Record<string, number> = {};
    const time: Record<string, number> = {};
    DOCUMENTS.forEach(doc => {
      progress[doc.id] = getLastPage(doc.id);
      time[doc.id] = getReadingTime(doc.id);
    });
    setProgressMap(progress);
    setTimeMap(time);
  }, []);

  const activeFilterCount = cats.size + langs.size;
  const hasFilters = activeFilterCount > 0 || search !== "";
  const resetFilters = () => { setCats(new Set()); setLangs(new Set()); setSearch(""); };

  /* ── Pre-cache au hover (mouse uniquement, 250 ms delay) ── */
  const prefetchedRef = useRef<Set<string>>(new Set());
  const hoverTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const handleHover = (e: React.PointerEvent, filename: string) => {
    if (e.pointerType !== "mouse") return; // skip touch/pen
    if (prefetchedRef.current.has(filename)) return;
    if (hoverTimerRef.current) clearTimeout(hoverTimerRef.current);
    hoverTimerRef.current = setTimeout(() => {
      const link = document.createElement("link");
      link.rel = "prefetch";
      link.as = "fetch";
      link.href = `/docs/${filename}`;
      document.head.appendChild(link);
      prefetchedRef.current.add(filename);
    }, 250);
  };

  const cancelHover = () => {
    if (hoverTimerRef.current) {
      clearTimeout(hoverTimerRef.current);
      hoverTimerRef.current = null;
    }
  };

  return (
    <div className="max-w-6xl mx-auto px-4 py-8">

      {/* En-tête */}
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-foreground mb-1">Bibliothèque Islamique</h1>
        <p className="text-sm text-muted-foreground">{DOCUMENTS.length} documents disponibles</p>
      </div>

      {/* Ligne Filtres + Reset */}
      <div className="flex items-center gap-2 mb-3">
        <Popover>
          <PopoverTrigger asChild>
            <Button variant="outline" size="sm" className="gap-2">
              <HugeiconsIcon icon={FilterIcon} data-icon="inline-start" />
              Filtres
              {activeFilterCount > 0 && (
                <span className="ml-1 size-5 rounded-full bg-primary text-primary-foreground text-[10px] font-bold flex items-center justify-center tabular-nums">
                  {activeFilterCount}
                </span>
              )}
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-80 p-0" align="start">
            <FilterPanel
              cats={cats}
              langs={langs}
              onToggleCat={toggleCat}
              onToggleLang={toggleLang}
              onClearCats={() => setCats(new Set())}
              onClearLangs={() => setLangs(new Set())}
            />
          </PopoverContent>
        </Popover>

        {/* Chips des filtres actifs */}
        {activeFilterCount > 0 && (
          <div className="flex items-center gap-1.5 flex-wrap flex-1 min-w-0">
            {[...cats].map(id => {
              const c = CAT_LIST.find(c => c.id === id);
              if (!c) return null;
              return (
                <button
                  key={`cat-${id}`}
                  onClick={() => toggleCat(id)}
                  className="inline-flex items-center gap-1 text-xs px-2 py-0.5 rounded-full bg-primary/10 text-primary hover:bg-primary/20 transition-colors"
                  title="Retirer ce filtre"
                >
                  {c.emoji} {c.label}
                  <HugeiconsIcon icon={Cancel01Icon} className="size-3" />
                </button>
              );
            })}
            {[...langs].map(id => {
              const l = LANG_LIST.find(l => l.id === id);
              if (!l) return null;
              return (
                <button
                  key={`lang-${id}`}
                  onClick={() => toggleLang(id)}
                  className="inline-flex items-center gap-1 text-xs px-2 py-0.5 rounded-full bg-muted hover:bg-muted/70 transition-colors"
                  title="Retirer ce filtre"
                >
                  {l.label}
                  <HugeiconsIcon icon={Cancel01Icon} className="size-3" />
                </button>
              );
            })}
          </div>
        )}

        {hasFilters && (
          <Button
            size="sm"
            variant="ghost"
            onClick={resetFilters}
            className="ml-auto text-muted-foreground gap-1 shrink-0"
          >
            <HugeiconsIcon icon={Cancel01Icon} className="size-3.5" />
            Réinitialiser
          </Button>
        )}
      </div>

      {/* Barre de recherche */}
      <div className="relative mb-5">
        <HugeiconsIcon icon={Search01Icon} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground pointer-events-none size-4" />
        <Input
          value={search}
          onChange={e => setSearch(e.target.value)}
          placeholder="Rechercher un document, une sourate, un thème..."
          className="pl-9 pr-9 h-11 text-sm"
        />
        {search && (
          <button
            onClick={() => setSearch("")}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
            aria-label="Effacer la recherche"
          >
            <HugeiconsIcon icon={Cancel01Icon} className="size-4" />
          </button>
        )}
      </div>

      {/* Compteur de résultats */}
      <div className="flex items-center justify-between mb-4 min-h-[24px]">
        <p className="text-sm text-muted-foreground">
          {hasFilters && filtered.length !== DOCUMENTS.length
            ? <><span className="font-semibold text-foreground">{filtered.length}</span> sur {DOCUMENTS.length} document{DOCUMENTS.length > 1 ? "s" : ""}</>
            : <><span className="font-semibold text-foreground">{DOCUMENTS.length}</span> document{DOCUMENTS.length > 1 ? "s" : ""}</>
          }
        </p>
      </div>

      {filtered.length === 0 ? (
        <div className="text-center py-16 rounded-xl border bg-card">
          <p className="text-4xl mb-3">📭</p>
          <p className="text-muted-foreground mb-3">Aucun document trouvé</p>
          <Button size="sm" variant="outline" onClick={resetFilters}>Effacer les filtres</Button>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {filtered.map(doc => {
            const levelKey = doc.level
              ?.normalize("NFD").replace(/[̀-ͯ]/g, "").toLowerCase().replace(/\s/g, "") ?? "";
            const levelClass = LEVEL_CLASS[levelKey];
            const lastPage = progressMap[doc.id] ?? 1;
            const catEmoji = CATEGORIES.find(c => c.id === doc.category)?.emoji ?? "📖";

            return (
              <Card
                key={doc.id}
                className="group hover:-translate-y-0.5 transition-transform flex flex-col"
                onPointerEnter={(e) => handleHover(e, doc.filename)}
                onPointerLeave={cancelHover}
              >

                <Link href={`/reader/${doc.id}`} className="flex flex-col flex-1 gap-3 px-4 pt-4">
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex-1 min-w-0">
                      <h3 className="font-semibold text-sm truncate">{doc.title}</h3>
                      {doc.titleAr && (
                        <p
                          dir="rtl"
                          lang="ar"
                          className="text-lg mt-0.5 text-primary"
                          style={{ fontFamily: "var(--font-arabic, serif)" }}
                        >
                          {doc.titleAr}
                        </p>
                      )}
                    </div>
                    <span className="text-2xl shrink-0">{catEmoji}</span>
                  </div>

                  <p className="text-xs text-muted-foreground leading-relaxed line-clamp-2">
                    {doc.description}
                  </p>

                  <div className="flex items-center gap-2 flex-wrap pb-3">
                    {levelClass && (
                      <Badge variant="outline" className={cn("text-xs", levelClass)}>
                        {doc.level}
                      </Badge>
                    )}
                    <span className="text-xs text-muted-foreground">{LANG[doc.language]}</span>
                  </div>
                </Link>

                <Separator />

                <CardFooter className="flex items-center justify-between py-2 px-4">
                  <div className="flex items-center gap-3">
                    <Link href={`/reader/${doc.id}`} className="flex items-center gap-1">
                      {lastPage > 1 ? (
                        <span className="flex items-center gap-1 text-xs text-primary">
                          <HugeiconsIcon icon={Clock01Icon} className="size-3" /> Page {lastPage}
                        </span>
                      ) : (
                        <span className="flex items-center gap-1 text-xs text-muted-foreground group-hover:text-primary transition-colors">
                          <HugeiconsIcon icon={BookOpenTextIcon} className="size-3" /> Lire
                        </span>
                      )}
                    </Link>
                    {timeMap[doc.id] >= 60 && (
                      <span className="text-xs text-muted-foreground">
                        {formatReadingTime(timeMap[doc.id])}
                      </span>
                    )}
                  </div>
                  <div className="flex items-center gap-1">
                    <Button variant="ghost" size="icon-xs" asChild title="Détails du document">
                      <Link href={`/doc/${doc.id}`}>
                        <HugeiconsIcon icon={InformationCircleIcon} />
                      </Link>
                    </Button>
                    <Button variant="ghost" size="icon-xs" asChild>
                      <a href={`/docs/${doc.filename}`} download title="Télécharger">
                        <HugeiconsIcon icon={Download01Icon} />
                      </a>
                    </Button>
                  </div>
                </CardFooter>

              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}

/* ─────────────────────────────────────────────────────────── */
/* Panneau de filtres dans le popover                          */
/* ─────────────────────────────────────────────────────────── */

function FilterPanel({
  cats, langs, onToggleCat, onToggleLang, onClearCats, onClearLangs,
}: {
  cats: Set<DocCategory>;
  langs: Set<DocLanguage>;
  onToggleCat: (id: DocCategory) => void;
  onToggleLang: (id: DocLanguage) => void;
  onClearCats: () => void;
  onClearLangs: () => void;
}) {
  return (
    <div className="flex flex-col max-h-[70vh]">
      {/* En-tête */}
      <div className="px-4 py-3 border-b flex items-center justify-between">
        <div className="flex items-center gap-2">
          <HugeiconsIcon icon={FilterIcon} className="size-4 text-primary" />
          <span className="text-sm font-semibold">Filtres</span>
        </div>
        {(cats.size > 0 || langs.size > 0) && (
          <button
            onClick={() => { onClearCats(); onClearLangs(); }}
            className="text-xs text-muted-foreground hover:text-foreground transition-colors"
          >
            Tout effacer
          </button>
        )}
      </div>

      <div className="overflow-y-auto p-2">
        {/* Catégories */}
        <FilterSection
          label="Catégorie"
          activeCount={cats.size}
          onClear={onClearCats}
        >
          {CAT_LIST.map(c => {
            const id = c.id as DocCategory;
            const count = DOCUMENTS.filter(d => d.category === id).length;
            return (
              <FilterRow
                key={c.id}
                active={cats.has(id)}
                disabled={count === 0}
                count={count}
                onClick={() => onToggleCat(id)}
              >
                <span className="text-base mr-2">{c.emoji}</span>
                {c.label}
              </FilterRow>
            );
          })}
        </FilterSection>

        <div className="h-px bg-border my-2" />

        {/* Langues */}
        <FilterSection
          label="Langue"
          activeCount={langs.size}
          onClear={onClearLangs}
        >
          {LANG_LIST.map(l => {
            const id = l.id as DocLanguage;
            const count = DOCUMENTS.filter(d => d.language === id).length;
            return (
              <FilterRow
                key={l.id}
                active={langs.has(id)}
                disabled={count === 0}
                count={count}
                onClick={() => onToggleLang(id)}
                muted={l.id.includes("-")}
              >
                {l.label}
              </FilterRow>
            );
          })}
        </FilterSection>
      </div>
    </div>
  );
}

function FilterSection({
  label, activeCount, onClear, children,
}: {
  label: string;
  activeCount: number;
  onClear: () => void;
  children: React.ReactNode;
}) {
  return (
    <div>
      <div className="flex items-center justify-between px-2 py-1.5">
        <span className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wide">
          {label}
          {activeCount > 0 && <span className="text-primary ml-1">({activeCount})</span>}
        </span>
        {activeCount > 0 && (
          <button
            onClick={onClear}
            className="text-[10px] text-muted-foreground hover:text-foreground"
          >
            effacer
          </button>
        )}
      </div>
      <div className="flex flex-col gap-0.5">{children}</div>
    </div>
  );
}

function FilterRow({
  active, disabled, count, onClick, muted, children,
}: {
  active: boolean;
  disabled?: boolean;
  count: number;
  onClick: () => void;
  muted?: boolean;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      aria-pressed={active}
      className={cn(
        "flex items-center justify-between gap-2 px-2 py-1.5 rounded-md text-sm transition-colors text-left",
        "hover:bg-muted",
        active && "bg-primary/10 text-primary font-medium hover:bg-primary/15",
        disabled && "opacity-40 cursor-not-allowed hover:bg-transparent",
        muted && !active && "text-muted-foreground"
      )}
    >
      <span className="flex items-center min-w-0 flex-1">
        <span className={cn(
          "size-4 rounded border-2 mr-2 shrink-0 flex items-center justify-center transition-colors",
          active ? "border-primary bg-primary text-primary-foreground" : "border-muted-foreground/30"
        )}>
          {active && <HugeiconsIcon icon={Tick01Icon} className="size-3" />}
        </span>
        <span className="truncate">{children}</span>
      </span>
      <span className={cn(
        "text-[10px] tabular-nums font-mono px-1.5 py-0.5 rounded shrink-0",
        active ? "bg-primary/15 text-primary" : "bg-muted text-muted-foreground"
      )}>
        {count}
      </span>
    </button>
  );
}
