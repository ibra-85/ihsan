"use client";

// ─── Bookmarks ─────────────────────────────────────────────
export interface Bookmark {
  docId: string;
  page: number;
  label: string;
  createdAt: number;
}

export function getBookmarks(): Bookmark[] {
  if (typeof window === "undefined") return [];
  try {
    return JSON.parse(localStorage.getItem("ql-bookmarks") || "[]");
  } catch {
    return [];
  }
}

export function addBookmark(bookmark: Bookmark): void {
  const bookmarks = getBookmarks();
  const exists = bookmarks.find(
    (b) => b.docId === bookmark.docId && b.page === bookmark.page
  );
  if (!exists) {
    localStorage.setItem("ql-bookmarks", JSON.stringify([...bookmarks, bookmark]));
  }
}

export function removeBookmark(docId: string, page: number): void {
  const bookmarks = getBookmarks().filter(
    (b) => !(b.docId === docId && b.page === page)
  );
  localStorage.setItem("ql-bookmarks", JSON.stringify(bookmarks));
}

export function isBookmarked(docId: string, page: number): boolean {
  return getBookmarks().some((b) => b.docId === docId && b.page === page);
}

// ─── Notes ─────────────────────────────────────────────────
export interface Note {
  id: string;
  docId: string;
  page: number;
  content: string;
  createdAt: number;
  updatedAt: number;
}

export function getNotes(docId?: string): Note[] {
  if (typeof window === "undefined") return [];
  try {
    const all: Note[] = JSON.parse(localStorage.getItem("ql-notes") || "[]");
    return docId ? all.filter((n) => n.docId === docId) : all;
  } catch {
    return [];
  }
}

export function saveNote(note: Note): void {
  const notes = getNotes();
  const idx = notes.findIndex((n) => n.id === note.id);
  if (idx >= 0) {
    notes[idx] = note;
  } else {
    notes.push(note);
  }
  localStorage.setItem("ql-notes", JSON.stringify(notes));
}

export function deleteNote(id: string): void {
  const notes = getNotes().filter((n) => n.id !== id);
  localStorage.setItem("ql-notes", JSON.stringify(notes));
}

// ─── Reading progress ──────────────────────────────────────
export function getLastPage(docId: string): number {
  if (typeof window === "undefined") return 1;
  return parseInt(localStorage.getItem(`ql-progress-${docId}`) || "1", 10);
}

export function setLastPage(docId: string, page: number): void {
  localStorage.setItem(`ql-progress-${docId}`, String(page));
}

// ─── Zoom par document ────────────────────────────────────
// On mémorise le scale de chaque PDF séparément (clé `ql-zoom-{docId}`)
// pour qu'à la réouverture, le lecteur retrouve le zoom où l'utilisateur
// l'avait laissé. Validation borne le résultat dans [0.25, 5] — la plage
// supportée par ZOOM_STEPS — au cas où une valeur invalide aurait été
// écrite (ancienne version, import corrompu, manipulation manuelle).
export function getZoom(docId: string): number | null {
  if (typeof window === "undefined") return null;
  const raw = localStorage.getItem(`ql-zoom-${docId}`);
  if (raw === null) return null;
  const n = parseFloat(raw);
  if (!Number.isFinite(n) || n < 0.25 || n > 5) return null;
  return n;
}

export function setZoom(docId: string, scale: number): void {
  if (typeof window === "undefined") return;
  if (!Number.isFinite(scale) || scale < 0.25 || scale > 5) return;
  localStorage.setItem(`ql-zoom-${docId}`, String(scale));
}

// ─── Reading time ──────────────────────────────────────────
export function getReadingTime(docId: string): number {
  if (typeof window === "undefined") return 0;
  return parseInt(localStorage.getItem(`ql-time-${docId}`) || "0", 10);
}

export function addReadingTime(docId: string, seconds: number): void {
  const current = getReadingTime(docId);
  localStorage.setItem(`ql-time-${docId}`, String(current + seconds));
}

export function formatReadingTime(seconds: number): string {
  if (seconds < 60) return `${seconds}s`;
  const m = Math.floor(seconds / 60);
  if (m < 60) return `${m} min`;
  const h = Math.floor(m / 60);
  const rem = m % 60;
  return rem > 0 ? `${h}h ${rem}min` : `${h}h`;
}

// ─── Export notes ──────────────────────────────────────────
export function exportNotesAsTxt(docId?: string): void {
  const notes = getNotes(docId);
  if (notes.length === 0) return;
  const lines = notes
    .sort((a, b) => a.page - b.page)
    .map(
      (n) =>
        `── Page ${n.page} · ${new Date(n.createdAt).toLocaleDateString("fr-FR")} ──\n${n.content}`,
    )
    .join("\n\n");
  const blob = new Blob([lines], { type: "text/plain;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = docId ? `notes-${docId}.txt` : "notes-ihsan.txt";
  a.click();
  URL.revokeObjectURL(url);
}

// ─── Settings ─────────────────────────────────────────────
export interface AppSettings {
  accent: "green" | "blue" | "purple" | "amber" | "rose";
}

export function getSettings(): AppSettings {
  if (typeof window === "undefined") return { accent: "green" };
  try {
    return JSON.parse(localStorage.getItem("ql-settings") || '{"accent":"green"}');
  } catch {
    return { accent: "green" };
  }
}

export function saveSettings(settings: Partial<AppSettings>): void {
  const current = getSettings();
  localStorage.setItem("ql-settings", JSON.stringify({ ...current, ...settings }));
}

// ─── Export / Import des données ───────────────────────────
// Permet de transférer ses marque-pages, notes, progression, dessins,
// préférences vers un autre navigateur ou appareil via un fichier .json.

const BACKUP_APP = "ihsan";
const BACKUP_VERSION = 1;

/** Télécharge toutes les données locales (clés `ql-*`) en fichier JSON. */
export function exportAllData(): number {
  if (typeof window === "undefined") return 0;
  const data: Record<string, string> = {};
  for (const k of Object.keys(localStorage)) {
    if (!k.startsWith("ql-")) continue;
    const v = localStorage.getItem(k);
    if (v !== null) data[k] = v;
  }
  const payload = {
    app: BACKUP_APP,
    version: BACKUP_VERSION,
    exportedAt: new Date().toISOString(),
    data,
  };
  const blob = new Blob([JSON.stringify(payload, null, 2)], { type: "application/json" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = `ihsan-sauvegarde-${new Date().toISOString().slice(0, 10)}.json`;
  document.body.appendChild(a);
  a.click();
  a.remove();
  URL.revokeObjectURL(url);
  return Object.keys(data).length;
}

/** Restaure les données depuis un fichier de sauvegarde JSON. */
export async function importAllData(file: File): Promise<number> {
  const text = await file.text();
  let parsed: unknown;
  try {
    parsed = JSON.parse(text);
  } catch {
    throw new Error("Fichier illisible — ce n'est pas un JSON valide.");
  }
  const obj = parsed as { app?: string; data?: Record<string, unknown> };
  if (!obj || obj.app !== BACKUP_APP || typeof obj.data !== "object" || obj.data === null) {
    throw new Error("Ce fichier n'est pas une sauvegarde Ihsan valide.");
  }
  let imported = 0;
  for (const [k, v] of Object.entries(obj.data)) {
    if (k.startsWith("ql-") && typeof v === "string") {
      localStorage.setItem(k, v);
      imported++;
    }
  }
  if (imported === 0) throw new Error("Aucune donnée à importer dans ce fichier.");
  return imported;
}
