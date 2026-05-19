"use client";

import dynamic from "next/dynamic";
import type { Document as DocType } from "@/lib/documents";

/* react-pdf utilise DOMMatrix/canvas — uniquement côté client */
const PdfReader = dynamic(
  () => import("./pdf-reader").then(m => m.PdfReader),
  {
    ssr: false,
    loading: () => (
      <div className="flex h-dvh items-center justify-center bg-background">
        <div className="flex flex-col items-center gap-3">
          <div className="size-8 rounded-full border-2 border-primary border-t-transparent animate-spin" />
          <p className="text-sm text-muted-foreground">Chargement du lecteur...</p>
        </div>
      </div>
    ),
  }
);

export function PdfReaderClient({ doc }: { doc: DocType }) {
  return <PdfReader doc={doc} />;
}
