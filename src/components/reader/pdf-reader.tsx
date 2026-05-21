"use client";

import { useState, useEffect, useCallback, useRef, useMemo, Component } from "react";
import { Document, Page, pdfjs } from "react-pdf";
import { HugeiconsIcon } from "@hugeicons/react";
import {
  ArrowLeft01Icon,
  ArrowRight01Icon,
  ZoomInAreaIcon,
  ZoomOutAreaIcon,
  Download01Icon,
  Bookmark01Icon,
  BookmarkCheck01Icon,
  StickyNote01Icon,
  Cancel01Icon,
  PlusSignIcon,
  Delete01Icon,
  Maximize01Icon,
  Minimize01Icon,
  Rotate01Icon,
  SidebarLeft01Icon,
  LayoutThreeRowIcon,
  File01Icon,
  Copy01Icon,
  CopyCheckIcon,
  More01Icon,
  PenTool01Icon,
} from "@hugeicons/core-free-icons";
import Link from "next/link";
import { getDocumentUrl, type Document as DocType } from "@/lib/documents";
import {
  addBookmark, removeBookmark, isBookmarked,
  getNotes, saveNote, deleteNote, getLastPage, setLastPage,
  addReadingTime, exportNotesAsTxt,
  type Note,
} from "@/lib/store";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Separator } from "@/components/ui/separator";
import { Popover, PopoverTrigger, PopoverContent } from "@/components/ui/popover";
import {
  AlertDialog, AlertDialogContent, AlertDialogHeader,
  AlertDialogFooter, AlertDialogTitle, AlertDialogDescription,
} from "@/components/ui/alert-dialog";
import { toast } from "sonner";
import { DrawingLayer } from "./drawing-layer";
import { DrawingToolbar } from "./drawing-toolbar";
import { clearPage, drawnPages, getAnnotations, type DrawTool } from "@/lib/annotations";
import { drawStroke, drawText } from "@/lib/draw-render";
import { useI18n } from "@/components/i18n-provider";
import { cn } from "@/lib/utils";
import { getCachedPdf, setCachedPdf, downloadPdf } from "@/lib/pdf-cache";

pdfjs.GlobalWorkerOptions.workerSrc =
  `//unpkg.com/pdfjs-dist@${pdfjs.version}/build/pdf.worker.min.mjs`;

const ZOOM_STEPS = [0.25, 0.5, 0.75, 1, 1.25, 1.5, 1.75, 2, 2.5, 3, 3.5, 4, 5];
const RENDER_WINDOW = 4;

type PdfViewport = { width: number; height: number };
type PdfPage = {
  getTextContent: () => Promise<{ items: Array<{ str?: string }> }>;
  getViewport: (opts: { scale: number }) => PdfViewport;
  render: (opts: { canvasContext: CanvasRenderingContext2D; viewport: PdfViewport }) => { promise: Promise<void> };
};
type PdfProxy = {
  numPages: number;
  getPage: (n: number) => Promise<PdfPage>;
};

/* ── Composant ligne du menu mobile ───────────────── */
function MobileMenuItem({
  icon, onClick, active, tint, children,
}: {
  icon: Parameters<typeof HugeiconsIcon>[0]["icon"];
  onClick: () => void;
  active?: boolean;
  tint?: "success";
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={
        "flex items-center gap-2.5 px-2 py-2 rounded-md text-sm hover:bg-muted transition-colors w-full text-left " +
        (active ? "text-primary font-medium bg-primary/10 hover:bg-primary/15 " : "") +
        (tint === "success" ? "text-success " : "")
      }
    >
      <HugeiconsIcon
        icon={icon}
        className={
          "size-4 shrink-0 " +
          (active ? "text-primary" : tint === "success" ? "text-success" : "text-muted-foreground")
        }
      />
      <span className="flex-1">{children}</span>
      {active && (
        <span className="size-1.5 rounded-full bg-primary shrink-0" aria-hidden />
      )}
    </button>
  );
}

/* ── Error Boundary ───────────────────────────────── */
class PdfErrorBoundary extends Component<
  { children: React.ReactNode; fallback: React.ReactNode },
  { hasError: boolean }
> {
  constructor(props: { children: React.ReactNode; fallback: React.ReactNode }) {
    super(props);
    this.state = { hasError: false };
  }
  static getDerivedStateFromError() { return { hasError: true }; }
  render() {
    return this.state.hasError ? this.props.fallback : this.props.children;
  }
}

