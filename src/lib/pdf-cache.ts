"use client";

/**
 * Cache hors-ligne des PDFs dans IndexedDB.
 *
 * Pourquoi IndexedDB plutôt que localStorage : les blobs PDF font plusieurs Mo,
 * ce qui dépasse la limite ~5 Mo de localStorage. IndexedDB autorise des centaines
 * de Mo, supporte les ArrayBuffer/Blob nativement et est asynchrone (non bloquant).
 */

const DB_NAME = "ql-pdf-cache";
const DB_VERSION = 1;
const STORE = "pdfs";

export interface CachedPdfMeta {
  docId: string;
  filename: string;
  size: number;        // octets
  cachedAt: number;    // timestamp ms
  lastUsedAt: number;  // timestamp ms (pour éviction LRU future)
}

interface CachedPdfRow extends CachedPdfMeta {
  data: ArrayBuffer;
}

function isSupported(): boolean {
  return typeof window !== "undefined" && "indexedDB" in window;
}

function openDb(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    const req = indexedDB.open(DB_NAME, DB_VERSION);
    req.onupgradeneeded = () => {
      const db = req.result;
      if (!db.objectStoreNames.contains(STORE)) {
        db.createObjectStore(STORE, { keyPath: "docId" });
      }
    };
    req.onsuccess = () => resolve(req.result);
    req.onerror = () => reject(req.error);
  });
}

async function withStore<T>(
  mode: IDBTransactionMode,
  fn: (store: IDBObjectStore) => IDBRequest<T> | Promise<T>,
): Promise<T> {
  const db = await openDb();
  return new Promise<T>((resolve, reject) => {
    const tx = db.transaction(STORE, mode);
    const store = tx.objectStore(STORE);
    let result: T | undefined;
    Promise.resolve(fn(store))
      .then((r) => {
        if (r instanceof IDBRequest) {
          r.onsuccess = () => { result = r.result as T; };
          r.onerror = () => reject(r.error);
        } else {
          result = r as T;
        }
      })
      .catch(reject);
    tx.oncomplete = () => { resolve(result as T); db.close(); };
    tx.onerror = () => { reject(tx.error); db.close(); };
    tx.onabort = () => { reject(tx.error); db.close(); };
  });
}

/** Récupère le PDF caché et touche `lastUsedAt`. Retourne null si absent. */
export async function getCachedPdf(docId: string): Promise<ArrayBuffer | null> {
  if (!isSupported()) return null;
  try {
    const db = await openDb();
    return await new Promise<ArrayBuffer | null>((resolve) => {
      const tx = db.transaction(STORE, "readwrite");
      const store = tx.objectStore(STORE);
      const req = store.get(docId);
      req.onsuccess = () => {
        const row = req.result as CachedPdfRow | undefined;
        if (!row) {
          db.close();
          resolve(null);
          return;
        }
        // touch lastUsedAt
        store.put({ ...row, lastUsedAt: Date.now() });
        tx.oncomplete = () => { db.close(); resolve(row.data); };
      };
      req.onerror = () => { db.close(); resolve(null); };
    });
  } catch {
    return null;
  }
}

/** Stocke un PDF en cache. */
export async function setCachedPdf(
  docId: string,
  filename: string,
  data: ArrayBuffer,
): Promise<void> {
  if (!isSupported()) return;
  try {
    const row: CachedPdfRow = {
      docId,
      filename,
      data,
      size: data.byteLength,
      cachedAt: Date.now(),
      lastUsedAt: Date.now(),
    };
    await withStore("readwrite", (store) => store.put(row));
    window.dispatchEvent(new CustomEvent("ql-pdf-cache-change"));
  } catch (err) {
    console.warn("[pdf-cache] setCachedPdf failed", err);
  }
}

/** Indique si un PDF est en cache (sans charger les données). */
export async function hasCachedPdf(docId: string): Promise<boolean> {
  if (!isSupported()) return false;
  try {
    const meta = await getCachedMeta(docId);
    return meta !== null;
  } catch {
    return false;
  }
}

/** Métadonnées seules (sans le blob), pour les listings et UI. */
export async function getCachedMeta(docId: string): Promise<CachedPdfMeta | null> {
  if (!isSupported()) return null;
  try {
    const db = await openDb();
    return await new Promise<CachedPdfMeta | null>((resolve) => {
      const tx = db.transaction(STORE, "readonly");
      const req = tx.objectStore(STORE).get(docId);
      req.onsuccess = () => {
        const row = req.result as CachedPdfRow | undefined;
        if (!row) { db.close(); resolve(null); return; }
        const { data: _data, ...meta } = row;
        void _data;
        tx.oncomplete = () => { db.close(); resolve(meta); };
      };
      req.onerror = () => { db.close(); resolve(null); };
    });
  } catch {
    return null;
  }
}

/** Liste toutes les métadonnées (pour la page settings). */
export async function listCachedPdfs(): Promise<CachedPdfMeta[]> {
  if (!isSupported()) return [];
  try {
    const db = await openDb();
    return await new Promise<CachedPdfMeta[]>((resolve) => {
      const tx = db.transaction(STORE, "readonly");
      const req = tx.objectStore(STORE).openCursor();
      const out: CachedPdfMeta[] = [];
      req.onsuccess = () => {
        const cursor = req.result;
        if (cursor) {
          const row = cursor.value as CachedPdfRow;
          const { data: _d, ...meta } = row;
          void _d;
          out.push(meta);
          cursor.continue();
        }
      };
      tx.oncomplete = () => { db.close(); resolve(out); };
      tx.onerror = () => { db.close(); resolve([]); };
    });
  } catch {
    return [];
  }
}

/** Supprime un PDF du cache. */
export async function deleteCachedPdf(docId: string): Promise<void> {
  if (!isSupported()) return;
  try {
    await withStore("readwrite", (store) => store.delete(docId));
    window.dispatchEvent(new CustomEvent("ql-pdf-cache-change"));
  } catch {
    /* ignore */
  }
}

/** Vide tout le cache PDF. */
export async function clearPdfCache(): Promise<void> {
  if (!isSupported()) return;
  try {
    await withStore("readwrite", (store) => store.clear());
    window.dispatchEvent(new CustomEvent("ql-pdf-cache-change"));
  } catch {
    /* ignore */
  }
}

/** Téléchargement complet d'un PDF avec progression, retourne l'ArrayBuffer. */
export async function downloadPdf(
  url: string,
  onProgress?: (loaded: number, total: number) => void,
  signal?: AbortSignal,
): Promise<ArrayBuffer> {
  const res = await fetch(url, { signal });
  if (!res.ok) throw new Error(`HTTP ${res.status}`);
  const total = Number(res.headers.get("content-length")) || 0;
  if (!res.body || !onProgress || total === 0) {
    return await res.arrayBuffer();
  }
  const reader = res.body.getReader();
  const chunks: Uint8Array[] = [];
  let loaded = 0;
  while (true) {
    const { done, value } = await reader.read();
    if (done) break;
    if (value) {
      chunks.push(value);
      loaded += value.byteLength;
      onProgress(loaded, total);
    }
  }
  const out = new Uint8Array(loaded);
  let offset = 0;
  for (const c of chunks) { out.set(c, offset); offset += c.byteLength; }
  return out.buffer;
}
