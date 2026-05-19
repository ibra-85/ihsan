export type DocCategory = "coran" | "apprentissage" | "prieres" | "tajwid";
export type DocLanguage = "ar" | "fr" | "ar-fr" | "ru" | "ce" | "ar-ru" | "ar-ce";

export interface Document {
  id: string;
  title: string;
  titleAr?: string;
  description: string;
  category: DocCategory;
  language: DocLanguage;
  filename: string; // in /public/docs/
  pages?: number;
  level?: "débutant" | "intermédiaire" | "avancé";
  tags: string[];
}

export const DOCUMENTS: Document[] = [
  {
    id: "coran-2",
    title: "Coran — Édition complète",
    titleAr: "القرآن الكريم",
    description: "Coran complet en arabe.",
    category: "coran",
    language: "ar",
    filename: "coran-2.pdf",
    tags: ["coran", "complet", "arabe"],
  },
  {
    id: "coran-4",
    title: "Musulman — Islamité (Yasin, Tabarak, Amma)",
    titleAr: "مسلم",
    description: "Livre d'apprentissage islamique : notions de base (Musulman / Islamité) et sourates coraniques Yasin, Tabarak et Amma.",
    category: "apprentissage",
    language: "ar",
    filename: "coran-4.pdf",
    level: "débutant",
    tags: ["islamité", "yasin", "tabarak", "amma", "apprentissage", "sourates"],
  },
  {
    id: "coran-5-baudi",
    title: "Extraits coraniques — Édition Baudi",
    titleAr: "مختارات قرآنية",
    description: "Recueil personnel d'extraits coraniques, édition Baudi.",
    category: "coran",
    language: "ar",
    filename: "coran-5-baudi.pdf",
    level: "débutant",
    tags: ["baudi", "extraits", "coran", "personnel"],
  },
  {
    id: "coran-6-karim",
    title: "Apprentissage de l'arabe et des prières (en russe)",
    titleAr: "تعليم العربية والصلاة",
    description: "Manuel d'apprentissage de l'arabe et des prières islamiques en langue russe.",
    category: "apprentissage",
    language: "ar-ru",
    filename: "coran-6-karim.pdf",
    level: "débutant",
    tags: ["arabe", "prières", "russe", "apprentissage"],
  },
  {
    id: "coran-noxci-3",
    title: "Coran avec traduction tchétchène — Tome 3",
    titleAr: "القرآن الكريم مع الترجمة النوقشية",
    description: "Coran complet avec traduction en langue tchétchène (noxci), troisième volume.",
    category: "coran",
    language: "ar-ce",
    filename: "coran-noxci-3.pdf",
    tags: ["coran", "tchétchène", "noxci", "traduction", "tome 3"],
  },
  {
    id: "iman-islam-ihsan",
    title: "Iman, Islam et Ihsan — Fondements du hadith",
    titleAr: "الإيمان والإسلام والإحسان",
    description: "Livre sur les fondements et principes du hadith (foi, soumission, excellence), traduit en langue tchétchène.",
    category: "apprentissage",
    language: "ar-ce",
    filename: "iman-islam-ihsan.pdf",
    level: "débutant",
    tags: ["iman", "islam", "ihsan", "hadith", "fondements", "tchétchène"],
  },
  {
    id: "jayn",
    title: "Recueil d'enseignements utiles (Al-Jayyid)",
    titleAr: "الجيد",
    description: "Recueil d'enseignements islamiques utiles, incluant les règles de tajwid et la récitation du Coran.",
    category: "tajwid",
    language: "ar",
    filename: "jayn.pdf",
    level: "débutant",
    tags: ["tajwid", "enseignements", "récitation", "règles"],
  },
  {
    id: "salavat",
    title: "Salavat — Invocations sur le Prophète ﷺ (en russe)",
    titleAr: "الصلوات على النبي ﷺ",
    description: "Livret musulman en langue russe sur les invocations de bénédiction (salawat) sur le Prophète Muhammad ﷺ.",
    category: "prieres",
    language: "ar-ru",
    filename: "salavat.pdf",
    level: "débutant",
    tags: ["salawat", "prophète", "prières", "douas", "russe"],
  },
  {
    id: "seda-coran-1",
    title: "Coran — Édition Seda (Volume 1)",
    titleAr: "القرآن الكريم — صدى",
    description: "Coran complet, premier volume de l'édition Seda.",
    category: "coran",
    language: "ar",
    filename: "seda-coran-1.pdf",
    tags: ["coran", "seda", "volume 1", "complet"],
  },
];

export const CATEGORIES: { id: DocCategory | "all"; label: string; labelFr: string; emoji: string }[] = [
  { id: "all",          label: "Tous",          labelFr: "Tous les documents",          emoji: "📚" },
  { id: "coran",        label: "Coran",          labelFr: "Textes coraniques",           emoji: "📖" },
  { id: "apprentissage",label: "Apprentissage",  labelFr: "Documents d'apprentissage",   emoji: "🎓" },
  { id: "tajwid",       label: "Tajwid",         labelFr: "Règles de récitation",        emoji: "🔤" },
  { id: "prieres",      label: "Prières",        labelFr: "Douas et prières",            emoji: "🤲" },
];

export const LANGUAGES: { id: DocLanguage | "all"; label: string }[] = [
  { id: "all",   label: "Toutes"     },
  { id: "ar",    label: "Arabe"      },
  { id: "fr",    label: "Français"   },
  { id: "ar-fr", label: "AR / FR"    },
  { id: "ar-ru", label: "AR / Russe" },
  { id: "ar-ce", label: "AR / Tchét."},
  { id: "ru",    label: "Russe"      },
  { id: "ce",    label: "Tchétchène" },
];

export const LEVELS = [
  { id: "débutant",      label: "Débutant",      color: "green" },
  { id: "intermédiaire", label: "Intermédiaire", color: "amber" },
  { id: "avancé",        label: "Avancé",        color: "red"   },
] as const;

export function getDocument(id: string): Document | undefined {
  return DOCUMENTS.find((d) => d.id === id);
}

export function filterDocuments(
  docs: Document[],
  categories: ReadonlySet<DocCategory> | undefined,
  search: string,
  languages?: ReadonlySet<DocLanguage>,
): Document[] {
  const noCatFilter  = !categories || categories.size === 0;
  const noLangFilter = !languages  || languages.size  === 0;
  return docs.filter((doc) => {
    const matchCategory = noCatFilter  || categories!.has(doc.category);
    const matchLanguage = noLangFilter || languages!.has(doc.language);
    const q = search.toLowerCase();
    const matchSearch =
      !q ||
      doc.title.toLowerCase().includes(q) ||
      doc.description.toLowerCase().includes(q) ||
      doc.tags.some((t) => t.toLowerCase().includes(q));
    return matchCategory && matchLanguage && matchSearch;
  });
}
