"use client";

import Link from "next/link";
import { HugeiconsIcon, type IconSvgElement } from "@hugeicons/react";
import {
  SunriseIcon,
  SunsetIcon,
  Mosque01Icon,
  HandsClappingIcon,
} from "@hugeicons/core-free-icons";
import { AZKAR_CATEGORIES, type AzkarCategoryId } from "@/lib/azkar-data";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { useI18n } from "@/components/i18n-provider";

const ICONS: Record<AzkarCategoryId, IconSvgElement> = {
  morning: SunriseIcon,
  evening: SunsetIcon,
  "after-prayer": Mosque01Icon,
  "daily-life": HandsClappingIcon,
};

export default function AzkarHome() {
  const { t, locale } = useI18n();

  return (
    <div className="max-w-3xl mx-auto px-4 py-8">
      <div className="flex items-center gap-3 mb-8">
        <div className="size-11 rounded-xl bg-primary/10 flex items-center justify-center shrink-0">
          <HugeiconsIcon icon={HandsClappingIcon} className="size-5 text-primary" />
        </div>
        <div>
          <h1 className="text-xl font-bold">{t.azkar.title}</h1>
          <p className="text-sm text-muted-foreground">{t.azkar.subtitle}</p>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {AZKAR_CATEGORIES.map((cat) => (
          <Link key={cat.id} href={`/azkar/${cat.id}`} className="group">
            <Card className="h-full transition-all hover:border-primary/50 hover:shadow-md">
              <CardHeader>
                <CardTitle className="flex items-center gap-2.5">
                  <HugeiconsIcon icon={ICONS[cat.id]} className="size-5 text-primary" />
                  {cat.title[locale]}
                </CardTitle>
                <CardDescription>{cat.description[locale]}</CardDescription>
              </CardHeader>
              <Separator />
              <CardContent className="pt-4">
                <p className="text-xs text-muted-foreground">
                  {cat.items.length} {t.azkar.itemsCount}
                </p>
              </CardContent>
            </Card>
          </Link>
        ))}
      </div>
    </div>
  );
}
