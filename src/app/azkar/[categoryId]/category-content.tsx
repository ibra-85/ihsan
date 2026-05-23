"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { HugeiconsIcon } from "@hugeicons/react";
import { ArrowLeft01Icon, ArrowRight01Icon } from "@hugeicons/core-free-icons";
import { Button } from "@/components/ui/button";
import { AzkarCard } from "@/components/azkar-card";
import { useI18n } from "@/components/i18n-provider";
import { getAzkarCategory } from "@/lib/azkar-data";
import { notFound } from "next/navigation";

export default function CategoryContent({ categoryId }: { categoryId: string }) {
  const { t, locale } = useI18n();
  const [voicesReady, setVoicesReady] = useState(false);

  // Précharge la liste des voix TTS (sur certains navigateurs la liste est vide
  // au premier appel et se peuple via l'événement `voiceschanged`).
  useEffect(() => {
    if (typeof window === "undefined" || !window.speechSynthesis) return;
    const sync = () => setVoicesReady(window.speechSynthesis.getVoices().length > 0);
    sync();
    window.speechSynthesis.addEventListener("voiceschanged", sync);
    return () => window.speechSynthesis.removeEventListener("voiceschanged", sync);
  }, []);

  const cat = getAzkarCategory(categoryId);
  if (!cat) {
    notFound();
  }

  const hasArabicVoice =
    typeof window !== "undefined" &&
    window.speechSynthesis &&
    window.speechSynthesis.getVoices().some((v) => v.lang.startsWith("ar"));

  const BackIcon = locale === "ar" ? ArrowRight01Icon : ArrowLeft01Icon;

  return (
    <div className="max-w-3xl mx-auto px-4 py-8">
      <div className="flex items-center gap-3 mb-6">
        <Button asChild variant="ghost" size="icon-sm">
          <Link href="/azkar" title={t.common.back}>
            <HugeiconsIcon icon={BackIcon} />
          </Link>
        </Button>
        <div>
          <h1 className="text-xl font-bold">{cat.title[locale]}</h1>
          <p className="text-sm text-muted-foreground">{cat.description[locale]}</p>
        </div>
      </div>

      {voicesReady && !hasArabicVoice && (
        <div className="mb-4 p-3 rounded-lg bg-warning/10 text-warning text-xs leading-relaxed">
          {t.azkar.noArabicVoice}
        </div>
      )}

      <div className="flex flex-col gap-3">
        {cat.items.map((z, i) => (
          <AzkarCard key={z.id} zikr={z} categoryId={cat.id} index={i} />
        ))}
      </div>
    </div>
  );
}
