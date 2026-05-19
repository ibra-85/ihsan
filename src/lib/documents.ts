import type { Locale } from "./i18n";

export type DocCategory = "coran" | "apprentissage" | "prieres" | "tajwid";
export type DocLanguage = "ar" | "fr" | "ar-fr" | "ru" | "ce" | "ar-ru" | "ar-ce";

/** Texte traduit dans les 4 langues de l'interface. */
export type LocalizedText = Record<Locale, string>;

export interface Document {
  id: string;
  title: LocalizedText;
  titleAr?: string;          // titre arabe original du document (inchangé)
  description: LocalizedText;
  category: DocCategory;
  language: DocLanguage;
  filename: string; // nom du fichier sur le CDN (cf. getDocumentUrl)
  pages?: number;
  level?: "débutant" | "intermédiaire" | "avancé";
  tags: string[];
}

export const DOCUMENTS: Document[] = [
  {
    id: "coran-2",
    title: {
      fr: "Coran — Édition complète",
      en: "Quran — Complete Edition",
      ar: "القرآن الكريم — نسخة كاملة",
      ru: "Коран — Полное издание",
    },
    titleAr: "القرآن الكريم",
    description: {
      fr: "Coran complet en arabe.",
      en: "Complete Quran in Arabic.",
      ar: "القرآن الكريم كاملاً باللغة العربية.",
      ru: "Полный Коран на арабском языке.",
    },
    category: "coran",
    language: "ar",
    filename: "coran_2.pdf",
    tags: ["coran", "complet", "arabe"],
  },
  {
    id: "coran-4",
    title: {
      fr: "Musulman — Islamité (Yasin, Tabarak, Amma)",
      en: "Muslim — Islamity (Yasin, Tabarak, Amma)",
      ar: "المسلم — الإسلامية (يس، تبارك، عمّ)",
      ru: "Мусульманин — Исламскость (Ясин, Табарак, Амма)",
    },
    titleAr: "مسلم",
    description: {
      fr: "Livre d'apprentissage islamique : notions de base (Musulman / Islamité) et sourates coraniques Yasin, Tabarak et Amma.",
      en: "Islamic learning book: basics (Muslim / Islamity) and the Quranic surahs Yasin, Tabarak and Amma.",
      ar: "كتاب لتعليم أساسيات الإسلام (المسلم / الإسلامية) وسور القرآن يس وتبارك وعمّ.",
      ru: "Учебник основ ислама (Мусульманин / Исламскость) и коранические суры Ясин, Табарак и Амма.",
    },
    category: "apprentissage",
    language: "ar",
    filename: "coran_4.pdf",
    level: "débutant",
    tags: ["islamité", "yasin", "tabarak", "amma", "apprentissage", "sourates"],
  },
  {
    id: "coran-5-baudi",
    title: {
      fr: "Extraits coraniques — Édition Baudi",
      en: "Quranic Excerpts — Baudi Edition",
      ar: "مختارات قرآنية — نسخة باودي",
      ru: "Коранические отрывки — Издание Бауди",
    },
    titleAr: "مختارات قرآنية",
    description: {
      fr: "Recueil personnel d'extraits coraniques, édition Baudi.",
      en: "Personal collection of Quranic excerpts, Baudi edition.",
      ar: "مجموعة شخصية من المختارات القرآنية، نسخة باودي.",
      ru: "Личный сборник коранических отрывков, издание Бауди.",
    },
    category: "coran",
    language: "ar",
    filename: "coran_5-baudi.pdf",
    level: "débutant",
    tags: ["baudi", "extraits", "coran", "personnel"],
  },
  {
    id: "coran-6-karim",
    title: {
      fr: "Apprentissage de l'arabe et des prières (en russe)",
      en: "Learning Arabic and Prayers (in Russian)",
      ar: "تعليم العربية والصلاة (بالروسية)",
      ru: "Изучение арабского языка и молитв (на русском)",
    },
    titleAr: "تعليم العربية والصلاة",
    description: {
      fr: "Manuel d'apprentissage de l'arabe et des prières islamiques en langue russe.",
      en: "Manual for learning Arabic and Islamic prayers, in Russian.",
      ar: "دليل لتعليم اللغة العربية والصلوات الإسلامية باللغة الروسية.",
      ru: "Пособие по изучению арабского языка и исламских молитв на русском языке.",
    },
    category: "apprentissage",
    language: "ar-ru",
    filename: "coran_6_karim.pdf",
    level: "débutant",
    tags: ["arabe", "prières", "russe", "apprentissage"],
  },
  {
    id: "coran-noxci-3",
    title: {
      fr: "Coran avec traduction tchétchène — Tome 3",
      en: "Quran with Chechen Translation — Volume 3",
      ar: "القرآن الكريم مع الترجمة الشيشانية — المجلد 3",
      ru: "Коран с чеченским переводом — Том 3",
    },
    titleAr: "القرآن الكريم مع الترجمة النوقشية",
    description: {
      fr: "Coran complet avec traduction en langue tchétchène (noxci), troisième volume.",
      en: "Complete Quran with translation into Chechen (Noxci), third volume.",
      ar: "القرآن الكريم كاملاً مع الترجمة إلى اللغة الشيشانية، المجلد الثالث.",
      ru: "Полный Коран с переводом на чеченский язык (нохчи), третий том.",
    },
    category: "coran",
    language: "ar-ce",
    filename: "coran_noxci_3.pdf",
    tags: ["coran", "tchétchène", "noxci", "traduction", "tome 3"],
  },
  {
    id: "iman-islam-ihsan",
    title: {
      fr: "Iman, Islam et Ihsan — Fondements du hadith",
      en: "Iman, Islam and Ihsan — Foundations of Hadith",
      ar: "الإيمان والإسلام والإحسان — أصول الحديث",
      ru: "Иман, Ислам и Ихсан — Основы хадиса",
    },
    titleAr: "الإيمان والإسلام والإحسان",
    description: {
      fr: "Livre sur les fondements et principes du hadith (foi, soumission, excellence), traduit en langue tchétchène.",
      en: "Book on the foundations and principles of hadith (faith, submission, excellence), translated into Chechen.",
      ar: "كتاب في أصول ومبادئ الحديث (الإيمان، الإسلام، الإحسان)، مترجم إلى اللغة الشيشانية.",
      ru: "Книга об основах и принципах хадиса (вера, покорность, совершенство), переведённая на чеченский язык.",
    },
    category: "apprentissage",
    language: "ar-ce",
    filename: "iman_islam_ihsan.pdf",
    level: "débutant",
    tags: ["iman", "islam", "ihsan", "hadith", "fondements", "tchétchène"],
  },
  {
    id: "jayn",
    title: {
      fr: "Recueil d'enseignements utiles (Al-Jayyid)",
      en: "Collection of Useful Teachings (Al-Jayyid)",
      ar: "الجيّد — مجموعة تعاليم مفيدة",
      ru: "Сборник полезных наставлений (Аль-Джаййид)",
    },
    titleAr: "الجيد",
    description: {
      fr: "Recueil d'enseignements islamiques utiles, incluant les règles de tajwid et la récitation du Coran.",
      en: "Collection of useful Islamic teachings, including tajwid rules and Quran recitation.",
      ar: "مجموعة من التعاليم الإسلامية المفيدة، تشمل أحكام التجويد وتلاوة القرآن.",
      ru: "Сборник полезных исламских наставлений, включая правила таджвида и чтение Корана.",
    },
    category: "tajwid",
    language: "ar",
    filename: "jayn.pdf",
    level: "débutant",
    tags: ["tajwid", "enseignements", "récitation", "règles"],
  },
  {
    id: "salavat",
    title: {
      fr: "Salavat — Invocations sur le Prophète ﷺ (en russe)",
      en: "Salawat — Invocations upon the Prophet ﷺ (in Russian)",
      ar: "الصلوات على النبي ﷺ (بالروسية)",
      ru: "Салават — Молитвы за Пророка ﷺ (на русском)",
    },
    titleAr: "الصلوات على النبي ﷺ",
    description: {
      fr: "Livret musulman en langue russe sur les invocations de bénédiction (salawat) sur le Prophète Muhammad ﷺ.",
      en: "Muslim booklet in Russian on the invocations of blessing (salawat) upon the Prophet Muhammad ﷺ.",
      ar: "كتيّب إسلامي باللغة الروسية حول الصلوات والبركة على النبي محمد ﷺ.",
      ru: "Мусульманская брошюра на русском языке о молитвах благословения (салават) за Пророка Мухаммада ﷺ.",
    },
    category: "prieres",
    language: "ar-ru",
    filename: "salavat.pdf",
    level: "débutant",
    tags: ["salawat", "prophète", "prières", "douas", "russe"],
  },
  {
    id: "seda-coran-1",
    title: {
      fr: "Coran — Édition Seda (Volume 1)",
      en: "Quran — Seda Edition (Volume 1)",
      ar: "القرآن الكريم — نسخة صدى (المجلد 1)",
      ru: "Коран — Издание Седа (Том 1)",
    },
    titleAr: "القرآن الكريم — صدى",
    description: {
      fr: "Coran complet, premier volume de l'édition Seda.",
      en: "Complete Quran, first volume of the Seda edition.",
      ar: "القرآن الكريم كاملاً، المجلد الأول من نسخة صدى.",
      ru: "Полный Коран, первый том издания Седа.",
    },
    category: "coran",
    language: "ar",
    filename: "seda_coran_1.pdf",
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

/**
 * URL complète d'un PDF.
 * Les fichiers sont hébergés sur le CDN Cloudflare (R2).
 * Override possible via la variable d'env NEXT_PUBLIC_CDN_URL.
 */
const CDN_BASE = process.env.NEXT_PUBLIC_CDN_URL || "https://cdn.ihsan-coran.fr/coran";

export function getDocumentUrl(filename: string): string {
  return `${CDN_BASE}/${filename}`;
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
      Object.values(doc.title).some((v) => v.toLowerCase().includes(q)) ||
      Object.values(doc.description).some((v) => v.toLowerCase().includes(q)) ||
      (doc.titleAr?.toLowerCase().includes(q) ?? false) ||
      doc.tags.some((t) => t.toLowerCase().includes(q));
    return matchCategory && matchLanguage && matchSearch;
  });
}
