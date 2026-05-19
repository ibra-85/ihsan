"use client";

import { useRef, useEffect, useCallback, useState } from "react";
import {
  getAnnotations, saveAnnotations, REF_WIDTH,
  type Stroke, type TextNote, type PageAnnotations,
  type DrawTool, type ShapeTool,
} from "@/lib/annotations";
import { drawStroke, drawText, LINE_HEIGHT, FONT_FAMILY } from "@/lib/draw-render";

type Props = {
  docId: string;
  pageNumber: number;
  enabled: boolean;
  isCurrent: boolean;
  tool: DrawTool;
  color: string;
  strokeWidth: number;
  textSize: number;
  textBold: boolean;
  textItalic: boolean;
};

type Editing = { id: string | null; nx: number; ny: number; value: string };

let strokeSeq = 0;
let textSeq = 0;
const HISTORY_LIMIT = 60;

export function DrawingLayer({
  docId, pageNumber, enabled, isCurrent,
  tool, color, strokeWidth, textSize, textBold, textItalic,
}: Props) {
  const canvasRef    = useRef<HTMLCanvasElement>(null);
  const textareaRef  = useRef<HTMLTextAreaElement>(null);
  const strokesRef   = useRef<Stroke[]>([]);
  const textsRef     = useRef<TextNote[]>([]);
  const currentRef   = useRef<Stroke | null>(null);
  const drawingRef   = useRef(false);
  const sizeRef      = useRef({ w: 0, h: 0 });
  const historyRef   = useRef<PageAnnotations[]>([{ strokes: [], texts: [] }]);
  const histIdxRef   = useRef(0);
  const erasedRef    = useRef(false);
  const textBoxRef   = useRef<Map<string, { x: number; y: number; w: number; h: number }>>(new Map());
  const dragRef      = useRef<{ id: string; startNx: number; startNy: number; moved: boolean } | null>(null);
  const pendingNewRef = useRef<{ nx: number; ny: number } | null>(null);
  const editingIdRef = useRef<string | null>(null);

  const enabledRef   = useRef(enabled);
  const isCurrentRef = useRef(isCurrent);
  useEffect(() => { enabledRef.current = enabled; isCurrentRef.current = isCurrent; }, [enabled, isCurrent]);

  const [dims, setDims]       = useState({ w: 0, h: 0 });
  const [editing, setEditing] = useState<Editing | null>(null);
  useEffect(() => { editingIdRef.current = editing?.id ?? null; }, [editing]);

  /* Notifie la barre d'outils de l'état undo/redo */
  const emitHistory = useCallback(() => {
    if (!enabledRef.current || !isCurrentRef.current) return;
    window.dispatchEvent(new CustomEvent("ql-draw-history", {
      detail: {
        canUndo: histIdxRef.current > 0,
        canRedo: histIdxRef.current < historyRef.current.length - 1,
      },
    }));
  }, []);

  const redraw = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    const { w, h } = sizeRef.current;
    ctx.clearRect(0, 0, w, h);
    for (const s of strokesRef.current) drawStroke(ctx, s, w, h);
    if (currentRef.current) drawStroke(ctx, currentRef.current, w, h);
    const boxes = new Map<string, { x: number; y: number; w: number; h: number }>();
    for (const t of textsRef.current) {
      if (t.id === editingIdRef.current) continue; // masqué pendant l'édition
      boxes.set(t.id, drawText(ctx, t, w, h));
    }
    textBoxRef.current = boxes;
  }, []);

  /* Sauvegarde + historique */
  const commit = useCallback((next: PageAnnotations) => {
    strokesRef.current = next.strokes;
    textsRef.current = next.texts;
    saveAnnotations(docId, pageNumber, next);
    const h = historyRef.current.slice(0, histIdxRef.current + 1);
    h.push(next);
    if (h.length > HISTORY_LIMIT) h.shift();
    historyRef.current = h;
    histIdxRef.current = h.length - 1;
    redraw();
    emitHistory();
  }, [docId, pageNumber, redraw, emitHistory]);

  const applySnapshot = useCallback((snap: PageAnnotations) => {
    strokesRef.current = snap.strokes;
    textsRef.current = snap.texts;
    saveAnnotations(docId, pageNumber, snap);
    redraw();
    emitHistory();
  }, [docId, pageNumber, redraw, emitHistory]);

  const undo = useCallback(() => {
    if (histIdxRef.current <= 0) return;
    setEditing(null);
    histIdxRef.current -= 1;
    applySnapshot(historyRef.current[histIdxRef.current]);
  }, [applySnapshot]);

  const redo = useCallback(() => {
    if (histIdxRef.current >= historyRef.current.length - 1) return;
    setEditing(null);
    histIdxRef.current += 1;
    applySnapshot(historyRef.current[histIdxRef.current]);
  }, [applySnapshot]);

  /* Taille du canvas (zoom) */
  useEffect(() => {
    const canvas = canvasRef.current;
    const parent = canvas?.parentElement;
    if (!canvas || !parent) return;
    const ro = new ResizeObserver(() => {
      const rect = parent.getBoundingClientRect();
      if (rect.width === 0) return;
      const dpr = window.devicePixelRatio || 1;
      sizeRef.current = { w: rect.width, h: rect.height };
      canvas.width  = Math.round(rect.width * dpr);
      canvas.height = Math.round(rect.height * dpr);
      const ctx = canvas.getContext("2d");
      if (ctx) ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      setDims({ w: rect.width, h: rect.height });
      redraw();
    });
    ro.observe(parent);
    return () => ro.disconnect();
  }, [redraw]);

  /* Chargement initial + reset historique */
  useEffect(() => {
    const a = getAnnotations(docId, pageNumber);
    strokesRef.current = a.strokes;
    textsRef.current = a.texts;
    historyRef.current = [a];
    histIdxRef.current = 0;
    redraw();
  }, [docId, pageNumber, redraw]);

  /* Re-render à l'ouverture/fermeture de l'éditeur */
  useEffect(() => { redraw(); }, [editing, redraw]);
  useEffect(() => {
    if (editing) setTimeout(() => textareaRef.current?.focus(), 30);
  }, [editing]);

  /* Undo/redo — layer courant uniquement */
  useEffect(() => {
    if (!enabled || !isCurrent) return;
    emitHistory();
    const onUndo = () => undo();
    const onRedo = () => redo();
    window.addEventListener("ql-draw-undo", onUndo);
    window.addEventListener("ql-draw-redo", onRedo);
    return () => {
      window.removeEventListener("ql-draw-undo", onUndo);
      window.removeEventListener("ql-draw-redo", onRedo);
    };
  }, [enabled, isCurrent, undo, redo, emitHistory]);

  const normPoint = (e: React.PointerEvent): [number, number] => {
    const rect = canvasRef.current!.getBoundingClientRect();
    return [
      Math.min(1, Math.max(0, (e.clientX - rect.left) / rect.width)),
      Math.min(1, Math.max(0, (e.clientY - rect.top) / rect.height)),
    ];
  };

  const hitText = (nx: number, ny: number): TextNote | null => {
    for (let i = textsRef.current.length - 1; i >= 0; i--) {
      const t = textsRef.current[i];
      const b = textBoxRef.current.get(t.id);
      if (!b) continue;
      const m = 0.008;
      if (nx >= b.x - m && nx <= b.x + b.w + m && ny >= b.y - m && ny <= b.y + b.h + m) {
        return t;
      }
    }
    return null;
  };

  /* Gomme : efface traits ET textes proches */
  const eraseAt = (nx: number, ny: number) => {
    const TH = 0.018;
    const sBefore = strokesRef.current.length;
    const tBefore = textsRef.current.length;
    const strokes = strokesRef.current.filter(s => {
      for (let i = 0; i < s.points.length; i += 2) {
        if (Math.hypot(s.points[i] - nx, s.points[i + 1] - ny) < TH) return false;
      }
      return true;
    });
    const hit = hitText(nx, ny);
    const texts = hit ? textsRef.current.filter(t => t.id !== hit.id) : textsRef.current;
    if (strokes.length !== sBefore || texts.length !== tBefore) {
      strokesRef.current = strokes;
      textsRef.current = texts;
      erasedRef.current = true;
      redraw();
    }
  };

  /* ── Édition de texte ──────────────────────────── */
  const openTextEditor = (note: TextNote | null, nx: number, ny: number) => {
    if (note) {
      // synchronise la barre d'outils sur le style du texte cliqué
      window.dispatchEvent(new CustomEvent("ql-text-style", {
        detail: { size: note.size, color: note.color, bold: note.bold, italic: note.italic },
      }));
      setEditing({ id: note.id, nx: note.x, ny: note.y, value: note.content });
    } else {
      setEditing({ id: null, nx, ny, value: "" });
    }
  };

  const commitEditor = () => {
    setEditing(prev => {
      if (!prev) return null;
      const value = prev.value.replace(/\s+$/, "");
      let nextTexts = textsRef.current;
      if (!value) {
        if (prev.id) nextTexts = nextTexts.filter(t => t.id !== prev.id);
      } else {
        const note: TextNote = {
          id: prev.id ?? `t${Date.now()}-${textSeq++}`,
          x: prev.nx, y: prev.ny,
          content: value,
          size: textSize, color, bold: textBold, italic: textItalic,
        };
        nextTexts = prev.id
          ? nextTexts.map(t => (t.id === prev.id ? note : t))
          : [...nextTexts, note];
      }
      if (nextTexts !== textsRef.current) {
        commit({ strokes: strokesRef.current, texts: nextTexts });
      }
      return null;
    });
  };

  /* ── Pointer handlers ──────────────────────────── */
  const onPointerDown = (e: React.PointerEvent) => {
    if (!enabled) return;
    const [nx, ny] = normPoint(e);

    if (tool === "text") {
      const hit = hitText(nx, ny);
      if (hit) {
        dragRef.current = { id: hit.id, startNx: nx, startNy: ny, moved: false };
      } else {
        pendingNewRef.current = { nx, ny };
      }
      return;
    }

    e.preventDefault();
    canvasRef.current?.setPointerCapture(e.pointerId);
    drawingRef.current = true;

    if (tool === "eraser") {
      erasedRef.current = false;
      eraseAt(nx, ny);
      return;
    }
    currentRef.current = {
      id: `s${Date.now()}-${strokeSeq++}`,
      tool: tool as ShapeTool,
      color,
      width: strokeWidth,
      points: [nx, ny, nx, ny],
    };
    redraw();
  };

  const onPointerMove = (e: React.PointerEvent) => {
    if (!enabled) return;
    const [nx, ny] = normPoint(e);

    if (tool === "text") {
      const d = dragRef.current;
      if (d) {
        if (!d.moved && Math.hypot(nx - d.startNx, ny - d.startNy) > 0.006) d.moved = true;
        if (d.moved) {
          const dx = nx - d.startNx;
          const dy = ny - d.startNy;
          textsRef.current = textsRef.current.map(t =>
            t.id === d.id
              ? { ...t, x: Math.min(1, Math.max(0, t.x + dx)), y: Math.min(1, Math.max(0, t.y + dy)) }
              : t
          );
          d.startNx = nx;
          d.startNy = ny;
          redraw();
        }
      }
      return;
    }

    if (!drawingRef.current) return;
    if (tool === "eraser") { eraseAt(nx, ny); return; }
    const cur = currentRef.current;
    if (!cur) return;
    if (cur.tool === "pen" || cur.tool === "highlighter") {
      cur.points.push(nx, ny);
    } else {
      cur.points = [cur.points[0], cur.points[1], nx, ny];
    }
    redraw();
  };

  const onPointerUp = () => {
    if (!enabled) return;

    if (tool === "text") {
      const d = dragRef.current;
      if (d) {
        if (d.moved) {
          commit({ strokes: strokesRef.current, texts: textsRef.current });
        } else {
          const note = textsRef.current.find(t => t.id === d.id) ?? null;
          if (note) openTextEditor(note, note.x, note.y);
        }
        dragRef.current = null;
      } else if (pendingNewRef.current) {
        const { nx, ny } = pendingNewRef.current;
        openTextEditor(null, nx, ny);
        pendingNewRef.current = null;
      }
      return;
    }

    if (!drawingRef.current) return;
    drawingRef.current = false;
    if (tool === "eraser") {
      if (erasedRef.current) commit({ strokes: strokesRef.current, texts: textsRef.current });
      erasedRef.current = false;
    } else {
      const cur = currentRef.current;
      if (cur) {
        const moved =
          Math.hypot(
            cur.points[cur.points.length - 2] - cur.points[0],
            cur.points[cur.points.length - 1] - cur.points[1],
          ) > 0.004 || cur.points.length > 4;
        if (moved) commit({ strokes: [...strokesRef.current, cur], texts: textsRef.current });
      }
    }
    currentRef.current = null;
    redraw();
  };

  const refScale = dims.w > 0 ? dims.w / REF_WIDTH : 1;

  return (
    <div className="absolute inset-0 z-10" style={{ pointerEvents: enabled ? "auto" : "none" }}>
      <canvas
        ref={canvasRef}
        className="absolute inset-0"
        style={{
          width: "100%",
          height: "100%",
          touchAction: enabled ? "none" : "auto",
          cursor: enabled
            ? tool === "eraser" ? "cell" : tool === "text" ? "text" : "crosshair"
            : "default",
        }}
        onPointerDown={onPointerDown}
        onPointerMove={onPointerMove}
        onPointerUp={onPointerUp}
        onPointerCancel={onPointerUp}
      />

      {editing && (
        <textarea
          ref={textareaRef}
          value={editing.value}
          onChange={e => setEditing(prev => prev && { ...prev, value: e.target.value })}
          onBlur={commitEditor}
          onKeyDown={e => {
            if (e.key === "Escape") { e.preventDefault(); setEditing(null); }
          }}
          rows={Math.max(1, editing.value.split("\n").length)}
          spellCheck={false}
          className="absolute resize-none outline-none rounded border-2 border-dashed border-primary bg-background/85 px-1 py-0 overflow-hidden shadow"
          style={{
            left: `${editing.nx * 100}%`,
            top: `${editing.ny * 100}%`,
            minWidth: `${4 * textSize * refScale}px`,
            color,
            fontFamily: FONT_FAMILY,
            fontSize: `${textSize * refScale}px`,
            fontWeight: textBold ? 700 : 400,
            fontStyle: textItalic ? "italic" : "normal",
            lineHeight: LINE_HEIGHT,
          }}
        />
      )}
    </div>
  );
}
