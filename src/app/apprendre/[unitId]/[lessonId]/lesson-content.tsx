"use client";

import { useState, useEffect, useCallback, useMemo, useRef } from "react";
import Link from "next/link";
import { useParams, useSearchParams, useRouter } from "next/navigation";
import { HugeiconsIcon } from "@hugeicons/react";
import {
  ArrowLeft01Icon,
  ArrowRight01Icon,
  StarIcon,
  CheckmarkCircle01Icon,
  Cancel01Icon,
  RepeatIcon,
  PlayIcon,
  PauseIcon,
} from "@hugeicons/core-free-icons";
import { useI18n } from "@/components/i18n-provider";
import { getLesson, type ArabicLetter, type VowelItem, type WordItem } from "@/lib/learn-data";
import { getLessonStars, setLessonStars, scoreToStars, touchStreak, getAudioUrl } from "@/lib/learn-store";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

// ─── Helper: shuffle array ─────────────────────────────────────────────────

function shuffle<T>(arr: T[]): T[] {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

// ─── Stars display ─────────────────────────────────────────────────────────

function Stars({ count, size = "sm" }: { count: number; size?: "sm" | "lg" }) {
  const cls = size === "lg" ? "size-7" : "size-4";
  return (
    <div className="flex gap-1 justify-center">
      {[1, 2, 3].map((i) => (
        <HugeiconsIcon
          key={i}
          icon={StarIcon}
          className={cn(cls, i <= count ? "text-amber-400" : "text-muted-foreground/30")}
        />
      ))}
    </div>
  );
}

// ─── Forms table for a letter ──────────────────────────────────────────────

function LetterFormsTable({ letter, t }: { letter: ArabicLetter; t: { learn: Record<string, string> } }) {
  const forms = [
    { label: t.learn.formIsolated, value: letter.arabic },
    { label: t.learn.formInitial,  value: letter.initial },
    { label: t.learn.formMedial,   value: letter.medial },
    { label: t.learn.formFinal,    value: letter.final },
  ];
  return (
    <div className="grid grid-cols-4 gap-2 text-center">
      {forms.map(({ label, value }) => (
        <div key={label} className="flex flex-col gap-1">
          <div
            className="text-2xl py-2 bg-muted/60 rounded-lg"
            dir="rtl"
            style={{ fontFamily: "var(--font-arabic)" }}
          >
            {value}
          </div>
          <span className="text-[10px] text-muted-foreground">{label}</span>
        </div>
      ))}
    </div>
  );
}

// ─── Audio button ──────────────────────────────────────────────────────────

const SPEEDS = [0.5, 0.75, 1] as const;
type Speed = (typeof SPEEDS)[number];

function AudioButton({
  src,
  title,
}: {
  src: string;
  title: string;
}) {
  const [playing, setPlaying] = useState(false);
  const [speed, setSpeed] = useState<Speed>(1);
  const [unavailable, setUnavailable] = useState(false);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  const stop = useCallback(() => {
    audioRef.current?.pause();
    if (audioRef.current) audioRef.current.currentTime = 0;
    setPlaying(false);
  }, []);

  const play = useCallback(() => {
    if (unavailable) return;
    if (!audioRef.current) {
      const audio = new Audio(src);
      audio.onended = () => setPlaying(false);
      audio.onerror = () => { setUnavailable(true); setPlaying(false); };
      audioRef.current = audio;
    }
    audioRef.current.playbackRate = speed;
    audioRef.current.play().then(() => setPlaying(true)).catch(() => setUnavailable(true));
  }, [src, speed, unavailable]);

  // Sync speed on existing audio element
  useEffect(() => {
    if (audioRef.current) audioRef.current.playbackRate = speed;
  }, [speed]);

  // Destroy audio when src changes
  useEffect(() => {
    stop();
    audioRef.current = null;
    setUnavailable(false);
  }, [src]); // eslint-disable-line react-hooks/exhaustive-deps

  return (
    <div className="flex items-center gap-2">
      <button
        onClick={playing ? stop : play}
        disabled={unavailable}
        title={title}
        className={cn(
          "flex items-center justify-center size-9 rounded-full border-2 transition-all",
          unavailable
            ? "border-muted-foreground/20 text-muted-foreground/30 cursor-not-allowed"
            : playing
            ? "border-primary bg-primary text-primary-foreground"
            : "border-primary/40 text-primary hover:border-primary hover:bg-primary/5"
        )}
      >
        <HugeiconsIcon icon={playing ? PauseIcon : PlayIcon} className="size-4" />
      </button>

      {/* Speed chips */}
      <div className="flex gap-1">
        {SPEEDS.map((s) => (
          <button
            key={s}
            onClick={() => setSpeed(s)}
            className={cn(
              "text-xs px-1.5 py-0.5 rounded-md font-medium transition-colors",
              speed === s
                ? "bg-primary text-primary-foreground"
                : "text-muted-foreground hover:bg-muted"
            )}
          >
            {s}×
          </button>
        ))}
      </div>
    </div>
  );
}

// ─── Learn mode: Words ─────────────────────────────────────────────────────

function LearnWords({
  words,
  onFinish,
  t,
  f,
  locale,
}: {
  words: WordItem[];
  onFinish: () => void;
  t: any;
  f: (s: string, vars: Record<string, string | number>) => string;
  locale: string;
}) {
  const [idx, setIdx] = useState(0);
  const item = words[idx];
  const isLast = idx === words.length - 1;

  return (
    <div className="flex flex-col gap-4">
      {/* Progress */}
      <div className="flex items-center justify-between text-sm text-muted-foreground">
        <span>{f(t.learn.wordOf, { n: idx + 1, total: words.length })}</span>
        <div className="flex gap-1">
          {words.map((_, i) => (
            <div
              key={i}
              className={cn(
                "h-1 rounded-full transition-all",
                i <= idx ? "w-6 bg-primary" : "w-3 bg-muted-foreground/20"
              )}
            />
          ))}
        </div>
      </div>

      <Card>
        <CardContent className="pt-6 pb-4 text-center">
          {/* Arabic word */}
          <div
            className="text-6xl mb-2 leading-snug select-none"
            dir="rtl"
            style={{ fontFamily: "var(--font-arabic)" }}
          >
            {item.arabic}
          </div>

          {/* Transliteration */}
          <p className="text-muted-foreground text-sm font-mono mt-1">{item.transliteration}</p>

          {/* Audio */}
          <div className="flex justify-center mt-3">
            <AudioButton
              src={getAudioUrl(item.audioId || item.id, "words")}
              title={t.learn.audioPlay}
            />
          </div>
        </CardContent>

        <Separator />

        <CardContent className="pt-4 pb-4 text-center">
          <p className="text-xs text-muted-foreground font-medium mb-1">{t.learn.meaning}</p>
          <p className="text-lg font-semibold">
            {item.meaning[locale as "fr" | "en" | "ar" | "ru"]}
          </p>
        </CardContent>
      </Card>

      {/* Navigation */}
      <div className="flex gap-2">
        <Button
          variant="outline"
          size="sm"
          onClick={() => setIdx((i) => Math.max(0, i - 1))}
          disabled={idx === 0}
          className="flex-1"
        >
          <HugeiconsIcon icon={ArrowLeft01Icon} data-icon="inline-start" />
          {t.learn.prevItem}
        </Button>
        {isLast ? (
          <Button size="sm" onClick={onFinish} className="flex-1">
            {t.learn.goToQuiz}
            <HugeiconsIcon icon={ArrowRight01Icon} data-icon="inline-end" />
          </Button>
        ) : (
          <Button size="sm" onClick={() => setIdx((i) => i + 1)} className="flex-1">
            {t.learn.nextItem}
            <HugeiconsIcon icon={ArrowRight01Icon} data-icon="inline-end" />
          </Button>
        )}
      </div>
    </div>
  );
}

// ─── Learn mode: Alphabet ──────────────────────────────────────────────────

function LearnAlphabet({
  letters,
  onFinish,
  t,
  f,
  locale,
}: {
  letters: ArabicLetter[];
  onFinish: () => void;
  t: any;
  f: (s: string, vars: Record<string, string | number>) => string;
  locale: string;
}) {
  const [idx, setIdx] = useState(0);
  const letter = letters[idx];
  const isLast = idx === letters.length - 1;

  return (
    <div className="flex flex-col gap-4">
      {/* Progress */}
      <div className="flex items-center justify-between text-sm text-muted-foreground">
        <span>{f(t.learn.letterOf, { n: idx + 1, total: letters.length })}</span>
        <div className="flex gap-1">
          {letters.map((_, i) => (
            <div
              key={i}
              className={cn(
                "h-1 rounded-full transition-all",
                i < idx ? "w-6 bg-primary" :
                i === idx ? "w-6 bg-primary" :
                "w-3 bg-muted-foreground/20"
              )}
            />
          ))}
        </div>
      </div>

      {/* Main letter card */}
      <Card>
        <CardContent className="pt-6 pb-4 text-center">
          {/* Big letter */}
          <div
            className="text-8xl mb-2 leading-none select-none"
            dir="rtl"
            style={{ fontFamily: "var(--font-arabic)" }}
          >
            {letter.arabic}
          </div>

          {/* Name + translit */}
          <h2 className="text-xl font-bold mt-2">{letter.name[locale as "fr" | "en" | "ar" | "ru"]}</h2>
          <p className="text-muted-foreground text-sm font-mono mt-0.5">[{letter.transliteration}]</p>

          {/* Connection info */}
          <Badge
            variant="outline"
            className={cn(
              "mt-2 text-xs",
              letter.connects
                ? "bg-success/10 text-success border-success/30"
                : "bg-muted text-muted-foreground"
            )}
          >
            {letter.connects ? t.learn.connects : t.learn.doesNotConnect}
          </Badge>

          {/* Audio */}
          <div className="flex justify-center mt-3">
            <AudioButton
              src={getAudioUrl(letter.id, "letters")}
              title={t.learn.audioPlay}
            />
          </div>
        </CardContent>

        <Separator />

        <CardContent className="pt-4 pb-4">
          {/* Contextual forms */}
          <p className="text-xs text-muted-foreground font-medium mb-2">{t.learn.letterForms}</p>
          <LetterFormsTable letter={letter} t={t} />
        </CardContent>

        <Separator />

        <CardContent className="pt-4 pb-4">
          {/* Example */}
          <p className="text-xs text-muted-foreground font-medium mb-2">{t.learn.exampleWord}</p>
          <div className="flex items-baseline justify-center gap-3">
            <span
              className="text-3xl"
              dir="rtl"
              style={{ fontFamily: "var(--font-arabic)" }}
            >
              {letter.example.word}
            </span>
            <span className="text-muted-foreground text-sm font-mono">{letter.example.transliteration}</span>
            <span className="text-sm">— {letter.example.meaning[locale as "fr" | "en" | "ar" | "ru"]}</span>
          </div>
        </CardContent>
      </Card>

      {/* Navigation */}
      <div className="flex gap-2">
        <Button
          variant="outline"
          size="sm"
          onClick={() => setIdx((i) => Math.max(0, i - 1))}
          disabled={idx === 0}
          className="flex-1"
        >
          <HugeiconsIcon icon={ArrowLeft01Icon} data-icon="inline-start" />
          {t.learn.prevItem}
        </Button>
        {isLast ? (
          <Button size="sm" onClick={onFinish} className="flex-1">
            {t.learn.goToQuiz}
            <HugeiconsIcon icon={ArrowRight01Icon} data-icon="inline-end" />
          </Button>
        ) : (
          <Button
            size="sm"
            onClick={() => setIdx((i) => Math.min(letters.length - 1, i + 1))}
            className="flex-1"
          >
            {t.learn.nextItem}
            <HugeiconsIcon icon={ArrowRight01Icon} data-icon="inline-end" />
          </Button>
        )}
      </div>
    </div>
  );
}

// ─── Learn mode: Vowels ────────────────────────────────────────────────────

function LearnVowels({
  vowels,
  onFinish,
  t,
  f,
  locale,
}: {
  vowels: VowelItem[];
  onFinish: () => void;
  t: any;
  f: (s: string, vars: Record<string, string | number>) => string;
  locale: string;
}) {
  const [idx, setIdx] = useState(0);
  const item = vowels[idx];
  const isLast = idx === vowels.length - 1;

  return (
    <div className="flex flex-col gap-4">
      {/* Progress */}
      <div className="flex items-center justify-between text-sm text-muted-foreground">
        <span>{f(t.learn.itemOf, { n: idx + 1, total: vowels.length })}</span>
        <div className="flex gap-1">
          {vowels.map((_, i) => (
            <div
              key={i}
              className={cn(
                "h-1 rounded-full transition-all",
                i <= idx ? "w-6 bg-primary" : "w-3 bg-muted-foreground/20"
              )}
            />
          ))}
        </div>
      </div>

      <Card>
        <CardContent className="pt-6 pb-4 text-center">
          {/* Big display */}
          <div
            className="text-8xl mb-2 leading-none select-none"
            dir="rtl"
            style={{ fontFamily: "var(--font-arabic)" }}
          >
            {item.display}
          </div>
          <h2 className="text-xl font-bold mt-2">{item.name[locale as "fr" | "en" | "ar" | "ru"]}</h2>
          <p className="text-muted-foreground text-sm font-mono mt-0.5">/{item.sound}/</p>
        </CardContent>

        <Separator />

        <CardContent className="pt-4 pb-4">
          <p className="text-xs text-muted-foreground font-medium mb-2">{t.learn.description}</p>
          <p className="text-sm">{item.description[locale as "fr" | "en" | "ar" | "ru"]}</p>
        </CardContent>

        <Separator />

        <CardContent className="pt-4 pb-4">
          <p className="text-xs text-muted-foreground font-medium mb-2">{t.learn.exampleWord}</p>
          <div className="flex items-baseline justify-center gap-3 flex-wrap">
            <span
              className="text-3xl"
              dir="rtl"
              style={{ fontFamily: "var(--font-arabic)" }}
            >
              {item.example.word}
            </span>
            <span className="text-muted-foreground text-sm font-mono">{item.example.transliteration}</span>
            <span className="text-sm">— {item.example.meaning[locale as "fr" | "en" | "ar" | "ru"]}</span>
          </div>
        </CardContent>
      </Card>

      {/* Navigation */}
      <div className="flex gap-2">
        <Button
          variant="outline"
          size="sm"
          onClick={() => setIdx((i) => Math.max(0, i - 1))}
          disabled={idx === 0}
          className="flex-1"
        >
          <HugeiconsIcon icon={ArrowLeft01Icon} data-icon="inline-start" />
          {t.learn.prevItem}
        </Button>
        {isLast ? (
          <Button size="sm" onClick={onFinish} className="flex-1">
            {t.learn.goToQuiz}
            <HugeiconsIcon icon={ArrowRight01Icon} data-icon="inline-end" />
          </Button>
        ) : (
          <Button size="sm" onClick={() => setIdx((i) => i + 1)} className="flex-1">
            {t.learn.nextItem}
            <HugeiconsIcon icon={ArrowRight01Icon} data-icon="inline-end" />
          </Button>
        )}
      </div>
    </div>
  );
}

// ─── Quiz question type ─────────────────────────────────────────────────────

interface QuizQuestion {
  display: string;       // The letter/vowel to identify
  correct: string;       // Correct answer (name in locale)
  choices: string[];     // All 4 choices (shuffled)
}

function buildAlphabetQuiz(letters: ArabicLetter[], locale: string): QuizQuestion[] {
  return shuffle(letters).map((letter) => {
    const wrong = shuffle(
      letters.filter((l) => l.id !== letter.id).map((l) => l.name[locale as "fr" | "en" | "ar" | "ru"])
    ).slice(0, 3);
    const correct = letter.name[locale as "fr" | "en" | "ar" | "ru"];
    return {
      display: letter.arabic,
      correct,
      choices: shuffle([correct, ...wrong]),
    };
  });
}

function buildVowelQuiz(vowels: VowelItem[], locale: string): QuizQuestion[] {
  return shuffle(vowels).map((vowel) => {
    const wrong = shuffle(
      vowels.filter((v) => v.id !== vowel.id).map((v) => v.name[locale as "fr" | "en" | "ar" | "ru"])
    ).slice(0, Math.min(3, vowels.length - 1));
    const correct = vowel.name[locale as "fr" | "en" | "ar" | "ru"];
    // Pad with dummy if too few vowels
    while (wrong.length < 3) wrong.push("—");
    return {
      display: vowel.display,
      correct,
      choices: shuffle([correct, ...wrong]),
    };
  });
}

function buildWordQuiz(words: WordItem[], locale: string): QuizQuestion[] {
  return shuffle(words).map((word) => {
    const wrong = shuffle(
      words
        .filter((w) => w.id !== word.id)
        .map((w) => w.meaning[locale as "fr" | "en" | "ar" | "ru"])
    ).slice(0, Math.min(3, words.length - 1));
    const correct = word.meaning[locale as "fr" | "en" | "ar" | "ru"];
    while (wrong.length < 3) wrong.push("—");
    return {
      display: word.arabic,
      correct,
      choices: shuffle([correct, ...wrong]),
    };
  });
}

// ─── Quiz mode ─────────────────────────────────────────────────────────────

function QuizMode({
  questions,
  onDone,
  t,
  f,
  lessonType,
}: {
  questions: QuizQuestion[];
  onDone: (correct: number) => void;
  t: any;
  f: (s: string, vars: Record<string, string | number>) => string;
  lessonType: "alphabet" | "vowels" | "words";
}) {
  const [idx, setIdx] = useState(0);
  const [selected, setSelected] = useState<string | null>(null);
  const [score, setScore] = useState(0);
  const q = questions[idx];
  const answered = selected !== null;
  const isCorrect = selected === q.correct;

  function pick(choice: string) {
    if (answered) return;
    setSelected(choice);
    if (choice === q.correct) setScore((s) => s + 1);
  }

  function next() {
    if (idx === questions.length - 1) {
      onDone(isCorrect ? score + 1 : score);
    } else {
      setSelected(null);
      setIdx((i) => i + 1);
    }
  }

  return (
    <div className="flex flex-col gap-4">
      {/* Progress */}
      <div className="flex items-center justify-between text-sm text-muted-foreground">
        <span>{f(t.learn.letterOf, { n: idx + 1, total: questions.length })}</span>
        <div className="h-1.5 rounded-full bg-muted flex-1 mx-4 overflow-hidden">
          <div
            className="h-full rounded-full bg-primary transition-all"
            style={{ width: `${((idx) / questions.length) * 100}%` }}
          />
        </div>
        <span className="font-medium">{score}/{idx + (answered ? 1 : 0)}</span>
      </div>

      {/* Question */}
      <Card>
        <CardContent className="pt-6 pb-4 text-center">
          <p className="text-xs text-muted-foreground mb-3">
            {lessonType === "vowels" ? t.learn.quizQuestionVowel :
             lessonType === "words"  ? t.learn.quizQuestionWord :
             t.learn.quizQuestion}
          </p>
          <div
            className="text-8xl leading-none select-none mb-4"
            dir="rtl"
            style={{ fontFamily: "var(--font-arabic)" }}
          >
            {q.display}
          </div>

          {/* Feedback */}
          {answered && (
            <div
              className={cn(
                "flex items-center justify-center gap-1.5 text-sm font-medium mt-2 mb-2",
                isCorrect ? "text-success" : "text-destructive"
              )}
            >
              <HugeiconsIcon
                icon={isCorrect ? CheckmarkCircle01Icon : Cancel01Icon}
                className="size-4"
              />
              {isCorrect ? t.learn.quizCorrect : `${t.learn.quizWrong}${q.correct}`}
            </div>
          )}
        </CardContent>

        <Separator />

        {/* Choices */}
        <CardContent className="pt-4 pb-4">
          <div className="grid grid-cols-2 gap-2">
            {q.choices.map((choice) => {
              const isSelected = selected === choice;
              const isRight = choice === q.correct;
              return (
                <button
                  key={choice}
                  onClick={() => pick(choice)}
                  disabled={answered}
                  className={cn(
                    "py-3 px-4 rounded-xl border-2 text-sm font-medium transition-all text-start",
                    !answered && "hover:bg-muted cursor-pointer",
                    !answered && "border-border",
                    answered && isRight  && "border-success bg-success/10 text-success",
                    answered && isSelected && !isRight && "border-destructive bg-destructive/10 text-destructive",
                    answered && !isSelected && !isRight && "border-border/50 text-muted-foreground opacity-60",
                  )}
                >
                  {choice}
                </button>
              );
            })}
          </div>
        </CardContent>
      </Card>

      {answered && (
        <Button onClick={next} size="sm">
          {idx === questions.length - 1 ? t.learn.quizFinish : t.learn.quizNext}
          <HugeiconsIcon icon={ArrowRight01Icon} data-icon="inline-end" />
        </Button>
      )}
    </div>
  );
}

// ─── Results screen ─────────────────────────────────────────────────────────

function ResultsScreen({
  correct,
  total,
  stars,
  prevStars,
  unitId,
  lessonId,
  onRetry,
  t,
  f,
}: {
  correct: number;
  total: number;
  stars: number;
  prevStars: number;
  unitId: string;
  lessonId: string;
  onRetry: () => void;
  t: any;
  f: (s: string, vars: Record<string, string | number>) => string;
}) {
  const improved = stars > prevStars;

  return (
    <div className="flex flex-col items-center gap-6 py-4">
      <div className="text-center">
        <h2 className="text-2xl font-bold mb-1">{t.learn.lessonDone}</h2>
        <p className="text-muted-foreground">
          {f(t.learn.quizResult, { correct, total })}
        </p>
      </div>

      <div className="flex flex-col items-center gap-2">
        <Stars count={stars} size="lg" />
        <p className="text-sm text-muted-foreground">
          {f(t.learn.quizStars, { n: stars })}
          {improved && prevStars > 0 && (
            <span className="ms-2 text-success font-medium">↑</span>
          )}
        </p>
      </div>

      {/* Score bar */}
      <div className="w-full max-w-xs">
        <div className="flex justify-between text-xs text-muted-foreground mb-1">
          <span>0</span>
          <span>{total}</span>
        </div>
        <div className="h-3 rounded-full bg-muted overflow-hidden">
          <div
            className={cn(
              "h-full rounded-full transition-all",
              stars === 3 ? "bg-amber-400" :
              stars === 2 ? "bg-primary" :
              stars === 1 ? "bg-warning" :
              "bg-destructive"
            )}
            style={{ width: `${(correct / total) * 100}%` }}
          />
        </div>
      </div>

      <div className="flex flex-col gap-2 w-full max-w-xs">
        <Button onClick={onRetry} variant="outline" size="sm">
          <HugeiconsIcon icon={RepeatIcon} data-icon="inline-start" />
          {t.learn.quizRetry}
        </Button>
        <Button asChild size="sm">
          <Link href={`/apprendre/${unitId}`}>
            {t.learn.backToUnit}
            <HugeiconsIcon icon={ArrowRight01Icon} data-icon="inline-end" />
          </Link>
        </Button>
      </div>
    </div>
  );
}

// ─── Main lesson component ──────────────────────────────────────────────────

export default function LessonContent() {
  const { unitId, lessonId } = useParams<{ unitId: string; lessonId: string }>();
  const searchParams = useSearchParams();
  const router = useRouter();
  const { t, f, locale } = useI18n();

  const lesson = getLesson(unitId, lessonId);

  const initialMode = (searchParams.get("mode") as "learn" | "quiz") || "learn";
  const [mode, setMode] = useState<"learn" | "quiz" | "results">(initialMode);
  const [quizCorrect, setQuizCorrect] = useState(0);
  const [prevStars, setPrevStars] = useState(0);
  const [earnedStars, setEarnedStars] = useState(0);
  const [quizKey, setQuizKey] = useState(0); // reset quiz on retry

  useEffect(() => {
    setPrevStars(getLessonStars(unitId, lessonId));
  }, [unitId, lessonId]);

  const questions = useMemo(() => {
    if (!lesson) return [];
    if (lesson.type === "alphabet") return buildAlphabetQuiz(lesson.letters, locale);
    if (lesson.type === "vowels")   return buildVowelQuiz(lesson.vowels, locale);
    return buildWordQuiz(lesson.words, locale);
  }, [lesson, locale, quizKey]); // eslint-disable-line react-hooks/exhaustive-deps

  const handleLearnDone = useCallback(() => setMode("quiz"), []);

  const handleQuizDone = useCallback(
    (correct: number) => {
      const total = questions.length;
      const stars = scoreToStars(correct, total);
      setLessonStars(unitId, lessonId, stars);
      touchStreak();
      setQuizCorrect(correct);
      setEarnedStars(stars);
      setMode("results");
    },
    [questions.length, unitId, lessonId]
  );

  const handleRetry = useCallback(() => {
    setQuizKey((k) => k + 1);
    setMode("quiz");
  }, []);

  if (!lesson) {
    return (
      <div className="max-w-2xl mx-auto px-4 py-8 text-center text-muted-foreground">
        Leçon introuvable.
      </div>
    );
  }

  const itemCount =
    lesson.type === "alphabet" ? lesson.letters.length :
    lesson.type === "vowels"   ? lesson.vowels.length :
    lesson.words.length;

  return (
    <div className="max-w-2xl mx-auto px-4 py-6">
      {/* Back + header */}
      <div className="mb-4">
        <Button asChild variant="ghost" size="sm" className="-ms-2 mb-3">
          <Link href={`/apprendre/${unitId}`}>
            <HugeiconsIcon icon={ArrowLeft01Icon} data-icon="inline-start" />
            {t.learn.backToUnit}
          </Link>
        </Button>

        <div className="flex items-center justify-between gap-3">
          <div>
            <h1 className="text-lg font-bold">{lesson.title[locale as "fr" | "en" | "ar" | "ru"]}</h1>
            <p className="text-xs text-muted-foreground">
              {lesson.type === "alphabet"
                ? f(t.learn.letterCount, { n: itemCount })
                : lesson.type === "words"
                ? f(t.learn.wordCount, { n: itemCount })
                : f(t.learn.itemCount, { n: itemCount })}
            </p>
          </div>

          {/* Best score */}
          {prevStars > 0 && (
            <div className="flex items-center gap-1 shrink-0">
              <span className="text-xs text-muted-foreground">{t.learn.bestScore}</span>
              <Stars count={prevStars} />
            </div>
          )}
        </div>
      </div>

      {/* Mode tabs (only visible in learn/quiz mode, not results) */}
      {mode !== "results" && (
        <div className="flex gap-1 p-1 bg-muted rounded-lg mb-4">
          {(["learn", "quiz"] as const).map((m) => (
            <button
              key={m}
              onClick={() => setMode(m)}
              className={cn(
                "flex-1 py-1.5 text-sm font-medium rounded-md transition-all",
                mode === m ? "bg-background shadow text-foreground" : "text-muted-foreground hover:text-foreground"
              )}
            >
              {m === "learn" ? t.learn.learnTab : t.learn.quizTab}
            </button>
          ))}
        </div>
      )}

      {/* Content */}
      {mode === "learn" && lesson.type === "alphabet" && (
        <LearnAlphabet letters={lesson.letters} onFinish={handleLearnDone} t={t} f={f} locale={locale} />
      )}
      {mode === "learn" && lesson.type === "vowels" && (
        <LearnVowels vowels={lesson.vowels} onFinish={handleLearnDone} t={t} f={f} locale={locale} />
      )}
      {mode === "learn" && lesson.type === "words" && (
        <LearnWords words={lesson.words} onFinish={handleLearnDone} t={t} f={f} locale={locale} />
      )}
      {mode === "quiz" && (
        <QuizMode
          key={quizKey}
          questions={questions}
          onDone={handleQuizDone}
          t={t}
          f={f}
          lessonType={lesson.type}
        />
      )}
      {mode === "results" && (
        <ResultsScreen
          correct={quizCorrect}
          total={questions.length}
          stars={earnedStars}
          prevStars={prevStars}
          unitId={unitId}
          lessonId={lessonId}
          onRetry={handleRetry}
          t={t}
          f={f}
        />
      )}
    </div>
  );
}
