import { notFound } from "next/navigation";
import { getDocument } from "@/lib/documents";
import { PdfReaderClient } from "@/components/reader/pdf-reader-client";

interface Props {
  params: Promise<{ id: string }>;
}

export default async function ReaderPage({ params }: Props) {
  const { id } = await params;
  const doc = getDocument(id);
  if (!doc) notFound();
  return <PdfReaderClient doc={doc} />;
}
