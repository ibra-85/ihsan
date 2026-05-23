"use client";

import { useEffect, useRef, useState } from "react";
import { HugeiconsIcon } from "@hugeicons/react";
import {
  VolumeHighIcon,
  VolumeMute01Icon,
  Refresh01Icon,
} from "@hugeicons/core-free-icons";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { useI18n } from "@/components/i18n-provider";
import type { Zikr } from "@/lib/azkar-data";

const STORAGE_KEY = (categoryId: string, id: string) =>
  `ql-azkar-count-${categoryId}-${id}`;

export function AzkarCard({
  zikr,
  categoryId,
  index,
}: {
  zikr: Zikr;
  categoryId: string;
  /** Position dans la liste (0-based) — utilisé comme fallback de titre. */
  index: number;
}) {
  const { t, locale } = useI18n();
  const [count, setCount] = useState(0);
  const [speaking, setSpeaking] = useState(false);
  const utteranceRef = useRef<SpeechSynthesisUtterance | null>(null);

  useEffect(() => {
    if (typeof window === "undefined") return;
    const saved = localStorage.getItem(STORAGE_KEY(categoryId, zikr.id));
    if (saved) setCount(parseInt(saved, 10) || 0);
  }, [categoryId, zikr.id]);

  useEffect(() => {
    if (typeof window === "undefined") return;
    if (count > 0) {
      localStorage.setItem(STORAGE_KEY(categoryId, zikr.id), String(count));
    } else {
      localStorage.removeItem(STORAGE_KEY(categoryId, zikr.id));
    }
  }, [count, categoryId, zikr.id]);

  useEffect(() => {
    return () => {
      if (typeof window !== "undefined" && window.speechSynthesis) {
        window.speechSynthesis.cancel();
      }
    };
  }, []);

  const speak = () => {
    if (typeof window === "undefined" || !window.speechSynthesis) return;
    if (speaking) {
      window.speechSynthesis.cancel();
      setSpeaking(false);
      return;
    }
    const voices = window.speechSynthesis.getVoices();
    const arabicVoice =
      voices.find((v) => v.lang.startsWith("ar") && v.localService) ||
      voices.find((v) => v.lang.startsWith("ar")) ||
      null;

    const utter = new SpeechSynthesisUtterance(zikr.arabic);
    utter.lang = arabicVoice?.lang || "ar-SA";
    if (arabicVoice) utter.voice = arabicVoice;
    utter.rate = 0.85;
    utter.onend = () => setSpeaking(false);
    utter.onerror = () => setSpeaking(false);
    utteranceRef.current = utter;
    setSpeaking(true);
    window.speechSynthesis.speak(utter);
  };

  const repeat = zikr.repeat ?? 1;
  const done = count >= repeat;
  const progress = Math.min(100, Math.round((count / repeat) * 100));
  const translit =
    locale === "ru" && zikr.transliterationRu
      ? zikr.transliterationRu
      : zikr.transliteration;

  // Titre = champ explicite, sinon numéro auto.
  const title = zikr.title?.[locale] ?? `№${index + 1}`;

  return (
    <Card className={cn("relative overflow-hidden", done && "border-success/50")}>
      {/* Barre de progression en arrière-plan */}
      <div
        className="absolute inset-y-0 start-0 bg-success/8 transition-all pointer-events-none"
        style={{ width: `${progress}%` }}
        aria-hidden
      />

      {/* ── Header : titre + badge répétitions + source ────────────────── */}
      <div className="relative px-6 pt-4 pb-3 flex items-start justify-between gap-3">
        <div className="min-w-0 flex-1">
          <h3 className="font-semibold text-base leading-tight">
            {title}
          </h3>
          {zikr.source && (
            <p className="text-[11px] text-muted-foreground mt-0.5">
              {zikr.source}
            </p>
          )}
        </div>
        {repeat > 1 && (
          <Badge variant="secondary" className="shrink-0 tabular-nums">
            × {repeat}
          </Badge>
        )}
      </div>

      <Separator />

      {/* ── Corps : arabe / translit / traduction ─────────────────────── */}
      <CardContent className="relative pt-4 flex flex-col gap-3">
        <p
          dir="rtl"
          lang="ar"
          className="text-2xl leading-loose text-foreground whitespace-pre-line"
          style={{ fontFamily: "var(--font-arabic)" }}
        >
          {zikr.arabic}
        </p>

        <p className="text-sm italic text-muted-foreground leading-relaxed">
          {translit}
        </p>

        {locale !== "ar" && (
          <p className="text-sm leading-relaxed">
            {zikr.translations[locale]}
          </p>
        )}

        {/* ── Actions ──────────────────────────────────────────────── */}
        <div className="flex items-center justify-between gap-2 pt-2 border-t border-border/50">
          <div className="flex items-center gap-2">
            <Button
              size="sm"
              variant={done ? "outline" : "default"}
              onClick={() => setCount((n) => n + 1)}
              className="tabular-nums min-w-16"
              disabled={done}
            >
              {count} / {repeat}
            </Button>
            {count > 0 && (
              <Button
                size="icon-sm"
                variant="ghost"
                onClick={() => setCount(0)}
                title={t.azkar.reset}
              >
                <HugeiconsIcon icon={Refresh01Icon} />
              </Button>
            )}
          </div>

          <Button
            size="icon-sm"
            variant="ghost"
            onClick={speak}
            title={speaking ? t.azkar.stopAudio : t.azkar.playAudio}
            className={cn(speaking ? "text-primary" : "text-muted-foreground")}
          >
            <HugeiconsIcon icon={speaking ? VolumeMute01Icon : VolumeHighIcon} />
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
