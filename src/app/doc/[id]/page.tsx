import { notFound } from "next/navigation";
import Link from "next/link";
import { DOCUMENTS, getDocument, CATEGORIES } from "@/lib/documents";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { DocActions } from "./doc-actions";

interface Props {
  params: Promise<{ id: string }>;
}

const LANG_LABEL: Record<string, string> = {
  ar: "Arabe",
  fr: "Français",
  ru: "Russe",
  ce: "Tchétchène",
  "ar-fr": "Arabe / Français",
  "ar-ru": "Arabe / Russe",
  "ar-ce": "Arabe / Tchétchène",
};

const LEVEL_CLASS: Record<string, string> = {
  "débutant":      "bg-success/15 text-success border-success/30",
  "intermédiaire": "bg-warning/15 text-warning border-warning/30",
  "avancé":        "bg-destructive/15 text-destructive border-destructive/30",
};

export default async function DocDetailPage({ params }: Props) {
  const { id } = await params;
  const doc = getDocument(id);
  if (!doc) notFound();

  const category = CATEGORIES.find(c => c.id === doc.category);
  const levelClass = doc.level ? LEVEL_CLASS[doc.level] ?? "" : "";

  // Documents similaires : même catégorie OU même langue, hors doc actuel, max 3
  const similar = DOCUMENTS
    .filter(d => d.id !== doc.id)
    .map(d => ({
      doc: d,
      score: (d.category === doc.category ? 2 : 0) + (d.language === doc.language ? 1 : 0),
    }))
    .filter(s => s.score > 0)
    .sort((a, b) => b.score - a.score)
    .slice(0, 3)
    .map(s => s.doc);

  return (
    <div className="max-w-3xl mx-auto px-4 py-8">

      {/* Retour */}
      <Link
        href="/"
        className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors mb-6"
      >
        ← Retour à la bibliothèque
      </Link>

      {/* Hero card */}
      <Card className="p-6 mb-6 overflow-hidden relative">
        {/* Decoration */}
        <div className="absolute top-0 right-0 w-32 h-32 bg-primary/5 rounded-full -translate-y-1/2 translate-x-1/2 blur-2xl pointer-events-none" />

        <div className="relative flex items-start gap-4 mb-4">
          <div className="size-16 rounded-2xl bg-primary/10 flex items-center justify-center shrink-0">
            <span className="text-3xl">{category?.emoji ?? "📖"}</span>
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-xs font-semibold uppercase tracking-wider text-primary mb-1">
              {category?.labelFr ?? doc.category}
            </p>
            <h1 className="text-2xl font-bold leading-tight">{doc.title}</h1>
            {doc.titleAr && (
              <p
                dir="rtl"
                lang="ar"
                className="text-2xl mt-2 text-foreground/80 leading-relaxed"
                style={{ fontFamily: "var(--font-arabic, serif)" }}
              >
                {doc.titleAr}
              </p>
            )}
          </div>
        </div>

        <p className="text-sm text-muted-foreground leading-relaxed mb-4 relative">
          {doc.description}
        </p>

        {/* Badges meta */}
        <div className="flex items-center gap-2 flex-wrap relative">
          <Badge variant="outline" className="text-xs">
            {LANG_LABEL[doc.language] ?? doc.language}
          </Badge>
          {doc.level && (
            <Badge variant="outline" className={`text-xs ${levelClass}`}>
              {doc.level}
            </Badge>
          )}
          {doc.pages && (
            <Badge variant="secondary" className="text-xs tabular-nums">
              {doc.pages} pages
            </Badge>
          )}
        </div>
      </Card>

      {/* Actions + stats client */}
      <DocActions
        docId={doc.id}
        filename={doc.filename}
        title={doc.title}
        totalPages={doc.pages}
      />

      {/* Tags */}
      {doc.tags.length > 0 && (
        <section className="mb-8">
          <p className="text-xs text-muted-foreground uppercase tracking-wide font-semibold mb-3">
            Mots-clés
          </p>
          <div className="flex flex-wrap gap-1.5">
            {doc.tags.map(tag => (
              <Badge key={tag} variant="secondary" className="text-xs font-normal">
                #{tag}
              </Badge>
            ))}
          </div>
        </section>
      )}

      {/* Documents similaires */}
      {similar.length > 0 && (
        <section>
          <Separator className="mb-6" />
          <p className="text-xs text-muted-foreground uppercase tracking-wide font-semibold mb-3">
            Documents similaires
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            {similar.map(d => {
              const cat = CATEGORIES.find(c => c.id === d.category);
              return (
                <Link
                  key={d.id}
                  href={`/doc/${d.id}`}
                  className="group rounded-xl border bg-card p-3 hover:-translate-y-0.5 hover:border-primary/40 transition-all flex flex-col gap-2"
                >
                  <div className="flex items-start justify-between gap-2">
                    <span className="text-2xl">{cat?.emoji ?? "📖"}</span>
                    <span className="text-[10px] text-muted-foreground uppercase tracking-wide">
                      {LANG_LABEL[d.language] ?? d.language}
                    </span>
                  </div>
                  <p className="text-sm font-semibold line-clamp-2 group-hover:text-primary transition-colors">
                    {d.title}
                  </p>
                  {d.titleAr && (
                    <p
                      dir="rtl"
                      lang="ar"
                      className="text-sm text-muted-foreground line-clamp-1"
                      style={{ fontFamily: "var(--font-arabic, serif)" }}
                    >
                      {d.titleAr}
                    </p>
                  )}
                </Link>
              );
            })}
          </div>
        </section>
      )}

    </div>
  );
}
