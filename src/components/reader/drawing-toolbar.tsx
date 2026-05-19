"use client";

import { useEffect, useState } from "react";
import { HugeiconsIcon } from "@hugeicons/react";
import {
  Pen01Icon,
  HighlighterIcon,
  EraserIcon,
  SquareIcon,
  ArrowUpRight01Icon,
  MinusSignIcon,
  TextIcon,
  TextBoldIcon,
  TextItalicIcon,
  Delete01Icon,
  Cancel01Icon,
  UndoIcon,
  RedoIcon,
  Download01Icon,
} from "@hugeicons/core-free-icons";
import type { DrawTool } from "@/lib/annotations";
import type { Dictionary } from "@/lib/dictionaries";
import { useI18n } from "@/components/i18n-provider";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

type ReaderKey = keyof Dictionary["reader"];

export const DRAW_COLORS: { id: string; key: ReaderKey }[] = [
  { id: "#1f2937", key: "colorBlack"  },
  { id: "#dc2626", key: "colorRed"    },
  { id: "#2563eb", key: "colorBlue"   },
  { id: "#16a34a", key: "colorGreen"  },
  { id: "#f59e0b", key: "colorOrange" },
  { id: "#facc15", key: "colorYellow" },
];

export const DRAW_WIDTHS: { id: number; key: ReaderKey }[] = [
  { id: 2, key: "widthThin"   },
  { id: 4, key: "widthMedium" },
  { id: 7, key: "widthThick"  },
];

export const TEXT_SIZES: { id: number; key: ReaderKey; glyph: number }[] = [
  { id: 16, key: "sizeSmall",  glyph: 11 },
  { id: 24, key: "sizeMedium", glyph: 14 },
  { id: 36, key: "sizeLarge",  glyph: 18 },
];

const TOOLS: { id: DrawTool; icon: Parameters<typeof HugeiconsIcon>[0]["icon"]; key: ReaderKey }[] = [
  { id: "pen",         icon: Pen01Icon,          key: "toolPen" },
  { id: "highlighter", icon: HighlighterIcon,    key: "toolHighlighter" },
  { id: "line",        icon: MinusSignIcon,      key: "toolLine" },
  { id: "arrow",       icon: ArrowUpRight01Icon, key: "toolArrow" },
  { id: "rect",        icon: SquareIcon,         key: "toolRect" },
  { id: "text",        icon: TextIcon,           key: "toolText" },
  { id: "eraser",      icon: EraserIcon,         key: "toolEraser" },
];

type Props = {
  tool: DrawTool;
  color: string;
  strokeWidth: number;
  textSize: number;
  textBold: boolean;
  textItalic: boolean;
  onToolChange: (t: DrawTool) => void;
  onColorChange: (c: string) => void;
  onWidthChange: (w: number) => void;
  onTextSizeChange: (s: number) => void;
  onTextBoldChange: (b: boolean) => void;
  onTextItalicChange: (i: boolean) => void;
  onExport: () => void;
  onClearPage: () => void;
  onClose: () => void;
};

