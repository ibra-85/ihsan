"use client";

import { useState, useEffect, useLayoutEffect, useCallback, useRef, useMemo, Component } from "react";
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
  getZoom, setZoom,
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
// Rayon de pré-rendu autour de la zone visible. On ne rend PAS tout le PDF :
// avec 200-300 pages, ça crée une dette de rendu qui sature pdf.js et la RAM.
const BG_RENDER_RADIUS = 12;

// Fenêtre de rendu canvas dynamique selon le scale. À scale=2.3, une page
// coûte ~5x plus de mémoire et de temps qu'à scale=1, donc rendre 9 pages
// (±4) sature pdf.js. Réduire la fenêtre à haut zoom = moins de canvas
// haute résolution simultanés, et on s'appuie sur le cache image pour le
// reste de la zone visible.
const getRenderWindowForScale = (scale: number): number => {
  if (scale >= 2) return 1;
  if (scale >= 1.5) return 2;
  return RENDER_WINDOW;
};

type PdfViewport = { width: number; height: number };
type PdfRenderTask = { promise: Promise<void>; cancel?: () => void };
type PdfPage = {
  getTextContent: () => Promise<{ items: Array<{ str?: string }> }>;
  getViewport: (opts: { scale: number }) => PdfViewport;
  render: (opts: { canvasContext: CanvasRenderingContext2D; viewport: PdfViewport }) => PdfRenderTask;
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

/**
 * Champ de saisie de page autonome.
 *
 * Pourquoi un composant dédié : `value={currentPage}` + `onChange={goTo}`
 * direct provoque un `goTo()` après chaque chiffre tapé → l'utilisateur
 * voulait taper "150" mais on saute à la page 1 dès le premier chiffre,
 * ce qui scrolle, déclenche un re-render et perturbe la saisie.
 *
 * Comportement actuel :
 *  - Saisie purement locale (state `value`)
 *  - Commit auto-debouncé 500ms après la dernière frappe
 *  - Commit immédiat sur Enter ou blur
 *  - Sync externe (boutons préc/suiv) ignorée tant que l'input a le focus
 *    pour ne pas écraser ce que l'utilisateur est en train d'écrire.
 */
function PageInput({
  current,
  total,
  onCommit,
}: {
  current: number;
  total: number;
  onCommit: (page: number) => void;
}) {
  const [value, setValue] = useState(String(current));
  const focusedRef = useRef(false);

  // Sync externe (clic précédent / suivant / lien) : on remplace la valeur
  // affichée par currentPage, mais seulement si l'input n'a pas le focus.
  useEffect(() => {
    if (!focusedRef.current) setValue(String(current));
  }, [current]);

  // Commit debouncé : 500 ms après la dernière frappe, si la valeur est
  // valide et différente de la page actuelle, on déclenche la navigation.
  useEffect(() => {
    if (value === String(current)) return;
    const n = parseInt(value, 10);
    if (!Number.isFinite(n) || n < 1 || n > total) return;
    const tid = setTimeout(() => onCommit(n), 500);
    return () => clearTimeout(tid);
  }, [value, current, total, onCommit]);

  return (
    <Input
      type="number"
      inputMode="numeric"
      value={value}
      min={1}
      max={total}
      onChange={(e) => setValue(e.target.value)}
      onFocus={(e) => { focusedRef.current = true; e.currentTarget.select(); }}
      onBlur={() => {
        focusedRef.current = false;
        const n = parseInt(value, 10);
        if (!Number.isFinite(n) || n < 1 || n > total) setValue(String(current));
        else if (n !== current) onCommit(n);
      }}
      onKeyDown={(e) => { if (e.key === "Enter") e.currentTarget.blur(); }}
      className="w-20 h-7 text-center text-sm tabular-nums px-1"
    />
  );
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
  // Mode lecture continue activé par défaut (lecture verticale page par page).
  const [continuous, setContinuous]   = useState(true);
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
  const MAX_RECENT_PAGES = 10;
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
  // Cache des pages déjà rasterisées sous forme de data URL JPEG.
  // Approche Chrome PDF viewer : une page rendue une fois reste affichable
  // instantanément sous forme d'image, même quand elle quitte la fenêtre de
  // rendu react-pdf. Évite la re-rasterisation coûteuse lors d'un scroll
  // rapide en va-et-vient. Ref + tick pour forcer un re-render quand le cache
  // change (les refs ne déclenchent pas de re-render).
  const pageImagesRef = useRef<Map<number, string>>(new Map());
  const [imageCacheTick, setImageCacheTick] = useState(0);
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

  // Zoom en deux phases :
  //  - `scale` change instantanément au clic zoom (pilote la taille visuelle
  //    des wrappers, des images cachées, et l'ancre de scroll).
  //  - `renderScale` est mis à jour APRÈS 300ms sans nouveau changement de
  //    scale (debounce). C'est lui qui est passé à <Page scale={...}>, donc
  //    pdf.js ne re-rasterise qu'une seule fois à la fin d'une rafale de
  //    zoom (1.5→1.6→1.7→1.8→2→2.1→2.2→2.3 = un seul render à 2.3).
  // Pendant la rafale, l'utilisateur voit l'image cachée étirée en CSS à la
  // bonne taille visuelle, puis le canvas net arrive après le commit final.
  const [renderScale, setRenderScale] = useState(1);
  const renderScaleTimerRef = useRef<number | null>(null);

  // currentPage tenu dans une ref pour pouvoir le lire de manière synchrone
  // dans captureZoomAnchor (callback) sans re-créer la fonction à chaque page.
  const currentPageRef = useRef(currentPage);
  useEffect(() => { currentPageRef.current = currentPage; }, [currentPage]);

  // Ancre de zoom : { page actuelle sous la refLine, ratio vertical 0-1 }.
  // Capturée AVANT chaque changement de scale, restaurée AU layout effect
  // qui suit le re-render avec le nouveau scale. Sans ça, scrollTop reste
  // identique alors que la hauteur totale change → la page visible saute
  // (ex. à scale=1.5, totalH passe de 303k à 376k px, donc le même
  // scrollTop=205k qui pointait page 196 pointe maintenant page 158).
  const zoomAnchorRef = useRef<{ page: number; ratio: number } | null>(null);

  const captureZoomAnchor = useCallback(() => {
    if (!continuous) return;
    const root = pdfCanvasRef.current;
    if (!root) return;

    const rootRect = root.getBoundingClientRect();
    const refY = rootRect.top + rootRect.height * 0.35;

    let pageNum = currentPageRef.current;
    let el: HTMLDivElement | null = pageRefs.current[pageNum - 1] ?? null;

    // Sécurité : si currentPage est un peu en retard sur le scroll réel,
    // on cherche la page qui croise la refLine à l'instant T.
    for (let i = 0; i < pageRefs.current.length; i++) {
      const candidate = pageRefs.current[i];
      if (!candidate) continue;
      const rect = candidate.getBoundingClientRect();
      if (rect.top <= refY && rect.bottom >= refY) {
        pageNum = i + 1;
        el = candidate;
        break;
      }
    }

    if (!el) return;
    const rect = el.getBoundingClientRect();
    const ratio = Math.min(1, Math.max(0, (refY - rect.top) / rect.height));
    zoomAnchorRef.current = { page: pageNum, ratio };
    // eslint-disable-next-line no-console
    // console.log(`[pdf] zoom anchor captured page=${pageNum} ratio=${ratio.toFixed(3)}`);
  }, [continuous]);

  // Restaure le scrollTop pour remettre la page ancrée au même ratio sous la
  // refLine après que le DOM ait commit avec le nouveau scale. useLayoutEffect
  // s'exécute SYNCHRONIQUEMENT après le commit mais AVANT le paint navigateur
  // → aucun flash de mauvaise position visible.
  useLayoutEffect(() => {
    if (!continuous) return;
    const anchor = zoomAnchorRef.current;
    if (!anchor) return;
    const root = pdfCanvasRef.current;
    const el = pageRefs.current[anchor.page - 1];
    if (!root || !el) return;

    const rootRect = root.getBoundingClientRect();
    const pageRect = el.getBoundingClientRect();
    const pageTopInScroll = pageRect.top - rootRect.top + root.scrollTop;
    const desiredRefOffset = root.clientHeight * 0.35;
    const nextScrollTop = pageTopInScroll + pageRect.height * anchor.ratio - desiredRefOffset;

    root.scrollTop = Math.max(0, nextScrollTop);

    // Force une mesure visibleRange/currentPage maintenant que scrollTop est
    // bon, sinon les listeners scroll ne se déclenchent pas (on a écrit
    // scrollTop par programme, pas via interaction).
    requestAnimationFrame(() => {
      root.dispatchEvent(new Event("scroll"));
    });

    // eslint-disable-next-line no-console
    // console.log(
    //   `[pdf] zoom anchor restored page=${anchor.page} ratio=${anchor.ratio.toFixed(3)} scrollTop=${Math.round(root.scrollTop)}`,
    // );
    zoomAnchorRef.current = null;
  }, [scale, continuous]);

  // Au changement de scale (zoom +/-, pinch, molette Ctrl) :
  //  1. Pause le bg-render → libère pdf.js pour les rendus interactifs.
  //  2. Vide le LRU → seules les pages strictement visibles re-rasterisent.
  //  3. Debounce setRenderScale(scale) : tant que l'utilisateur zoome, on
  //     remet le timer à zéro. <Page> ne re-rasterise qu'au commit final.
  const firstScaleSyncRef = useRef(true);
  useEffect(() => {
    if (firstScaleSyncRef.current) {
      firstScaleSyncRef.current = false;
      // Init synchrone de renderScale à la valeur initiale de scale, pour
      // que la 1ère ouverture du PDF rende immédiatement à la bonne taille.
      setRenderScale(scale);
      return;
    }
    pauseBgRender(6000);
    setRecentPages([]);
    // eslint-disable-next-line no-console
    // console.log(`[pdf] visual scale changed to ${scale}, renderScale pending`);

    if (renderScaleTimerRef.current !== null) {
      window.clearTimeout(renderScaleTimerRef.current);
    }
    // 600ms : à 300ms, le debounce committait encore au milieu des rafales
    // (l'utilisateur fait des micro-pauses entre deux clicks zoom). 600ms
    // couvre le rythme réel d'un zoom continu, au prix de 300ms de flou
    // CSS supplémentaires sur l'image cachée stretchée. Si trop flou, 450ms.
    renderScaleTimerRef.current = window.setTimeout(() => {
      setRenderScale(scale);
      renderScaleTimerRef.current = null;
      // Persiste le zoom au commit (1 écriture par rafale grâce au debounce,
      // au lieu d'1 par micro-step si on persistait à chaque setScale).
      setZoom(doc.id, scale);
      // eslint-disable-next-line no-console
      // console.log(`[pdf] renderScale committed ${scale} (persisted for ${doc.id})`);
    }, 600);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [scale]);

  // Cleanup du timer renderScale au démontage du composant. Si un debounce
  // est encore en attente (user a zoomé puis quitté en < 600ms), on persiste
  // quand même le scale courant pour ne pas perdre son réglage.
  useEffect(() => {
    return () => {
      if (renderScaleTimerRef.current !== null) {
        window.clearTimeout(renderScaleTimerRef.current);
        renderScaleTimerRef.current = null;
        setZoom(doc.id, scaleRef.current);
      }
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
  const drawModeRef  = useRef(drawMode);
  useEffect(() => { drawModeRef.current = drawMode; }, [drawMode]);

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

  /* ── Pré-rendu en arrière-plan (approche Chrome PDF viewer) ──────
   * Rend silencieusement chaque page en JPEG via pdf.js dans un canvas
   * offscreen, en utilisant `requestIdleCallback`. Crucial : on PAUSE et
   * ANNULE le rendu en cours dès que l'utilisateur interagit (scroll, zoom),
   * sinon pdf.js (qui sérialize) bloque les rendus interactifs des `<Page>`
   * visibles → impression de lenteur sur les pages visitées. */
  const bgPausedRef = useRef(false);
  const bgPauseTimerRef = useRef<number | null>(null);
  // Deadline absolue de fin de pause. Permet à pauseBgRender d'être monotone :
  // un appel court (ex. 1.5s du scroll synthétique post-zoom) ne doit JAMAIS
  // raccourcir une pause longue en cours (ex. 2.5s du changement de scale).
  // Sans ça, on voyait bg-rendered page 8/9/10 pendant la séquence de zoom.
  const bgPauseUntilRef = useRef(0);
  const bgCurrentTaskRef = useRef<PdfRenderTask | null>(null);

  const pauseBgRender = useCallback((durationMs = 1500) => {
    const now = performance.now();
    const until = now + durationMs;
    bgPausedRef.current = true;
    // Math.max : on prend la deadline la plus tardive entre la nouvelle pause
    // et la pause en cours. Les pauses courtes ne peuvent que prolonger,
    // jamais raccourcir.
    bgPauseUntilRef.current = Math.max(bgPauseUntilRef.current, until);

    if (bgPauseTimerRef.current !== null) {
      window.clearTimeout(bgPauseTimerRef.current);
    }
    try { bgCurrentTaskRef.current?.cancel?.(); } catch { /* ignore */ }
    bgCurrentTaskRef.current = null;

    const remaining = Math.max(0, bgPauseUntilRef.current - now);
    bgPauseTimerRef.current = window.setTimeout(() => {
      // Garde-fou : si une pause encore plus longue a été enregistrée entre
      // temps (rare en pratique car on clearTimeout, mais ceinture+bretelles),
      // on ne lève pas la pause.
      if (performance.now() >= bgPauseUntilRef.current) {
        bgPausedRef.current = false;
        bgPauseTimerRef.current = null;
        bgPauseUntilRef.current = 0;
      }
    }, remaining);
  }, []);

  useEffect(() => {
    if (!pdfProxy) return;
    // À haut zoom, le bg-render coûte trop cher pour ce qu'il rapporte :
    // chaque rasterisation offscreen utilise pdf.js (qui sérialise) et
    // retarde les rendus interactifs des pages visibles. On le coupe par
    // politique au-dessus de scale 1.5. Quand l'utilisateur redescend sous
    // ce seuil, ce useEffect se relance (scale est dans les deps) et le
    // bg-render reprend normalement.
    if (scale >= 1.5) {
      // eslint-disable-next-line no-console
      // console.log(`[pdf] bg-render disabled at scale=${scale} (>= 1.5)`);
      return;
    }
    let cancelled = false;

    const renderPageToCache = async (pageNum: number) => {
      if (cancelled || bgPausedRef.current || pageImagesRef.current.has(pageNum)) return;
      try {
        const page = await pdfProxy.getPage(pageNum);
        if (cancelled || bgPausedRef.current) return;
        const vp = page.getViewport({ scale: 1.2 });
        const canvas = document.createElement("canvas");
        canvas.width = Math.round(vp.width);
        canvas.height = Math.round(vp.height);
        const ctx = canvas.getContext("2d");
        if (!ctx) return;
        const task = page.render({ canvasContext: ctx, viewport: vp });
        bgCurrentTaskRef.current = task;
        await task.promise;
        bgCurrentTaskRef.current = null;
        if (cancelled) return;
        const dataUrl = canvas.toDataURL("image/jpeg", 0.55);
        pageImagesRef.current.set(pageNum, dataUrl);
        // eslint-disable-next-line no-console
        // console.log(`[pdf] bg-rendered page ${pageNum} (${Math.round(dataUrl.length / 1024)} kB, total ${pageImagesRef.current.size}/${pdfProxy.numPages})`);
        setImageCacheTick(t => t + 1);
      } catch (err) {
        // RenderTask cancel rejette avec une "RenderingCancelledException" — ignorer.
        const name = (err as { name?: string } | null)?.name;
        if (name !== "RenderingCancelledException") {
          console.warn(`[pdf] bg-render failed for page ${pageNum}:`, err);
        }
      }
    };

    // Queue bornée — on ne pré-rend PLUS tout le PDF. Priorité à la zone
    // réellement visible (visibleRange), puis voisinage ±BG_RENDER_RADIUS,
    // puis les 5 premières pages (utiles à la réouverture rapide).
    // Cet effet est rebuilt quand visibleRange change → la queue suit l'utilisateur.
    const buildQueue = (): number[] => {
      const total = pdfProxy.numPages;
      const seen = new Set<number>();
      const queue: number[] = [];

      const push = (page: number) => {
        if (page < 1 || page > total || seen.has(page)) return;
        seen.add(page);
        queue.push(page);
      };

      const hasVisibleRange = visibleRange.start > 0 && visibleRange.end >= visibleRange.start;
      const start = hasVisibleRange
        ? visibleRange.start
        : Math.max(1, Math.min(currentPage, total));
      const end = hasVisibleRange
        ? visibleRange.end
        : Math.max(1, Math.min(currentPage, total));

      for (let page = start; page <= end; page++) push(page);
      for (let offset = 1; offset <= BG_RENDER_RADIUS; offset++) {
        push(start - offset);
        push(end + offset);
      }
      for (let page = 1; page <= Math.min(5, total); page++) push(page);

      // eslint-disable-next-line no-console
      // console.log(
      //   `[pdf] bg queue rebuilt visible=[${start}, ${end}] radius=${BG_RENDER_RADIUS} size=${queue.length}/${total}`,
      // );
      return queue;
    };

    const queue = buildQueue();
    let idx = 0;

    type IdleCb = (cb: () => void) => number;
    const schedule: IdleCb = (cb) => {
      if (typeof window.requestIdleCallback === "function") {
        return window.requestIdleCallback(() => cb(), { timeout: 3000 });
      }
      return window.setTimeout(cb, 200);
    };

    const runNext = () => {
      if (cancelled || idx >= queue.length) return;
      // Pause active → on attend et on revérifie.
      if (bgPausedRef.current) {
        window.setTimeout(runNext, 500);
        return;
      }
      const pageNum = queue[idx++];
      schedule(async () => {
        await renderPageToCache(pageNum);
        runNext();
      });
    };

    const startTimer = window.setTimeout(runNext, 800);

    return () => {
      cancelled = true;
      window.clearTimeout(startTimer);
      try { bgCurrentTaskRef.current?.cancel?.(); } catch { /* ignore */ }
      bgCurrentTaskRef.current = null;
      // NB : on ne clear PAS bgPauseTimerRef ici. Cet effet est ré-exécuté
      // quand visibleRange/currentPage change, donc son cleanup tourne
      // souvent. Annuler le timer de pause à ce moment-là laisserait
      // bgPausedRef.current bloqué à true → bg-render coincé en pause.
      // Le démontage de bgPauseTimerRef est géré par un effet séparé.
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pdfProxy, currentPage, visibleRange.start, visibleRange.end, scale]);

  // Cleanup dédié au démontage du composant : annule le timer de pause du
  // bg-render. Séparé du useEffect bg-render ci-dessus car celui-là est
  // ré-exécuté quand visibleRange change, alors que ce timer doit survivre.
  useEffect(() => {
    return () => {
      if (bgPauseTimerRef.current !== null) {
        window.clearTimeout(bgPauseTimerRef.current);
        bgPauseTimerRef.current = null;
      }
      bgPauseUntilRef.current = 0;
    };
  }, []);

  /* ── Init : hash URL prioritaire sur localStorage ── */
  // Mémorise la page cible au mount, consommée par le useEffect ci-dessous
  // qui déclenche le scrollIntoView dès que le PDF est chargé.
  const initialPageRef = useRef<number | null>(null);
  useEffect(() => {
    const hash = typeof window !== "undefined" ? window.location.hash : "";
    const match = hash.match(/#p(\d+)/);
    const hashPage = match ? parseInt(match[1]) : null;
    const savedPage = getLastPage(doc.id);
    const startPage = hashPage ?? savedPage;
    setCurrentPage(startPage);
    setBookmarked(isBookmarked(doc.id, startPage));
    setNotes(getNotes(doc.id));
    // Mémorise la page initiale pour scroller dessus en mode continu après
    // que le PDF soit chargé et que les wrappers de pages soient mountés.
    // setCurrentPage seul ne suffit pas : en mode continu, le viewport reste
    // scrollé à 0 (page 1) tant qu'on ne fait pas un scrollIntoView explicite.
    initialPageRef.current = startPage;
    // Restaure le zoom mémorisé pour ce document. On force firstScaleSyncRef
    // à true avant le setScale → la prochaine exécution de l'effet [scale]
    // commit renderScale synchronément, sans debounce 600ms ni pauseBgRender
    // (qui seraient inutiles au mount, quand rien n'est encore rendu).
    const savedZoom = getZoom(doc.id);
    if (savedZoom !== null && savedZoom !== scale) {
      firstScaleSyncRef.current = true;
      setScale(savedZoom);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [doc.id]);

  // Scroll vers la page initiale (savedPage ou hashPage) une fois le PDF
  // chargé. Déclenché quand numPages passe de 0 à >0 ou quand continuous
  // change. La ref initialPageRef garde la cible le temps d'attendre les
  // wrappers de pages, puis est vidée pour ne plus se redéclencher.
  useEffect(() => {
    if (numPages === 0) return;
    const target = initialPageRef.current;
    if (target === null) return;
    initialPageRef.current = null;
    if (target <= 1) return;
    // Mode paginé : currentPage suffit, le composant n'affiche qu'une page.
    if (!continuous) return;
    // RAF laisse le temps à React de monter les wrappers (créés par
    // Array.from({ length: numPages }, ...) dans le rendu continu).
    const id = window.requestAnimationFrame(() => {
      const el = pageRefs.current[target - 1];
      if (el) {
        el.scrollIntoView({ behavior: "instant", block: "start" });
      }
    });
    return () => window.cancelAnimationFrame(id);
  }, [numPages, continuous]);

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
      captureZoomAnchor();
      setScale(prev => {
        const delta = e.deltaY < 0 ? 0.1 : -0.1;
        return Math.min(5, Math.max(0.25, Math.round((prev + delta) * 100) / 100));
      });
    };
    el.addEventListener("wheel", onWheel, { passive: false });
    return () => el.removeEventListener("wheel", onWheel);
  }, [captureZoomAnchor]);

  /* ── Pinch-to-zoom mobile (2 doigts) ──────────────── */
  // Pendant le geste : CSS transform sur un wrapper (GPU, zéro re-render).
  // Au touchend : setScale une seule fois → un seul re-rendu PDF net.
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
      // Capture l'ancre APRÈS le reset du transform CSS, sinon les rects
      // sont décalés par le scale visuel du pinch en cours.
      captureZoomAnchor();
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
  }, [captureZoomAnchor]);

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
        setVisibleRange(prev => {
          if (prev.start === firstVis && prev.end === lastVis) return prev;
          // Log + diagnostic des hauteurs autour du viewport pour détecter
          // un éventuel drift (pages au-dessus qui changent de hauteur).
          // const totalH = pageRefs.current.reduce((sum, el) => sum + (el?.offsetHeight || 0), 0);
          // eslint-disable-next-line no-console
          // console.log(
          //   `[pdf] visibleRange → [${firstVis}, ${lastVis}] active=${active} ` +
          //   `cached=${pageImagesRef.current.size} scrollTop=${root.scrollTop} totalH=${totalH}`,
          // );
          return { start: firstVis, end: lastVis };
        });
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

    // let scrollLogCount = 0;
    const onScroll = () => {
      // Met en pause le bg-render pendant 1.5s après chaque scroll : libère
      // pdf.js pour les rendus interactifs des `<Page>` visibles.
      pauseBgRender(1500);

      const now = performance.now();
      const dy = Math.abs(root.scrollTop - lastY);
      const dt = now - lastT;
      const velocity = dt > 0 ? dy / dt : 0;
      lastY = root.scrollTop;
      lastT = now;

      // Log allégé : 1 sur 5 événements + tous les pics rapides.
      // if (velocity >= FAST_THRESHOLD || scrollLogCount++ % 5 === 0) {
      //   // eslint-disable-next-line no-console
      //   console.log(`[pdf] scroll v=${velocity.toFixed(2)}px/ms ${velocity >= FAST_THRESHOLD ? "FAST(defer)" : "normal"} scrollTop=${root.scrollTop}`);
      // }

      if (velocity < FAST_THRESHOLD) {
        scheduleMeasure();
      }
      if (stopTimer !== null) clearTimeout(stopTimer);
      stopTimer = window.setTimeout(() => {
        stopTimer = null;
        // eslint-disable-next-line no-console
        // console.log(`[pdf] scroll stopped, triggering final measure`);
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
    captureZoomAnchor();
    const i = ZOOM_STEPS.findIndex(s => s > scale);
    setScale(ZOOM_STEPS[Math.min(i < 0 ? ZOOM_STEPS.length - 1 : i, ZOOM_STEPS.length - 1)]);
  };
  const zoomOut = () => {
    captureZoomAnchor();
    const i = ZOOM_STEPS.findLastIndex(s => s < scale);
    setScale(ZOOM_STEPS[Math.max(i, 0)]);
  };
  const zoomReset = () => {
    captureZoomAnchor();
    setScale(1);
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

  /* ── Capture d'une page rendue en image ──────────────
   * Stratégie "Chrome-like" : dès qu'une Page react-pdf finit de se rendre,
   * on capture son canvas en JPEG. Les visites suivantes peuvent afficher
   * cette image instantanément (juste un <img>), même quand la page sort
   * de la fenêtre de rendu — pas de re-rasterisation. */
  const handlePageRenderSuccess = useCallback((pageNum: number) => {
    if (pageImagesRef.current.has(pageNum)) return;
    const wrapper = pageRefs.current[pageNum - 1];
    const canvas = wrapper?.querySelector("canvas") as HTMLCanvasElement | null;
    if (!canvas) return;
    try {
      // JPEG 0.6 = ~30-80 Ko/page, 288 pages × 60 Ko ≈ 17 Mo de RAM max.
      const dataUrl = canvas.toDataURL("image/jpeg", 0.6);
      pageImagesRef.current.set(pageNum, dataUrl);
      // eslint-disable-next-line no-console
      // console.log(`[pdf] cached page ${pageNum} (${Math.round(dataUrl.length / 1024)} kB, total ${pageImagesRef.current.size})`);
      setImageCacheTick(t => t + 1);
    } catch (err) {
      // Cross-origin canvas peut bloquer toDataURL — pdf.js render local OK.
      console.warn(`[pdf] failed to cache page ${pageNum}:`, err);
    }
  }, []);

  /* ── Rendu page (mode continu) ────────────────────── */
  // Référencer imageCacheTick pour que React re-render quand le cache change.
  void imageCacheTick;
  const renderContinuousPage = (pageNum: number) => {
    const renderWindow = getRenderWindowForScale(scale);
    const inWindow =
      Math.abs(pageNum - currentPage) <= renderWindow ||
      (pageNum >= visibleRange.start && pageNum <= visibleRange.end) ||
      // À haut zoom (≥ 1.5), on coupe le coussin LRU : garder 10 pages en
      // canvas live à cette résolution sature pdf.js. Le cache image affiche
      // déjà les pages récemment visitées sans coût CPU.
      (scale < 1.5 && recentPages.includes(pageNum));
    const cachedImage = pageImagesRef.current.get(pageNum);
    const w = (pageSizes.get(pageNum)?.width  ?? pageSize?.width  ?? 595) * scale;
    const h = (pageSizes.get(pageNum)?.height ?? pageSize?.height ?? 842) * scale;
    // Pendant le debounce renderScale, wrapper et canvas sont désynchronisés :
    // le wrapper a déjà la nouvelle taille (scale), mais <Page> est encore au
    // renderScale précédent. Visuellement, le PDF paraît décalé/coincé. On
    // cache donc complètement <Page> tant que renderScale n'a pas committé,
    // et on n'affiche que l'image cachée étirée (ou un skeleton).
    const isRenderScalePending = Math.abs(scale - renderScale) > 0.001;
    return (
      <div
        key={pageNum}
        ref={el => { pageRefs.current[pageNum - 1] = el; }}
        data-page={pageNum}
        className="flex flex-col items-center gap-1 pb-6"
      >
        <div className="text-[10px] text-white/60 font-mono select-none">{pageNum}</div>
        {inWindow ? (
          // Wrapper avec dimensions VERROUILLÉES — peu importe ce que
          // react-pdf fait à l'intérieur (placeholder → canvas transition),
          // la hauteur de cette div reste fixe. C'est crucial pour éviter
          // tout layout shift cumulatif qui ferait dériver le scrollTop.
          <div
            className="relative shadow-lg rounded overflow-hidden"
            style={{ width: `${w}px`, height: `${h}px` }}
          >
            {isRenderScalePending ? (
              // Phase 1 du zoom : on affiche l'image cachée stretchée à la
              // nouvelle taille pour donner un retour visuel immédiat, sans
              // monter un <Page> qui serait à la mauvaise résolution.
              cachedImage ? (
                <img
                  src={cachedImage}
                  alt=""
                  draggable={false}
                  style={{ width: `${w}px`, height: `${h}px`, display: "block" }}
                />
              ) : (
                <div
                  className="bg-muted/30 rounded animate-pulse"
                  style={{ width: `${w}px`, height: `${h}px` }}
                />
              )
            ) : (
              // Phase 2 : renderScale a commit, on monte <Page> proprement
              // à la bonne résolution.
              <Page
                key={`page-${pageNum}-${renderScale}`}
                pageNumber={pageNum}
                scale={renderScale}
                renderTextLayer={false}
                renderAnnotationLayer={false}
                onRenderSuccess={() => handlePageRenderSuccess(pageNum)}
                loading={
                  cachedImage ? (
                    <img
                      src={cachedImage}
                      alt=""
                      draggable={false}
                      style={{ width: `${w}px`, height: `${h}px`, display: "block" }}
                    />
                  ) : (
                    <div
                      className="bg-muted/30 rounded animate-pulse"
                      style={{ width: `${w}px`, height: `${h}px` }}
                    />
                  )
                }
              />
            )}
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
        ) : cachedImage ? (
          // Hors fenêtre + image cachée → on l'affiche tel quel (zéro coût CPU).
          <div className="relative shadow-lg rounded overflow-hidden">
            <img
              src={cachedImage}
              alt=""
              draggable={false}
              style={{ width: `${w}px`, height: `${h}px`, display: "block" }}
            />
          </div>
        ) : (
          // Hors fenêtre et jamais rendue → simple placeholder gris.
          <div
            className="bg-white/10 rounded"
            style={{ width: `${w}px`, height: `${h}px` }}
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
            <Button variant="ghost" size="icon-sm" onClick={zoomReset} title={t.reader.zoomReset}>
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
                  <Button variant="outline" size="icon-sm" onClick={zoomReset} className="flex-1" title={t.reader.zoomReset}>
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
          className="flex-1 overflow-auto flex flex-col bg-neutral-300 dark:bg-neutral-900"
          // alignItems: "safe center" — centre le contenu tant qu'il rentre,
          // mais bascule en "start" quand il déborde, ce qui permet de
          // scroller vers la gauche pour voir le débordement (sans ça, le
          // contenu débordant à gauche du centre est inaccessible).
          style={{
            padding: continuous ? "1.5rem 1.5rem 0" : "1.5rem",
            alignItems: "safe center",
            // overflowAnchor: "none" — empêche le navigateur de réajuster
            // automatiquement scrollTop quand des éléments au-dessus du
            // viewport changent de hauteur. Maintenant que chaque wrapper
            // de page a une hauteur figée, cette ancre n'a plus rien à
            // compenser — on la désactive pour éviter toute dérive résiduelle.
            overflowAnchor: "none",
          }}
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
                        key={`page-${currentPage}-${renderScale}`}
                        pageNumber={currentPage}
                        scale={renderScale}
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
          <PageInput
            current={currentPage}
            total={numPages}
            onCommit={goTo}
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
