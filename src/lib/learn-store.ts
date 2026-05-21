"use client";

// ─── Stars per lesson ──────────────────────────────────────────────────────
// Stored as: ql-learn-stars-{unitId}-{lessonId} → number (0–3)

export function getLessonStars(unitId: string, lessonId: string): number {
  if (typeof window === "undefined") return 0;
  return parseInt(localStorage.getItem(`ql-learn-stars-${unitId}-${lessonId}`) || "0", 10);
}

export function setLessonStars(unitId: string, lessonId: string, stars: number): void {
  const current = getLessonStars(unitId, lessonId);
  if (stars > current) {
    localStorage.setItem(`ql-learn-stars-${unitId}-${lessonId}`, String(Math.min(3, stars)));
  }
}

// ─── Streak ────────────────────────────────────────────────────────────────
// Stored as: ql-learn-streak → { lastDate: "YYYY-MM-DD", count: number }

interface Streak {
  lastDate: string;
  count: number;
}

function todayStr(): string {
  return new Date().toISOString().slice(0, 10);
}

export function getStreak(): Streak {
  if (typeof window === "undefined") return { lastDate: "", count: 0 };
  try {
    return JSON.parse(localStorage.getItem("ql-learn-streak") || '{"lastDate":"","count":0}');
  } catch {
    return { lastDate: "", count: 0 };
  }
}

export function touchStreak(): void {
  if (typeof window === "undefined") return;
  const today = todayStr();
  const streak = getStreak();
  if (streak.lastDate === today) return;

  const yesterday = new Date();
  yesterday.setDate(yesterday.getDate() - 1);
  const yesterdayStr = yesterday.toISOString().slice(0, 10);

  const newCount = streak.lastDate === yesterdayStr ? streak.count + 1 : 1;
  localStorage.setItem("ql-learn-streak", JSON.stringify({ lastDate: today, count: newCount }));
}

// ─── Unit progress ─────────────────────────────────────────────────────────
// Computed from individual lesson stars

export function getUnitProgress(unitId: string, lessonIds: string[]): number {
  if (typeof window === "undefined") return 0;
  const completed = lessonIds.filter((id) => getLessonStars(unitId, id) > 0).length;
  return lessonIds.length === 0 ? 0 : Math.round((completed / lessonIds.length) * 100);
}

// ─── Audio URL ─────────────────────────────────────────────────────────────
// Audio files hosted on CDN under /audio/letters/{id}.mp3 and /audio/words/{id}.mp3
// Files don't need to exist — AudioButton handles errors gracefully.

export function getAudioUrl(itemId: string, type: "letters" | "words" = "letters"): string {
  const base = "https://cdn.ihsan-coran.fr";
  return `${base}/audio/${type}/${itemId}.mp3`;
}

// ─── Score → stars ──────────────────────────────────────────────────────────

export function scoreToStars(correct: number, total: number): number {
  if (total === 0) return 0;
  const pct = correct / total;
  if (pct >= 1.0)  return 3;
  if (pct >= 0.8)  return 2;
  if (pct >= 0.6)  return 1;
  return 0;
}
