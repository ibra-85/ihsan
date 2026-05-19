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
