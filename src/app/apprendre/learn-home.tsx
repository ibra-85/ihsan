"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { HugeiconsIcon } from "@hugeicons/react";
import { ArrowRight01Icon, StarIcon, FireIcon } from "@hugeicons/core-free-icons";
import { useI18n } from "@/components/i18n-provider";
import { UNITS } from "@/lib/learn-data";
import { getUnitProgress, getStreak, getLessonStars } from "@/lib/learn-store";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardContent } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { cn } from "@/lib/utils";

function StarRow({ count }: { count: number }) {
  return (
    <div className="flex gap-0.5">
      {[1, 2, 3].map((i) => (
        <HugeiconsIcon
          key={i}
          icon={StarIcon}
          className={cn("size-3.5", i <= count ? "text-amber-400" : "text-muted-foreground/30")}
        />
      ))}
    </div>
  );
}

export default function LearnHome() {
  const { t, f, locale } = useI18n();
  const [progressMap, setProgressMap] = useState<Record<string, number>>({});
  const [starsMap, setStarsMap] = useState<Record<string, number[]>>({});
  const [streak, setStreak] = useState({ count: 0, lastDate: "" });

  useEffect(() => {
    const pMap: Record<string, number> = {};
    const sMap: Record<string, number[]> = {};
    for (const unit of UNITS) {
      const ids = unit.lessons.map((l) => l.id);
      pMap[unit.id] = getUnitProgress(unit.id, ids);
      sMap[unit.id] = unit.lessons.map((l) => getLessonStars(unit.id, l.id));
    }
    setProgressMap(pMap);
    setStarsMap(sMap);
    setStreak(getStreak());
  }, []);

  const totalLessons = UNITS.reduce((s, u) => s + u.lessons.length, 0);
  const completedLessons = UNITS.reduce(
    (s, u) => s + u.lessons.filter((l) => getLessonStars(u.id, l.id) > 0).length,
    0
  );

  return (
    <div className="max-w-3xl mx-auto px-4 py-8">
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-2xl font-bold">{t.learn.title}</h1>
        <p className="text-muted-foreground mt-1">{t.learn.subtitle}</p>
      </div>

      {/* Stats bar */}
      <div className="flex flex-wrap gap-4 mb-8 p-4 rounded-xl bg-muted/50">
        <div className="flex items-center gap-2">
          <HugeiconsIcon icon={FireIcon} className="size-5 text-orange-500" />
          <div>
            <p className="text-xs text-muted-foreground">{streak.count > 0 ? f(t.learn.streak, { n: streak.count }) : t.learn.noStreak}</p>
          </div>
        </div>
        <div className="flex items-center gap-2 ms-auto">
          <HugeiconsIcon icon={StarIcon} className="size-5 text-amber-400" />
          <p className="text-sm font-medium">
            {completedLessons} / {totalLessons} {t.learn.lessonsCount.replace("{n}", "").trim()}
          </p>
        </div>
      </div>

      {/* Units */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {UNITS.map((unit) => {
          const progress = progressMap[unit.id] ?? 0;
          const stars = starsMap[unit.id] ?? [];
          const allDone = unit.lessons.length > 0 && stars.every((s) => s > 0);
          const started = stars.some((s) => s > 0);

          return (
            <Card key={unit.id} className="overflow-hidden hover:shadow-md transition-shadow">
              <CardHeader className="pb-0">
                <div className="flex items-start gap-3">
                  <div
                    className={cn(
                      "size-12 rounded-xl flex items-center justify-center text-xl font-bold text-white shrink-0",
                      unit.color
                    )}
                    aria-hidden
                    style={{ fontFamily: "var(--font-arabic)" }}
                  >
                    {unit.icon}
                  </div>
                  <div className="flex-1 min-w-0">
                    <h2 className="font-semibold leading-tight">{unit.title[locale]}</h2>
                    <p className="text-xs text-muted-foreground mt-0.5">
                      {f(t.learn.lessonsCount, { n: unit.lessons.length })}
                    </p>
                  </div>
                </div>
              </CardHeader>

              <Separator className="mt-3" />

              <CardContent className="pt-3 pb-4">
                <p className="text-sm text-muted-foreground mb-3 line-clamp-2">
                  {unit.description[locale]}
                </p>

                {/* Progress bar */}
                <div className="mb-3">
                  <div className="flex justify-between items-center mb-1">
                    <span className="text-xs text-muted-foreground">{t.learn.progress}</span>
                    <span className="text-xs font-medium">{progress}%</span>
                  </div>
                  <div className="h-1.5 rounded-full bg-muted overflow-hidden">
                    <div
                      className="h-full rounded-full bg-primary transition-all"
                      style={{ width: `${progress}%` }}
                    />
                  </div>
                </div>

                {/* Lesson dots */}
                <div className="flex flex-wrap gap-1.5 mb-4">
                  {unit.lessons.map((lesson, i) => {
                    const s = stars[i] ?? 0;
                    return (
                      <div
                        key={lesson.id}
                        title={lesson.title[locale]}
                        className={cn(
                          "size-6 rounded-full border-2 flex items-center justify-center",
                          s === 3 ? "bg-amber-400 border-amber-400" :
                          s > 0  ? "bg-primary/20 border-primary" :
                          "bg-muted border-muted-foreground/20"
                        )}
                      >
                        {s > 0 && <StarRow count={s} />}
                      </div>
                    );
                  })}
                </div>

                <Button asChild size="sm" variant={allDone ? "outline" : "default"} className="w-full">
                  <Link href={`/apprendre/${unit.id}`}>
                    {allDone ? t.learn.review : started ? t.learn.continue : t.learn.start}
                    <HugeiconsIcon icon={ArrowRight01Icon} data-icon="inline-end" />
                  </Link>
                </Button>
              </CardContent>
            </Card>
          );
        })}
      </div>
    </div>
  );
}
