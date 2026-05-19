/**
 * Rendu des annotations (traits + textes) sur un contexte canvas 2D.
 * Partagé entre la couche de dessin live (drawing-layer) et l'export PNG.
 * Coordonnées normalisées 0–1 → multipliées par les dimensions du canvas.
 */

import { REF_WIDTH, type Stroke, type TextNote } from "./annotations";

export const LINE_HEIGHT = 1.3;
export const FONT_FAMILY = "ui-sans-serif, system-ui, -apple-system, sans-serif";

/** Dessine un trait (stylo, surligneur, ligne, flèche, rectangle). */
export function drawStroke(ctx: CanvasRenderingContext2D, s: Stroke, w: number, h: number) {
  const pts = s.points;
  if (pts.length < 4) return;
  const refScale = w / REF_WIDTH;

  ctx.save();
  ctx.strokeStyle = s.color;
  ctx.lineCap = "round";
  ctx.lineJoin = "round";
  ctx.lineWidth = Math.max(0.5, s.width * refScale);

  if (s.tool === "highlighter") {
    ctx.globalAlpha = 0.32;
    ctx.lineWidth = Math.max(1, s.width * refScale * 3.2);
  }

  const X = (i: number) => pts[i] * w;
  const Y = (i: number) => pts[i + 1] * h;
  const lastX = X(pts.length - 2);
  const lastY = Y(pts.length - 2);

  if (s.tool === "pen" || s.tool === "highlighter") {
    ctx.beginPath();
    ctx.moveTo(X(0), Y(0));
    for (let i = 2; i < pts.length; i += 2) ctx.lineTo(X(i), Y(i));
    ctx.stroke();
  } else if (s.tool === "line") {
    ctx.beginPath();
    ctx.moveTo(X(0), Y(0));
    ctx.lineTo(lastX, lastY);
    ctx.stroke();
  } else if (s.tool === "rect") {
    ctx.strokeRect(X(0), Y(0), lastX - X(0), lastY - Y(0));
  } else if (s.tool === "arrow") {
    ctx.beginPath();
    ctx.moveTo(X(0), Y(0));
    ctx.lineTo(lastX, lastY);
    ctx.stroke();
    const angle = Math.atan2(lastY - Y(0), lastX - X(0));
    const head = Math.max(8, 14 * refScale);
    ctx.beginPath();
    ctx.moveTo(lastX, lastY);
    ctx.lineTo(lastX - head * Math.cos(angle - Math.PI / 6), lastY - head * Math.sin(angle - Math.PI / 6));
    ctx.moveTo(lastX, lastY);
    ctx.lineTo(lastX - head * Math.cos(angle + Math.PI / 6), lastY - head * Math.sin(angle + Math.PI / 6));
    ctx.stroke();
  }
  ctx.restore();
}

/** Dessine un texte → renvoie sa bounding box normalisée. */
export function drawText(
  ctx: CanvasRenderingContext2D, t: TextNote, w: number, h: number,
): { x: number; y: number; w: number; h: number } {
  const refScale = w / REF_WIDTH;
  const fontPx = t.size * refScale;
  ctx.save();
  ctx.font = `${t.italic ? "italic " : ""}${t.bold ? "700" : "400"} ${fontPx}px ${FONT_FAMILY}`;
  ctx.fillStyle = t.color;
  ctx.textBaseline = "top";
  const lines = t.content.split("\n");
  const lineH = fontPx * LINE_HEIGHT;
  let maxW = 0;
  lines.forEach((line, i) => {
    ctx.fillText(line, t.x * w, t.y * h + i * lineH);
    maxW = Math.max(maxW, ctx.measureText(line).width);
  });
  ctx.restore();
  return {
    x: t.x,
    y: t.y,
    w: Math.max(maxW, fontPx) / w,
    h: (lines.length * lineH) / h,
  };
}
