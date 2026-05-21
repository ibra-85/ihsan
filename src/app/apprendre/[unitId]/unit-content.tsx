"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { HugeiconsIcon } from "@hugeicons/react";
import { ArrowLeft01Icon, ArrowRight01Icon, StarIcon, LockIcon } from "@hugeicons/core-free-icons";
import { useI18n } from "@/components/i18n-provider";
import { getUnit } from "@/lib/learn-data";
import { getLessonStars } from "@/lib/learn-store";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardContent } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

function Stars({ count }: { count: number }) {
  return (
    <div className="flex gap-0.5">
      {[1, 2, 3].map((i) => (
        <HugeiconsIcon
          key={i}
          icon={StarIcon}
          className={cn("size-4", i <= count ? "text-amber-400" : "text-muted-foreground/30")}
        />
      ))}
    </div>
  );
}

export default function UnitContent() {
  const { unitId } = useParams<{ unitId: string }>();
  const { t, f, locale } = useI18n();
  const unit = getUnit(unitId);

  const [stars, setStars] = useState<number[]>([]);

  useEffect(() => {
    if (!unit) return;
    setStars(unit.lessons.map((l) => getLessonStars(unitId, l.id)));
  }, [unit, unitId]);

  if (!unit) {
    return (
      <div className="max-w-2xl mx-auto px-4 py-8 text-center text-muted-foreground">
        Unité introuvable.
      </div>
    );
  }

  const completedCount = stars.filter((s) => s > 0).length;

  return (
    <div className="max-w-2xl mx-auto px-4 py-8">
      {/* Back */}
      <Button asChild variant="ghost" size="sm" className="mb-4 -ms-2">
        <Link href="/apprendre">
          <HugeiconsIcon icon={ArrowLeft01Icon} data-icon="inline-start" />
          {t.learn.backToLearn}
        </Link>
      </Button>

      {/* Unit header */}
      <div className="flex items-center gap-4 mb-6">
        <div
          className={cn("size-14 rounded-2xl flex items-center justify-center text-2xl font-bold text-white shrink-0", unit.color)}
          style={{ fontFamily: "var(--font-arabic)" }}
        >
          {unit.icon}
        </div>
        <div>
          <h1 className="text-xl font-bold">{unit.title[locale]}</h1>
          <p className="text-sm text-muted-foreground">
            {completedCount} / {unit.lessons.length} {t.learn.lessonsCount.replace("{n} ", "").trim()}
          </p>
        </div>
      </div>

      <p className="text-sm text-muted-foreground mb-6">{unit.description[locale]}</p>

      {/* Lessons list */}
      <div className="flex flex-col gap-3">
        {unit.lessons.map((lesson, i) => {
          const s = stars[i] ?? 0;
          const locked = i > 0 && (stars[i - 1] ?? 0) === 0;
          const count =
            lesson.type === "alphabet" ? lesson.letters.length :
            lesson.type === "vowels"   ? lesson.vowels.length :
            lesson.words.length;

          return (
            <Card
              key={lesson.id}
              className={cn("transition-shadow", locked ? "opacity-60" : "hover:shadow-md cursor-pointer")}
            >
              <CardHeader className="pb-0 flex-row items-center gap-3">
                {/* Lesson number badge */}
                <div
                  className={cn(
                    "size-9 rounded-full flex items-center justify-center text-sm font-bold shrink-0",
                    s === 3 ? "bg-amber-400 text-white" :
                    s > 0  ? "bg-primary/20 text-primary" :
                    locked ? "bg-muted text-muted-foreground" :
                    "bg-primary text-primary-foreground"
                  )}
                >
                  {locked ? (
                    <HugeiconsIcon icon={LockIcon} className="size-4" />
                  ) : (
                    i + 1
                  )}
                </div>

                <div className="flex-1">
                  <p className="font-medium text-sm">{lesson.title[locale]}</p>
                  <p className="text-xs text-muted-foreground">
                    {lesson.type === "alphabet"
                      ? f(t.learn.letterCount, { n: count })
                      : lesson.type === "words"
                      ? f(t.learn.wordCount, { n: count })
                      : f(t.learn.itemCount, { n: count })}
                  </p>
                </div>

                <div className="flex items-center gap-2 shrink-0">
                  {s > 0 && <Stars count={s} />}
                  {s > 0 && (
                    <Badge variant="outline" className="text-xs bg-success/10 text-success border-success/30">
                      {t.learn.completed}
                    </Badge>
                  )}
                </div>
              </CardHeader>

              <Separator className="mt-3" />

              <CardContent className="pt-3 pb-4">
                <div className="flex gap-2">
                  <Button asChild size="sm" variant="default" disabled={locked} className="flex-1">
                    <Link href={locked ? "#" : `/apprendre/${unitId}/${lesson.id}?mode=learn`}>
                      {s > 0 ? t.learn.review : t.learn.start}
                      <HugeiconsIcon icon={ArrowRight01Icon} data-icon="inline-end" />
                    </Link>
                  </Button>
                  {s > 0 && (
                    <Button asChild size="sm" variant="outline" className="flex-1">
                      <Link href={`/apprendre/${unitId}/${lesson.id}?mode=quiz`}>
                        {t.learn.quizTab}
                      </Link>
                    </Button>
                  )}
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>
    </div>
  );
}