export function DrawingToolbar({
  tool, color, strokeWidth, textSize, textBold, textItalic,
  onToolChange, onColorChange, onWidthChange,
  onTextSizeChange, onTextBoldChange, onTextItalicChange,
  onExport, onClearPage, onClose,
}: Props) {
  const { t } = useI18n();
  const [canUndo, setCanUndo] = useState(false);
  const [canRedo, setCanRedo] = useState(false);

  /* Raccourcis clavier undo/redo */
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (!(e.ctrlKey || e.metaKey)) return;
      const k = e.key.toLowerCase();
      if (k === "z" && !e.shiftKey) {
        e.preventDefault();
        window.dispatchEvent(new Event("ql-draw-undo"));
      } else if (k === "y" || (k === "z" && e.shiftKey)) {
        e.preventDefault();
        window.dispatchEvent(new Event("ql-draw-redo"));
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  /* État undo/redo remonté par le DrawingLayer courant */
  useEffect(() => {
    const onHistory = (e: Event) => {
      const d = (e as CustomEvent<{ canUndo: boolean; canRedo: boolean }>).detail;
      setCanUndo(!!d?.canUndo);
      setCanRedo(!!d?.canRedo);
    };
    window.addEventListener("ql-draw-history", onHistory);
    return () => window.removeEventListener("ql-draw-history", onHistory);
  }, []);

  const isText = tool === "text";

  return (
    <div className="absolute left-1/2 -translate-x-1/2 bottom-16 z-30 w-[calc(100%-1.5rem)] max-w-fit">
      <div className="flex items-center gap-1 bg-card border rounded-xl shadow-lg p-1.5 overflow-x-auto scrollbar-none">

        {/* Annuler / Rétablir */}
        <Button
          variant="ghost" size="icon-sm"
          onClick={() => window.dispatchEvent(new Event("ql-draw-undo"))}
          disabled={!canUndo}
          title={t.reader.undo}
          className="shrink-0 text-muted-foreground"
        >
          <HugeiconsIcon icon={UndoIcon} />
        </Button>
        <Button
          variant="ghost" size="icon-sm"
          onClick={() => window.dispatchEvent(new Event("ql-draw-redo"))}
          disabled={!canRedo}
          title={t.reader.redo}
          className="shrink-0 text-muted-foreground"
        >
          <HugeiconsIcon icon={RedoIcon} />
        </Button>

        <div className="h-6 w-px bg-border mx-0.5 shrink-0" />

        {/* Outils */}
        {TOOLS.map(tl => (
          <button
            key={tl.id}
            type="button"
            onClick={() => onToolChange(tl.id)}
            title={t.reader[tl.key]}
            aria-label={t.reader[tl.key]}
            aria-pressed={tool === tl.id}
            className={cn(
              "size-7 rounded-md flex items-center justify-center transition-colors shrink-0",
              tool === tl.id ? "bg-primary/15" : "hover:bg-muted"
            )}
          >
            <HugeiconsIcon
              icon={tl.icon}
              className={cn("size-4", tool === tl.id ? "text-primary" : "text-muted-foreground")}
            />
          </button>
        ))}

        <div className="h-6 w-px bg-border mx-0.5 shrink-0" />

        {/* Couleurs */}
        <div className="flex items-center gap-2 px-1 shrink-0">
          {DRAW_COLORS.map(c => (
            <button
              key={c.id}
              onClick={() => onColorChange(c.id)}
              title={t.reader[c.key]}
              aria-label={t.reader[c.key]}
              className={cn(
                "size-6 rounded-full shrink-0 transition-transform ring-1 ring-border",
                color === c.id ? "scale-115 ring-2 ring-foreground" : "hover:scale-110"
              )}
              style={{ background: c.id }}
            />
          ))}
        </div>

        <div className="h-6 w-px bg-border mx-0.5 shrink-0" />

        {isText ? (
          <>
            {/* Gras / Italique */}
            <button
              type="button"
              onClick={() => onTextBoldChange(!textBold)}
              title={t.reader.bold}
              aria-pressed={textBold}
              className={cn(
                "size-7 rounded-md flex items-center justify-center transition-colors shrink-0",
                textBold ? "bg-primary/15" : "hover:bg-muted"
              )}
            >
              <HugeiconsIcon icon={TextBoldIcon} className={cn("size-4", textBold ? "text-primary" : "text-muted-foreground")} />
            </button>
            <button
              type="button"
              onClick={() => onTextItalicChange(!textItalic)}
              title={t.reader.italic}
              aria-pressed={textItalic}
              className={cn(
                "size-7 rounded-md flex items-center justify-center transition-colors shrink-0",
                textItalic ? "bg-primary/15" : "hover:bg-muted"
              )}
            >
              <HugeiconsIcon icon={TextItalicIcon} className={cn("size-4", textItalic ? "text-primary" : "text-muted-foreground")} />
            </button>

            <div className="h-6 w-px bg-border mx-0.5 shrink-0" />

            {/* Taille du texte */}
            <div className="flex items-center gap-0.5 shrink-0">
              {TEXT_SIZES.map(s => (
                <button
                  key={s.id}
                  onClick={() => onTextSizeChange(s.id)}
                  title={t.reader[s.key]}
                  className={cn(
                    "size-7 rounded-md flex items-center justify-center transition-colors shrink-0",
                    textSize === s.id ? "bg-primary/15" : "hover:bg-muted"
                  )}
                >
                  <span
                    className={cn("font-bold leading-none", textSize === s.id ? "text-primary" : "text-muted-foreground")}
                    style={{ fontSize: s.glyph }}
                  >
                    A
                  </span>
                </button>
              ))}
            </div>
          </>
        ) : (
          /* Épaisseur du trait */
          <div className="flex items-center gap-0.5 shrink-0">
            {DRAW_WIDTHS.map(w => (
              <button
                key={w.id}
                onClick={() => onWidthChange(w.id)}
                title={t.reader[w.key]}
                className={cn(
                  "size-7 rounded-md flex items-center justify-center transition-colors shrink-0",
                  strokeWidth === w.id ? "bg-primary/15" : "hover:bg-muted"
                )}
              >
                <span
                  className={cn("rounded-full", strokeWidth === w.id ? "bg-primary" : "bg-muted-foreground")}
                  style={{ width: w.id + 2, height: w.id + 2 }}
                />
              </button>
            ))}
          </div>
        )}

        <div className="h-6 w-px bg-border mx-0.5 shrink-0" />

        {/* Exporter les pages annotées en PNG */}
        <Button
          variant="ghost"
          size="icon-sm"
          onClick={onExport}
          title={t.reader.exportDrawings}
          className="shrink-0 text-muted-foreground"
        >
          <HugeiconsIcon icon={Download01Icon} />
        </Button>

        {/* Effacer la page */}
        <Button
          variant="ghost"
          size="icon-sm"
          onClick={onClearPage}
          title={t.reader.clearPage}
          className="shrink-0 text-muted-foreground hover:text-destructive"
        >
          <HugeiconsIcon icon={Delete01Icon} />
        </Button>

        {/* Fermer le mode dessin */}
        <Button
          variant="ghost"
          size="icon-sm"
          onClick={onClose}
          title={t.reader.exitDraw}
          className="shrink-0"
        >
          <HugeiconsIcon icon={Cancel01Icon} />
        </Button>
      </div>
    </div>
  );
}
