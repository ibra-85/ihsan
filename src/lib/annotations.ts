/**
 * Annotations / dessin sur les PDF.
 * Stockées par (document, page) dans localStorage.
 * Coordonnées NORMALISÉES (0–1) pour rester indépendantes du zoom.
 * Épaisseurs / tailles en "px de référence" relatives à REF_WIDTH.
 */

export type DrawTool = "pen" | "highlighter" | "eraser" | "rect" | "arrow" | "line" | "text";

export type ShapeTool = "pen" | "highlighter" | "rect" | "arrow" | "line";

export type Stroke = {
  id: string;
  tool: ShapeTool;
  color: string;
  width: number;        // épaisseur en px de référence
  points: number[];     // coords normalisées 0–1 : [x1,y1,x2,y2,...]
};

export type TextNote = {
  id: string;
  x: number;            // coin haut-gauche, normalisé 0–1
  y: number;
  content: string;
  size: number;         // taille de police en px de référence
  color: string;
  bold: boolean;
  italic: boolean;
};

export type PageAnnotations = {
  strokes: Stroke[];
  texts: TextNote[];
};

/** Largeur de page de référence pour l'échelle des épaisseurs/tailles. */
export const REF_WIDTH = 1000;

const keyFor = (docId: string, page: number) => `ql-draw-${docId}-${page}`;

const EMPTY: PageAnnotations = { strokes: [], texts: [] };

export function getAnnotations(docId: string, page: number): PageAnnotations {
  if (typeof window === "undefined") return { strokes: [], texts: [] };
  try {
    const raw = localStorage.getItem(keyFor(docId, page));
    if (!raw) return { strokes: [], texts: [] };
    const parsed = JSON.parse(raw);
    // Ancien format : tableau de Stroke uniquement
    if (Array.isArray(parsed)) return { strokes: parsed as Stroke[], texts: [] };
    return {
      strokes: (parsed.strokes as Stroke[]) ?? [],
      texts: (parsed.texts as TextNote[]) ?? [],
    };
  } catch {
    return { strokes: [], texts: [] };
  }
}

export function saveAnnotations(docId: string, page: number, data: PageAnnotations): void {
  if (typeof window === "undefined") return;
  try {
    if (data.strokes.length === 0 && data.texts.length === 0) {
      localStorage.removeItem(keyFor(docId, page));
    } else {
      localStorage.setItem(keyFor(docId, page), JSON.stringify(data));
    }
  } catch {
    /* quota localStorage dépassé — on ignore */
  }
}

export function clearPage(docId: string, page: number): void {
  if (typeof window === "undefined") return;
  localStorage.removeItem(keyFor(docId, page));
}

/** Nombre de pages annotées pour un document. */
export function countDrawnPages(docId: string): number {
  if (typeof window === "undefined") return 0;
  const prefix = `ql-draw-${docId}-`;
  let n = 0;
  for (const k of Object.keys(localStorage)) {
    if (k.startsWith(prefix)) n++;
  }
  return n;
}

/** Pages annotées (numéros) d'un document, triées. */
export function drawnPages(docId: string): number[] {
  if (typeof window === "undefined") return [];
  const prefix = `ql-draw-${docId}-`;
  const pages: number[] = [];
  for (const k of Object.keys(localStorage)) {
    if (k.startsWith(prefix)) {
      const n = parseInt(k.slice(prefix.length), 10);
      if (!Number.isNaN(n)) pages.push(n);
    }
  }
  return pages.sort((a, b) => a - b);
}

export { EMPTY as EMPTY_ANNOTATIONS };