export function PdfReader({ doc }: { doc: DocType }) {
  const { t, f, locale } = useI18n();
  const [numPages, setNumPages]       = useState(0);
  const [currentPage, setCurrentPage] = useState(1);
  const [scale, setScale]             = useState(1);
  const [fullscreen, setFullscreen]   = useState(false);
  const [bookmarked, setBookmarked]   = useState(false);
  const [showNotes, setShowNotes]     = useState(false);
  const [showThumbs, setShowThumbs]   = useState(false);
  const [continuous, setContinuous]   = useState(false);
  // Plage de pages effectivement visibles dans le viewport (mode continu).
  // Utilisé en union avec la fenêtre ±RENDER_WINDOW autour de currentPage
  // → les pages visibles sont toujours rendues même quand le scroll est en
  // avance sur la mise à jour de currentPage (fix : pages grises persistantes
  // pendant un scroll rapide).
  const [visibleRange, setVisibleRange] = useState<{ start: number; end: number }>({ start: 1, end: 0 });
  // LRU des pages récemment rendues. Permet à une page de rester affichée
  // quand on scrolle au-delà et qu'on revient — pas de re-rasterisation par
  // react-pdf (qui peut prendre 100-300ms par page). Limité pour borner la
  // mémoire (chaque canvas pèse ~5 Mo à scale=1).
  const [recentPages, setRecentPages] = useState<number[]>([]);
  const MAX_RECENT_PAGES = 12;
  // Dimensions natives d'une page (lues sur la page 1 dès que le PDF est chargé).
  // Sert à dimensionner les placeholders gris du mode continu pour que leur
  // hauteur corresponde à celle des canvas réels — sans ça, quand une rangée
  // de placeholders bascule en page rendue, leur hauteur change et fait
  // dériver visuellement la position du scroll ("on se retrouve 20 pages plus bas").
  const [pageSize, setPageSize] = useState<{ width: number; height: number } | null>(null);
  // Dimensions native par page (certains PDFs ont des pages de tailles
  // différentes — couverture, sommaire, etc.). Sans ce Map, le placeholder
  // utiliserait la dimension de la page 1, et le canvas réel d'une page
  // hétérogène serait plus haut → décalage cumulé pendant le scroll.
  const [pageSizes, setPageSizes] = useState<Map<number, { width: number; height: number }>>(new Map());
  const [notes, setNotes]             = useState<Note[]>([]);
  const [newNote, setNewNote]         = useState("");
  const [loading, setLoading]         = useState(true);
  const [loadError, setLoadError]     = useState<string | null>(null);
  const [retryKey, setRetryKey]       = useState(0);
  const [progress, setProgress]       = useState<{ loaded: number; total: number } | null>(null);
  const retryCountRef                 = useRef(0);

  /* ── Copier lien ──────────────────────────────────── */
  const [copied, setCopied] = useState(false);

  /* ── Mode dessin ──────────────────────────────────── */
  const [drawMode, setDrawMode]       = useState(false);
  const [drawTool, setDrawTool]       = useState<DrawTool>("pen");
  const [drawColor, setDrawColor]     = useState("#dc2626");
  const [drawWidth, setDrawWidth]     = useState(4);
  const [textSize, setTextSize]       = useState(24);
  const [textBold, setTextBold]       = useState(false);
  const [textItalic, setTextItalic]   = useState(false);
  const [drawClearVersion, setDrawClearVersion] = useState(0);
  const [confirmClearOpen, setConfirmClearOpen] = useState(false);
  const drawModeRef = useRef(drawMode);
  useEffect(() => { drawModeRef.current = drawMode; }, [drawMode]);

  /* Synchronise les styles de texte quand on ré-édite un texte existant */
  useEffect(() => {
    const onStyle = (e: Event) => {
      const d = (e as CustomEvent<{ size: number; color: string; bold: boolean; italic: boolean }>).detail;
      if (!d) return;
      setTextSize(d.size);
      setDrawColor(d.color);
      setTextBold(d.bold);
      setTextItalic(d.italic);
    };
    window.addEventListener("ql-text-style", onStyle);
    return () => window.removeEventListener("ql-text-style", onStyle);
  }, []);

  const containerRef    = useRef<HTMLDivElement>(null);
  const pdfCanvasRef    = useRef<HTMLDivElement>(null);
  const pinchWrapperRef = useRef<HTMLDivElement>(null);
  const lastFactorRef   = useRef(1);
  const pageRefs     = useRef<(HTMLDivElement | null)[]>([]);
  const lastSaveRef  = useRef<number>(Date.now());
  const pdfDocRef    = useRef<PdfProxy | null>(null);
  const scaleRef     = useRef(scale);
  useEffect(() => { scaleRef.current = scale; }, [scale]);

  const pdfUrl = getDocumentUrl(doc.filename);

  // Options PDF.js : les PDFs sont sur le CDN Cloudflare qui gère parfaitement
  // les range requests → streaming activé (1ères pages affichées avant fin du DL).
  // useMemo : éviter de recréer l'objet à chaque render (sinon le PDF est rechargé en boucle).
  const pdfOptions = useMemo(() => ({
    disableRange:  false,
    disableStream: false,
  }), []);

  /* ── Cache PDF IndexedDB ──────────────────────────── */
  // Source effective passée à <Document/> : { data: Uint8Array } si le PDF est en
  // cache local, sinon l'URL CDN (streaming). useMemo + clé doc.id pour éviter
  // tout rechargement intempestif.
  const [cachedData, setCachedData] = useState<Uint8Array | null>(null);
  const [cacheChecked, setCacheChecked] = useState(false);

  useEffect(() => {
    let cancelled = false;
    setCacheChecked(false);
    setCachedData(null);
    getCachedPdf(doc.id).then((buf) => {
      if (cancelled) return;
      if (buf) setCachedData(new Uint8Array(buf));
      setCacheChecked(true);
    });
    return () => { cancelled = true; };
  }, [doc.id]);

  // Téléchargement complet en arrière-plan pour remplir le cache après la
  // première ouverture (uniquement si pas déjà en cache).
  useEffect(() => {
    if (!cacheChecked || cachedData) return;
    if (numPages === 0) return; // attendre que le streaming ait au moins parsé le header
    const controller = new AbortController();
    downloadPdf(pdfUrl, undefined, controller.signal)
      .then((buf) => setCachedPdf(doc.id, doc.filename, buf))
      .catch(() => {/* hors-ligne ou abort : pas grave, on réessaiera */});
    return () => controller.abort();
  }, [cacheChecked, cachedData, numPages, doc.id, doc.filename, pdfUrl]);

  // file= prop pour <Document/>. On enveloppe data dans un objet stable (useMemo).
  const pdfFile = useMemo<string | { data: Uint8Array }>(() => {
    if (cachedData) return { data: cachedData };
    return pdfUrl;
  }, [cachedData, pdfUrl]);

  // État partagé du PDF — évite de parser le fichier 2x pour la sidebar des vignettes
  // pageSize est pré-rempli dans onLoadSuccess du <Document/> avant setLoading(false),
  // donc dès que le user voit le contenu les placeholders ont la bonne hauteur.
  const [pdfProxy, setPdfProxy] = useState<PdfProxy | null>(null);

  /* ── Init : hash URL prioritaire sur localStorage ── */
  useEffect(() => {
    const hash = typeof window !== "undefined" ? window.location.hash : "";
    const match = hash.match(/#p(\d+)/);
    const hashPage = match ? parseInt(match[1]) : null;
    const savedPage = getLastPage(doc.id);
    const startPage = hashPage ?? savedPage;
    setCurrentPage(startPage);
    setBookmarked(isBookmarked(doc.id, startPage));
    setNotes(getNotes(doc.id));
  }, [doc.id]);

  /* ── Sync page → localStorage + hash ─────────────── */
  useEffect(() => {
    if (numPages > 0) {
      setLastPage(doc.id, currentPage);
      setBookmarked(isBookmarked(doc.id, currentPage));
      history.replaceState(null, "", `#p${currentPage}`);
    }
  }, [currentPage, doc.id, numPages]);

  /* ── Temps de lecture ─────────────────────────────── */
  useEffect(() => {
    if (numPages === 0) return;
    lastSaveRef.current = Date.now();
    const interval = setInterval(() => {
      addReadingTime(doc.id, 30);
      lastSaveRef.current = Date.now();
    }, 30_000);
    return () => {
      clearInterval(interval);
      const remaining = Math.floor((Date.now() - lastSaveRef.current) / 1000);
      if (remaining >= 5) addReadingTime(doc.id, remaining);
    };
  }, [doc.id, numPages]);

  /* ── Ctrl+molette ─────────────────────────────────── */
  useEffect(() => {
    const el = pdfCanvasRef.current;
    if (!el) return;
    const onWheel = (e: WheelEvent) => {
      if (!e.ctrlKey) return;
      e.preventDefault();
      setScale(prev => {
        const delta = e.deltaY < 0 ? 0.1 : -0.1;
        return Math.min(5, Math.max(0.25, Math.round((prev + delta) * 100) / 100));
      });
    };
    el.addEventListener("wheel", onWheel, { passive: false });
    return () => el.removeEventListener("wheel", onWheel);
  }, []);

  /* ── Mode scroll continu par défaut sur mobile ───── */
  useEffect(() => {
    if (typeof window === "undefined") return;
    if (window.matchMedia("(max-width: 639px)").matches) {
      setContinuous(true);
    }
  }, []);

  /* ── Pinch-to-zoom mobile (2 doigts) ──────────────── */
  // Pendant le geste : CSS transform sur un wrapper (GPU, zéro re-render).
  // Au touchend : setScale une seule fois → un seul re-rendu PDF.
  useEffect(() => {
    const el = pdfCanvasRef.current;
    if (!el) return;

    let pinching = false;
    let initialDist = 0;
    let initialScale = 1;

    const dist = (t: TouchList) =>
      Math.hypot(t[0].clientX - t[1].clientX, t[0].clientY - t[1].clientY);

    const commitPinch = () => {
      const wrapper = pinchWrapperRef.current;
      if (wrapper) {
        wrapper.style.transform = "";
        wrapper.style.transformOrigin = "";
        wrapper.style.willChange = "";
      }
      const next = Math.min(5, Math.max(0.25, Math.round(initialScale * lastFactorRef.current * 100) / 100));
      setScale(next);
      lastFactorRef.current = 1;
      pinching = false;
    };

    const onStart = (e: TouchEvent) => {
      if (drawModeRef.current) return;
      if (e.touches.length === 2) {
        pinching = true;
        initialDist = dist(e.touches);
        initialScale = scaleRef.current;
        lastFactorRef.current = 1;
        const wrapper = pinchWrapperRef.current;
        if (wrapper) {
          // Ancre le zoom sur le centre du pinch
          const rect = wrapper.getBoundingClientRect();
          const midX = (e.touches[0].clientX + e.touches[1].clientX) / 2;
          const midY = (e.touches[0].clientY + e.touches[1].clientY) / 2;
          wrapper.style.transformOrigin = `${midX - rect.left}px ${midY - rect.top}px`;
          wrapper.style.willChange = "transform";
        }
        e.preventDefault();
      }
    };

    const onMove = (e: TouchEvent) => {
      if (drawModeRef.current) return;
      if (!pinching || e.touches.length !== 2) return;
      e.preventDefault();
      const factor = dist(e.touches) / initialDist;
      lastFactorRef.current = factor;
      const wrapper = pinchWrapperRef.current;
      if (wrapper) {
        // Clamp le scale visuel dans les bornes autorisées
        const visual = Math.min(5 / initialScale, Math.max(0.25 / initialScale, factor));
        wrapper.style.transform = `scale(${visual})`;
      }
    };

    const onEnd = () => { if (pinching) commitPinch(); };

    el.addEventListener("touchstart",  onStart, { passive: false });
    el.addEventListener("touchmove",   onMove,  { passive: false });
    el.addEventListener("touchend",    onEnd);
    el.addEventListener("touchcancel", onEnd);
    return () => {
      el.removeEventListener("touchstart",  onStart);
      el.removeEventListener("touchmove",   onMove);
      el.removeEventListener("touchend",    onEnd);
      el.removeEventListener("touchcancel", onEnd);
    };
  }, []);

  /* ── Détection page courante (mode continu) ───────── */
  // Une ligne de référence fixe à 35% du haut du viewport. La page qui
  // contient cette ligne est la page courante. Pas d'oscillation possible :
  // il n'y a toujours qu'une seule page qui croise cette ligne.
  useEffect(() => {
    if (!continuous || numPages === 0) return;
    const root = pdfCanvasRef.current;
    if (!root) return;

    let rafId: number | null = null;
    let stopTimer: number | null = null;
    let lastY = root.scrollTop;
    let lastT = performance.now();

    // Seuil de scroll "rapide" en px/ms. Au-delà, on diffère la mise à jour
    // de visibleRange à l'arrêt du scroll, sinon les setState successifs font
    // re-rendre react-pdf à chaque frame → main thread saturé → scrollbar qui
    // décroche pendant le drag, et pages grises persistantes après l'arrêt.
    const FAST_THRESHOLD = 2.5;

    const measure = () => {
      rafId = null;
      const rootRect = root.getBoundingClientRect();
      const refLine = rootRect.top + rootRect.height * 0.35;
      const viewTop = rootRect.top;
      const viewBottom = rootRect.bottom;
      const margin = rootRect.height; // 1 viewport de marge en haut/bas

      let active = -1;
      let firstVis = -1;
      let lastVis = -1;
      for (let i = 0; i < pageRefs.current.length; i++) {
        const el = pageRefs.current[i];
        if (!el) continue;
        const r = el.getBoundingClientRect();
        if (active === -1 && r.top <= refLine && r.bottom >= refLine) {
          active = i + 1;
        }
        if (r.bottom >= viewTop - margin && r.top <= viewBottom + margin) {
          if (firstVis === -1) firstVis = i + 1;
          lastVis = i + 1;
        } else if (lastVis !== -1) {
          // sorti de la zone visible : pas la peine de continuer
          break;
        }
      }
      if (active > 0) setCurrentPage(active);
      if (firstVis > 0 && lastVis > 0) {
        setVisibleRange(prev =>
          prev.start === firstVis && prev.end === lastVis ? prev : { start: firstVis, end: lastVis },
        );
        // Touche le LRU : on déplace les pages visibles en fin de liste (= plus récentes)
        const fv = firstVis, lv = lastVis;
        setRecentPages(prev => {
          const filtered = prev.filter(p => p < fv || p > lv);
          const merged = filtered.concat(Array.from({ length: lv - fv + 1 }, (_, i) => fv + i));
          return merged.length > MAX_RECENT_PAGES
            ? merged.slice(merged.length - MAX_RECENT_PAGES)
            : merged;
        });
      }
    };

    const scheduleMeasure = () => {
      if (rafId === null) rafId = requestAnimationFrame(measure);
    };

    const onScroll = () => {
      const now = performance.now();
      const dy = Math.abs(root.scrollTop - lastY);
      const dt = now - lastT;
      const velocity = dt > 0 ? dy / dt : 0;
      lastY = root.scrollTop;
      lastT = now;

      if (velocity < FAST_THRESHOLD) {
        // Scroll lent / normal : update à chaque rAF comme avant.
        scheduleMeasure();
      }
      // Toujours programmer un update final à l'arrêt du scroll (≈120ms
      // après le dernier événement). C'est ce qui rafraîchit visibleRange
      // après un drag rapide de la scrollbar.
      if (stopTimer !== null) clearTimeout(stopTimer);
      stopTimer = window.setTimeout(() => {
        stopTimer = null;
        scheduleMeasure();
      }, 120);
    };

    root.addEventListener("scroll", onScroll, { passive: true });
    measure(); // détection initiale

    return () => {
      root.removeEventListener("scroll", onScroll);
      if (rafId !== null) cancelAnimationFrame(rafId);
      if (stopTimer !== null) clearTimeout(stopTimer);
    };
  }, [continuous, numPages]);

  /* ── Sync vignette active ─────────────────────────── */
  useEffect(() => {
    const thumb = document.getElementById(`thumb-${currentPage}`);
    thumb?.scrollIntoView({ behavior: "smooth", block: "nearest" });
  }, [currentPage]);

  /* ── Navigation ───────────────────────────────────── */
  const goTo = useCallback((page: number) => {
    const target = Math.max(1, Math.min(page, numPages));
    setCurrentPage(target);
    if (continuous) {
      pageRefs.current[target - 1]?.scrollIntoView({ behavior: "smooth", block: "start" });
    }
  }, [numPages, continuous]);

  /* ── Zoom ─────────────────────────────────────────── */
  const zoomIn = () => {
    const i = ZOOM_STEPS.findIndex(s => s > scale);
    setScale(ZOOM_STEPS[Math.min(i < 0 ? ZOOM_STEPS.length - 1 : i, ZOOM_STEPS.length - 1)]);
  };
  const zoomOut = () => {
    const i = ZOOM_STEPS.findLastIndex(s => s < scale);
    setScale(ZOOM_STEPS[Math.max(i, 0)]);
  };

  /* ── Mode continu ─────────────────────────────────── */
  const toggleContinuous = () => {
    setContinuous(v => {
      const next = !v;
      if (next) {
        setTimeout(() => {
          pageRefs.current[currentPage - 1]?.scrollIntoView({ behavior: "instant", block: "start" });
        }, 50);
      }
      return next;
    });
  };

  /* ── Marque-pages ─────────────────────────────────── */
  const toggleBookmark = () => {
    if (bookmarked) {
      removeBookmark(doc.id, currentPage);
      setBookmarked(false);
    } else {
      addBookmark({ docId: doc.id, page: currentPage, label: `Page ${currentPage}`, createdAt: Date.now() });
      setBookmarked(true);
    }
  };

  /* ── Notes ────────────────────────────────────────── */
  const addNote = () => {
    if (!newNote.trim()) return;
    const note: Note = {
      id: `${doc.id}-${Date.now()}`,
      docId: doc.id,
      page: currentPage,
      content: newNote.trim(),
      createdAt: Date.now(),
      updatedAt: Date.now(),
    };
    saveNote(note);
    setNotes(getNotes(doc.id));
    setNewNote("");
  };

  /* ── Retry chargement PDF ────────────────────────── */
  const retryLoad = useCallback(() => {
    retryCountRef.current = 0;
    setLoadError(null);
    setLoading(true);
    setRetryKey(k => k + 1);
  }, []);

  /* ── Export PNG des pages annotées ────────────────── */
  const exportDrawings = async () => {
    if (!pdfProxy) return;
    const pages = drawnPages(doc.id);
    if (pages.length === 0) {
      toast.info(t.reader.exportEmpty);
      return;
    }
    for (const pageNum of pages) {
      try {
        const page = await pdfProxy.getPage(pageNum);
        const viewport = page.getViewport({ scale: 2 });
        const canvas = document.createElement("canvas");
        canvas.width = viewport.width;
        canvas.height = viewport.height;
        const ctx = canvas.getContext("2d");
        if (!ctx) continue;
        await page.render({ canvasContext: ctx, viewport }).promise;
        const { strokes, texts } = getAnnotations(doc.id, pageNum);
        for (const s of strokes) drawStroke(ctx, s, canvas.width, canvas.height);
        for (const tn of texts) drawText(ctx, tn, canvas.width, canvas.height);
        const blob = await new Promise<Blob | null>(res => canvas.toBlob(res, "image/png"));
        if (blob) {
          const url = URL.createObjectURL(blob);
          const a = document.createElement("a");
          a.href = url;
          a.download = `${doc.id}-p${pageNum}.png`;
          document.body.appendChild(a);
          a.click();
          a.remove();
          URL.revokeObjectURL(url);
          await new Promise(r => setTimeout(r, 250));
        }
      } catch {
        /* page en échec — on continue */
      }
    }
    toast.success(f(t.reader.exportDone, { n: pages.length }));
  };

  /* ── Copier le lien ───────────────────────────────── */
  const copyLink = () => {
    const url = `${window.location.origin}/reader/${doc.id}#p${currentPage}`;
    navigator.clipboard.writeText(url).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  };

  const pageNotes = notes.filter(n => n.page === currentPage);

  /* ── Rendu page (mode continu) ────────────────────── */
  const renderContinuousPage = (pageNum: number) => {
    // Une page est rendue si :
    //  - elle est dans la fenêtre étroite autour de la page courante
    //  - OU elle est dans le viewport courant (± 1 viewport de marge)
    //  - OU elle est dans le LRU des pages récemment vues (évite la re-rasterisation
    //    coûteuse de react-pdf quand on revient sur une page déjà visitée)
    const inWindow =
      Math.abs(pageNum - currentPage) <= RENDER_WINDOW ||
      (pageNum >= visibleRange.start && pageNum <= visibleRange.end) ||
      recentPages.includes(pageNum);
    return (
      <div
        key={pageNum}
        ref={el => { pageRefs.current[pageNum - 1] = el; }}
        data-page={pageNum}
        className="flex flex-col items-center gap-1 pb-6"
      >
        <div className="text-[10px] text-white/60 font-mono select-none">{pageNum}</div>
        {inWindow ? (
          <div className="relative shadow-lg rounded overflow-hidden">
            <Page
              pageNumber={pageNum}
              scale={scale}
              renderTextLayer={false}
              renderAnnotationLayer={false}
              loading={
                <div
                  className="bg-muted/30 rounded animate-pulse"
                  style={{
                    width: `${(pageSizes.get(pageNum)?.width ?? pageSize?.width ?? 595) * scale}px`,
                    height: `${(pageSizes.get(pageNum)?.height ?? pageSize?.height ?? 842) * scale}px`,
                  }}
                />
              }
            />
            <DrawingLayer
              key={`${doc.id}-${pageNum}-${drawClearVersion}`}
              docId={doc.id}
              pageNumber={pageNum}
              enabled={drawMode}
              isCurrent={pageNum === currentPage}
              tool={drawTool}
              color={drawColor}
              strokeWidth={drawWidth}
              textSize={textSize}
              textBold={textBold}
              textItalic={textItalic}
            />
          </div>
        ) : (
          <div
            className="bg-white/10 rounded"
            style={{
              width: `${(pageSizes.get(pageNum)?.width ?? pageSize?.width ?? 595) * scale}px`,
              height: `${(pageSizes.get(pageNum)?.height ?? pageSize?.height ?? 842) * scale}px`,
            }}
          />
        )}
      </div>
    );
  };

  const errorFallback = (
    <div className="flex flex-col items-center justify-center h-60 gap-3 text-center px-6">
      <p className="text-4xl">⚠️</p>
      <p className="font-semibold text-destructive">{t.reader.loadErrorTitle}</p>
      <p className="text-sm text-muted-foreground max-w-sm">
        {t.reader.loadErrorDesc}
      </p>
      <div className="flex items-center gap-2">
        <Button size="sm" variant="outline" onClick={retryLoad}>{t.reader.retry}</Button>
        <Button asChild size="sm" variant="ghost">
          <a href={pdfUrl} download>{t.reader.download}</a>
        </Button>
      </div>
    </div>
  );

  /* ═══════════════════════════════════════════════════ */
  return (
    <div
      ref={containerRef}
      className="relative flex flex-col bg-background"
      style={{ height: "100dvh" }}
    >
      {/* ── Toolbar ─────────────────────────────────────── */}
      <div className="flex items-center justify-between px-2 py-1.5 border-b bg-card gap-2 shrink-0">

        {/* Gauche */}
        <div className="flex items-center gap-1 min-w-0">
          <Button
            variant="ghost" size="icon-sm"
            onClick={() => setShowThumbs(v => !v)}
            title={t.reader.thumbnails}
            className={cn(showThumbs ? "text-primary" : "text-muted-foreground")}
          >
            <HugeiconsIcon icon={SidebarLeft01Icon} />
          </Button>
          <Button asChild variant="ghost" size="icon-sm">
            <Link href="/"><HugeiconsIcon icon={ArrowLeft01Icon} className="rtl:rotate-180" /></Link>
          </Button>
          <div className="min-w-0 hidden sm:block">
            <p className="text-sm font-semibold truncate max-w-45 lg:max-w-xs">{doc.title[locale]}</p>
            {numPages > 0 && <p className="text-xs text-muted-foreground">{numPages} {t.reader.pages}</p>}
          </div>
        </div>

        {/* Droite */}
        <div className="flex items-center gap-0.5 shrink-0">

          {/* Zoom — desktop uniquement */}
          <div className="hidden sm:flex items-center gap-0.5">
            <Button variant="ghost" size="icon-sm" onClick={zoomOut} title={t.reader.zoomOut}>
              <HugeiconsIcon icon={ZoomOutAreaIcon} />
            </Button>
            <span className="text-xs w-10 text-center font-mono tabular-nums">{Math.round(scale * 100)}%</span>
            <Button variant="ghost" size="icon-sm" onClick={zoomIn} title={t.reader.zoomIn}>
              <HugeiconsIcon icon={ZoomInAreaIcon} />
            </Button>
            <Button variant="ghost" size="icon-sm" onClick={() => setScale(1)} title={t.reader.zoomReset}>
              <HugeiconsIcon icon={Rotate01Icon} />
            </Button>
            <Separator orientation="vertical" className="h-6 mx-1.5" />
          </div>

          {/* Mode continu — desktop uniquement */}
          <Button
            variant="ghost" size="icon-sm"
            onClick={toggleContinuous}
            title={continuous ? t.reader.continuousOff : t.reader.continuousOn}
            className={cn("hidden sm:flex", continuous ? "text-primary" : "text-muted-foreground")}
          >
            <HugeiconsIcon icon={continuous ? File01Icon : LayoutThreeRowIcon} />
          </Button>

          <Separator orientation="vertical" className="h-6 mx-1.5 hidden sm:block" />

          {/* Marque-page — toujours visible */}
          <Button
            variant="ghost" size="icon-sm"
            onClick={toggleBookmark}
            title={t.reader.bookmark}
            className={cn(bookmarked ? "text-primary" : "text-muted-foreground")}
          >
            <HugeiconsIcon icon={bookmarked ? BookmarkCheck01Icon : Bookmark01Icon} />
          </Button>

          {/* Notes — toujours visible */}
          <Button
            variant="ghost" size="icon-sm"
            onClick={() => setShowNotes(v => !v)}
            title={t.reader.notes}
            className={cn("relative", showNotes ? "text-primary" : "text-muted-foreground")}
          >
            <HugeiconsIcon icon={StickyNote01Icon} />
            {pageNotes.length > 0 && (
              <span className="absolute -top-0.5 -right-0.5 size-3.5 rounded-full bg-primary text-primary-foreground text-[9px] font-bold flex items-center justify-center">
                {pageNotes.length}
              </span>
            )}
          </Button>

          {/* Mode dessin — toujours visible */}
          <Button
            variant="ghost" size="icon-sm"
            onClick={() => setDrawMode(v => !v)}
            title={t.reader.drawMode}
            className={cn(drawMode ? "text-primary" : "text-muted-foreground")}
          >
            <HugeiconsIcon icon={PenTool01Icon} />
          </Button>

          {/* Actions secondaires — desktop uniquement */}
          <div className="hidden sm:flex items-center gap-0.5">
            <Separator orientation="vertical" className="h-6 mx-1.5" />
            <Button
              variant="ghost" size="icon-sm"
              onClick={copyLink}
              title={t.reader.copyLink}
              className={cn(copied ? "text-success" : "text-muted-foreground")}
            >
              <HugeiconsIcon icon={copied ? CopyCheckIcon : Copy01Icon} />
            </Button>
            <Button variant="ghost" size="icon-sm" asChild title={t.reader.download}>
              <a href={pdfUrl} download><HugeiconsIcon icon={Download01Icon} /></a>
            </Button>
            <Button
              variant="ghost" size="icon-sm"
              title={t.reader.fullscreen}
              onClick={() => {
                if (!document.fullscreenElement) {
                  containerRef.current?.requestFullscreen();
                  setFullscreen(true);
                } else {
                  document.exitFullscreen();
                  setFullscreen(false);
                }
              }}
            >
              <HugeiconsIcon icon={fullscreen ? Minimize01Icon : Maximize01Icon} />
            </Button>
          </div>

          {/* Menu "More" — mobile uniquement */}
          <Popover>
            <PopoverTrigger asChild>
              <Button
                variant="ghost" size="icon-sm"
                className="sm:hidden text-muted-foreground"
                title={t.reader.moreOptions}
                aria-label={t.reader.moreOptions}
              >
                <HugeiconsIcon icon={More01Icon} />
              </Button>
            </PopoverTrigger>
            <PopoverContent align="end" className="w-60 p-2">

              {/* Zoom */}
              <div className="px-2 py-1.5">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wide">
                    {t.reader.zoom}
                  </span>
                  <span className="text-xs font-mono tabular-nums text-muted-foreground">
                    {Math.round(scale * 100)}%
                  </span>
                </div>
                <div className="flex items-center gap-1">
                  <Button variant="outline" size="icon-sm" onClick={zoomOut} className="flex-1" title={t.reader.zoomOut}>
                    <HugeiconsIcon icon={ZoomOutAreaIcon} />
                  </Button>
                  <Button variant="outline" size="icon-sm" onClick={() => setScale(1)} className="flex-1" title={t.reader.zoomReset}>
                    <HugeiconsIcon icon={Rotate01Icon} />
                  </Button>
                  <Button variant="outline" size="icon-sm" onClick={zoomIn} className="flex-1" title={t.reader.zoomIn}>
                    <HugeiconsIcon icon={ZoomInAreaIcon} />
                  </Button>
                </div>
              </div>

              <div className="h-px bg-border my-1" />

              {/* Toggles */}
              <MobileMenuItem
                icon={continuous ? File01Icon : LayoutThreeRowIcon}
                onClick={toggleContinuous}
                active={continuous}
              >
                {t.reader.continuousOn}
              </MobileMenuItem>

              <MobileMenuItem
                icon={fullscreen ? Minimize01Icon : Maximize01Icon}
                onClick={() => {
                  if (!document.fullscreenElement) {
                    containerRef.current?.requestFullscreen();
                    setFullscreen(true);
                  } else {
                    document.exitFullscreen();
                    setFullscreen(false);
                  }
                }}
                active={fullscreen}
              >
                {fullscreen ? t.reader.fullscreenExit : t.reader.fullscreen}
              </MobileMenuItem>

              <div className="h-px bg-border my-1" />

              {/* Actions */}
              <MobileMenuItem
                icon={copied ? CopyCheckIcon : Copy01Icon}
                onClick={copyLink}
                tint={copied ? "success" : undefined}
              >
                {copied ? t.reader.linkCopied : t.reader.copyLink}
              </MobileMenuItem>

              <a
                href={pdfUrl}
                download
                className="flex items-center gap-2.5 px-2 py-2 rounded-md text-sm hover:bg-muted transition-colors w-full"
              >
                <HugeiconsIcon icon={Download01Icon} className="size-4 shrink-0 text-muted-foreground" />
                <span className="flex-1 text-start">{t.reader.download}</span>
              </a>
            </PopoverContent>
          </Popover>
        </div>
      </div>

      {/* ── Corps ──────────────────────────────────────── */}
      <div className="flex flex-1 overflow-hidden">

        {/* Panneau vignettes — réutilise le proxy PDF déjà chargé (pas de second parsing) */}
        {showThumbs && pdfProxy && numPages > 0 && !loadError && (
          <div className="w-36 border-r bg-card flex flex-col shrink-0 overflow-hidden">
            <p className="text-[10px] font-semibold text-muted-foreground px-3 py-2 border-b uppercase tracking-wide">
              {t.reader.pagesPanel} ({numPages})
            </p>
            <div className="flex-1 overflow-y-auto py-2 flex flex-col gap-1 items-center">
              <PdfErrorBoundary fallback={<p className="text-xs text-muted-foreground p-2 text-center">{t.reader.previewUnavailable}</p>}>
                {Array.from({ length: numPages }, (_, i) => i + 1).map(pageNum => (
                  <button
                    key={pageNum}
                    id={`thumb-${pageNum}`}
                    onClick={() => goTo(pageNum)}
                    className={cn(
                      "group flex flex-col items-center gap-1 px-2 py-1.5 rounded-lg w-full transition-colors",
                      currentPage === pageNum ? "bg-primary/15" : "hover:bg-muted"
                    )}
                  >
                    <div className={cn(
                      "rounded overflow-hidden border-2 transition-colors bg-white",
                      currentPage === pageNum ? "border-primary" : "border-transparent group-hover:border-border"
                    )} style={{ width: 88, minHeight: 120 }}>
                      <Page
                        pdf={pdfProxy as unknown as Parameters<typeof Page>[0]["pdf"]}
                        pageNumber={pageNum}
                        width={88}
                        renderTextLayer={false}
                        renderAnnotationLayer={false}
                        loading={<div className="w-22 h-30 bg-muted animate-pulse" />}
                      />
                    </div>
                    <span className={cn(
                      "text-[10px] font-medium",
                      currentPage === pageNum ? "text-primary" : "text-muted-foreground"
                    )}>
                      {pageNum}
                    </span>
                  </button>
                ))}
              </PdfErrorBoundary>
            </div>
          </div>
        )}

        {/* Zone PDF principale */}
        <div
          ref={pdfCanvasRef}
          className="flex-1 overflow-auto flex flex-col items-center bg-neutral-300 dark:bg-neutral-900"
          style={{ padding: continuous ? "1.5rem 1.5rem 0" : "1.5rem" }}
        >
          {loading && (
            <div className="flex-1 w-full flex items-center justify-center">
              <div className="flex flex-col items-center gap-4 w-full max-w-xs px-6">
                {progress && progress.total > 0 ? (
                  <div className="w-full">
                    <div className="flex items-center justify-between text-xs mb-1.5">
                      <span className="text-muted-foreground">{t.reader.downloading}</span>
                      <span className="font-mono tabular-nums font-semibold text-primary">
                        {Math.round((progress.loaded / progress.total) * 100)}%
                      </span>
                    </div>
                    <div className="h-2 bg-muted rounded-full overflow-hidden">
                      <div
                        className="h-full bg-primary transition-all duration-200 ease-out"
                        style={{ width: `${Math.round((progress.loaded / progress.total) * 100)}%` }}
                      />
                    </div>
                    <p className="text-[10px] text-muted-foreground tabular-nums mt-1 text-center">
                      {(progress.loaded / 1024 / 1024).toFixed(1)} / {(progress.total / 1024 / 1024).toFixed(1)} Mo
                    </p>
                  </div>
                ) : (
                  <>
                    <div className="size-8 rounded-full border-2 border-primary border-t-transparent animate-spin" />
                    <p className="text-sm text-muted-foreground">{t.reader.loading}</p>
                  </>
                )}
              </div>
            </div>
          )}

          {loadError && errorFallback}

          {!loadError && cacheChecked && (
            <div ref={pinchWrapperRef}>
            <PdfErrorBoundary fallback={errorFallback}>
              <Document
                key={retryKey}
                file={pdfFile}
                options={pdfOptions}
                onLoadProgress={({ loaded, total }) => {
                  if (total > 0) setProgress({ loaded, total });
                }}
                onLoadSuccess={async (proxy) => {
                  const p = proxy as unknown as PdfProxy;
                  pdfDocRef.current = p;
                  pageRefs.current = new Array(proxy.numPages).fill(null);
                  // Clamp la page courante dans la plage valide du PDF chargé.
                  setCurrentPage(prev => Math.max(1, Math.min(prev, proxy.numPages)));
                  // Lire les dimensions de TOUTES les pages en parallèle avant
                  // de retirer l'écran de chargement. Garantit que les
                  // placeholders du mode continu ont exactement la hauteur du
                  // canvas réel, ce qui évite tout layout shift cumulatif
                  // pendant un drag rapide de la scrollbar.
                  try {
                    const sizes = await Promise.all(
                      Array.from({ length: proxy.numPages }, (_, i) =>
                        p.getPage(i + 1).then((page) => {
                          const vp = page.getViewport({ scale: 1 });
                          return { width: vp.width, height: vp.height };
                        }),
                      ),
                    );
                    const map = new Map<number, { width: number; height: number }>();
                    sizes.forEach((s, i) => map.set(i + 1, s));
                    setPageSizes(map);
                    if (sizes[0]) setPageSize(sizes[0]);
                  } catch { /* fallback aux dimensions par défaut */ }
                  setPdfProxy(p);
                  setNumPages(proxy.numPages);
                  setLoading(false);
                  setProgress(null);
                }}
                onLoadError={(err) => {
                  setLoading(false);
                  setLoadError(err?.message ?? "Impossible de charger le document");
                }}
                loading={null}
              >
                {continuous
                  ? Array.from({ length: numPages }, (_, i) => renderContinuousPage(i + 1))
                  : (
                    <div className="relative shadow-lg rounded overflow-hidden">
                      <Page
                        pageNumber={currentPage}
                        scale={scale}
                        renderTextLayer={false}
                        renderAnnotationLayer={false}
                      />
                      <DrawingLayer
                        key={`${doc.id}-${currentPage}-${drawClearVersion}`}
                        docId={doc.id}
                        pageNumber={currentPage}
                        enabled={drawMode}
                        isCurrent={true}
                        tool={drawTool}
                        color={drawColor}
                        strokeWidth={drawWidth}
                        textSize={textSize}
                        textBold={textBold}
                        textItalic={textItalic}
                      />
                    </div>
                  )
                }
              </Document>
            </PdfErrorBoundary>
            </div>
          )}
        </div>

        {/* Panneau de notes */}
        {showNotes && (
          <div className="w-64 sm:w-72 border-l bg-card flex flex-col shrink-0">
            <div className="flex items-center justify-between px-4 py-2.5 border-b">
              <span className="text-sm font-semibold">{f(t.reader.notesTitle, { n: currentPage })}</span>
              <div className="flex items-center gap-1">
                {notes.length > 0 && (
                  <Button
                    variant="ghost" size="icon-xs"
                    title={t.reader.notesExport}
                    onClick={() => exportNotesAsTxt(doc.id)}
                  >
                    <HugeiconsIcon icon={Download01Icon} />
                  </Button>
                )}
                <Button variant="ghost" size="icon-xs" onClick={() => setShowNotes(false)}>
                  <HugeiconsIcon icon={Cancel01Icon} />
                </Button>
              </div>
            </div>

            <div className="flex-1 overflow-y-auto p-3 flex flex-col gap-2">
              {pageNotes.length === 0 && (
                <p className="text-xs text-muted-foreground text-center py-6">
                  {t.reader.notesEmpty}
                </p>
              )}
              {pageNotes.map(n => (
                <div key={n.id} className="bg-muted rounded-lg px-3 py-2 pr-8 text-xs relative leading-relaxed">
                  {n.content}
                  <Button
                    variant="ghost" size="icon-xs"
                    className="absolute top-1 right-1 text-muted-foreground hover:text-destructive"
                    onClick={() => { deleteNote(n.id); setNotes(getNotes(doc.id)); }}
                  >
                    <HugeiconsIcon icon={Delete01Icon} />
                  </Button>
                </div>
              ))}
            </div>

            <div className="p-3 border-t flex flex-col gap-2">
              <Textarea
                value={newNote}
                onChange={e => setNewNote(e.target.value)}
                placeholder={t.reader.notePlaceholder}
                rows={3}
                onKeyDown={e => { if (e.key === "Enter" && e.ctrlKey) addNote(); }}
              />
              <Button onClick={addNote} disabled={!newNote.trim()} size="sm" className="w-full">
                <HugeiconsIcon icon={PlusSignIcon} data-icon="inline-start" />
                {t.reader.noteAdd}
              </Button>
            </div>
          </div>
        )}
      </div>

      {/* ── Navigation bas de page (toujours LTR : pagination universelle) ── */}
      <div dir="ltr" className="flex items-center justify-center gap-1 px-3 py-2 border-t bg-card shrink-0">
        <Button variant="ghost" size="icon-sm" onClick={() => goTo(1)} disabled={currentPage <= 1}>⏮</Button>
        <Button variant="ghost" size="icon-sm" onClick={() => goTo(currentPage - 1)} disabled={currentPage <= 1}>
          <HugeiconsIcon icon={ArrowLeft01Icon} />
        </Button>
        <div className="flex items-center gap-1.5">
          <Input
            type="number"
            value={currentPage}
            min={1}
            max={numPages}
            onChange={e => goTo(parseInt(e.target.value) || 1)}
            className="w-20 h-7 text-center text-sm tabular-nums px-1"
          />
          <span className="text-sm text-muted-foreground">/ {numPages || "—"}</span>
        </div>
        <Button variant="ghost" size="icon-sm" onClick={() => goTo(currentPage + 1)} disabled={currentPage >= numPages}>
          <HugeiconsIcon icon={ArrowRight01Icon} />
        </Button>
        <Button variant="ghost" size="icon-sm" onClick={() => goTo(numPages)} disabled={currentPage >= numPages}>⏭</Button>
      </div>

      {/* ── Barre d'outils de dessin ────────────────────── */}
      {drawMode && (
        <DrawingToolbar
          tool={drawTool}
          color={drawColor}
          strokeWidth={drawWidth}
          textSize={textSize}
          textBold={textBold}
          textItalic={textItalic}
          onToolChange={setDrawTool}
          onColorChange={setDrawColor}
          onWidthChange={setDrawWidth}
          onTextSizeChange={setTextSize}
          onTextBoldChange={setTextBold}
          onTextItalicChange={setTextItalic}
          onExport={exportDrawings}
          onClearPage={() => setConfirmClearOpen(true)}
          onClose={() => setDrawMode(false)}
        />
      )}

      {/* ── Confirmation : effacer les dessins de la page ── */}
      <AlertDialog open={confirmClearOpen} onOpenChange={setConfirmClearOpen}>
        <AlertDialogContent container={containerRef.current}>
          <AlertDialogHeader>
            <AlertDialogTitle>{t.reader.clearDrawTitle}</AlertDialogTitle>
            <AlertDialogDescription>
              {f(t.reader.clearDrawDesc, { n: currentPage })}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <Button variant="outline" size="sm" onClick={() => setConfirmClearOpen(false)}>
              {t.common.cancel}
            </Button>
            <Button
              variant="destructive"
              size="sm"
              onClick={() => {
                clearPage(doc.id, currentPage);
                setDrawClearVersion(v => v + 1);
                setConfirmClearOpen(false);
                toast.success(f(t.reader.clearDrawToast, { n: currentPage }));
              }}
            >
              {t.common.delete}
            </Button>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
