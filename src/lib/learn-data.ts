import type { Locale } from "./i18n";

export type LocalizedText = Record<Locale, string>;

// ─── Letters ───────────────────────────────────────────────────────────────

export interface ArabicLetter {
  id: string;
  arabic: string;   // Isolated form
  initial: string;  // Initial form (connects right)
  medial: string;   // Medial form (connects both sides)
  final: string;    // Final form (connects left)
  connects: boolean;
  name: LocalizedText;
  transliteration: string;
  example: {
    word: string;
    transliteration: string;
    meaning: LocalizedText;
  };
}

// ─── Vowels ────────────────────────────────────────────────────────────────

export interface VowelItem {
  id: string;
  display: string;       // Letter with diacritic, e.g. "بَ"
  name: LocalizedText;
  sound: string;         // Phonetic hint
  description: LocalizedText;
  example: {
    word: string;
    transliteration: string;
    meaning: LocalizedText;
  };
}

// ─── Lessons ───────────────────────────────────────────────────────────────

export interface AlphabetLesson {
  id: string;
  unitId: string;
  type: "alphabet";
  title: LocalizedText;
  letters: ArabicLetter[];
}

export interface VowelLesson {
  id: string;
  unitId: string;
  type: "vowels";
  title: LocalizedText;
  vowels: VowelItem[];
}

// ─── Words ─────────────────────────────────────────────────────────────────

export interface WordItem {
  id: string;
  arabic: string;          // The word in Arabic script
  transliteration: string; // Latin transliteration
  meaning: LocalizedText;  // Translation in all locales
  audioId?: string;        // CDN audio file id (defaults to id)
}

export interface WordLesson {
  id: string;
  unitId: string;
  type: "words";
  title: LocalizedText;
  words: WordItem[];
}

export type Lesson = AlphabetLesson | VowelLesson | WordLesson;

// ─── Units ─────────────────────────────────────────────────────────────────

export interface Unit {
  id: string;
  title: LocalizedText;
  description: LocalizedText;
  icon: string;
  color: string; // Tailwind bg color class (e.g. "bg-blue-500")
  lessons: Lesson[];
}

// ─── Alphabet data ─────────────────────────────────────────────────────────

const ALL_LETTERS: ArabicLetter[] = [
  {
    id: "alif",
    arabic: "ا", initial: "ا", medial: "ـا", final: "ـا",
    connects: false,
    name: { fr: "Alif", en: "Alif", ar: "أَلِف", ru: "Алиф" },
    transliteration: "ā",
    example: { word: "أَسَد", transliteration: "asad", meaning: { fr: "lion", en: "lion", ar: "أسد", ru: "лев" } },
  },
  {
    id: "ba",
    arabic: "ب", initial: "بـ", medial: "ـبـ", final: "ـب",
    connects: true,
    name: { fr: "Ba", en: "Ba", ar: "بَاء", ru: "Ба" },
    transliteration: "b",
    example: { word: "بَيْت", transliteration: "bayt", meaning: { fr: "maison", en: "house", ar: "بيت", ru: "дом" } },
  },
  {
    id: "ta",
    arabic: "ت", initial: "تـ", medial: "ـتـ", final: "ـت",
    connects: true,
    name: { fr: "Ta", en: "Ta", ar: "تَاء", ru: "Та" },
    transliteration: "t",
    example: { word: "تَمْر", transliteration: "tamr", meaning: { fr: "dattes", en: "dates", ar: "تمر", ru: "финики" } },
  },
  {
    id: "tha",
    arabic: "ث", initial: "ثـ", medial: "ـثـ", final: "ـث",
    connects: true,
    name: { fr: "Tha", en: "Tha", ar: "ثَاء", ru: "Са" },
    transliteration: "th",
    example: { word: "ثَوْب", transliteration: "thawb", meaning: { fr: "vêtement", en: "garment", ar: "ثوب", ru: "одежда" } },
  },
  {
    id: "jim",
    arabic: "ج", initial: "جـ", medial: "ـجـ", final: "ـج",
    connects: true,
    name: { fr: "Jim", en: "Jim", ar: "جِيم", ru: "Джим" },
    transliteration: "j",
    example: { word: "جَبَل", transliteration: "jabal", meaning: { fr: "montagne", en: "mountain", ar: "جبل", ru: "гора" } },
  },
  {
    id: "ha",
    arabic: "ح", initial: "حـ", medial: "ـحـ", final: "ـح",
    connects: true,
    name: { fr: "Ha", en: "Ha", ar: "حَاء", ru: "Ха" },
    transliteration: "ḥ",
    example: { word: "حَيَاة", transliteration: "ḥayāt", meaning: { fr: "vie", en: "life", ar: "حياة", ru: "жизнь" } },
  },
  {
    id: "kha",
    arabic: "خ", initial: "خـ", medial: "ـخـ", final: "ـخ",
    connects: true,
    name: { fr: "Kha", en: "Kha", ar: "خَاء", ru: "Ха (خ)" },
    transliteration: "kh",
    example: { word: "خُبْز", transliteration: "khubz", meaning: { fr: "pain", en: "bread", ar: "خبز", ru: "хлеб" } },
  },
  {
    id: "dal",
    arabic: "د", initial: "د", medial: "ـد", final: "ـد",
    connects: false,
    name: { fr: "Dal", en: "Dal", ar: "دَال", ru: "Даль" },
    transliteration: "d",
    example: { word: "دَار", transliteration: "dār", meaning: { fr: "demeure", en: "home", ar: "دار", ru: "дом" } },
  },
  {
    id: "dhal",
    arabic: "ذ", initial: "ذ", medial: "ـذ", final: "ـذ",
    connects: false,
    name: { fr: "Dhal", en: "Dhal", ar: "ذَال", ru: "Заль" },
    transliteration: "dh",
    example: { word: "ذَهَب", transliteration: "dhahab", meaning: { fr: "or", en: "gold", ar: "ذهب", ru: "золото" } },
  },
  {
    id: "ra",
    arabic: "ر", initial: "ر", medial: "ـر", final: "ـر",
    connects: false,
    name: { fr: "Ra", en: "Ra", ar: "رَاء", ru: "Ра" },
    transliteration: "r",
    example: { word: "رَجُل", transliteration: "rajul", meaning: { fr: "homme", en: "man", ar: "رجل", ru: "мужчина" } },
  },
  {
    id: "zay",
    arabic: "ز", initial: "ز", medial: "ـز", final: "ـز",
    connects: false,
    name: { fr: "Zay", en: "Zay", ar: "زَاي", ru: "Зай" },
    transliteration: "z",
    example: { word: "زَيْت", transliteration: "zayt", meaning: { fr: "huile / olive", en: "oil / olive", ar: "زيت", ru: "масло / олива" } },
  },
  {
    id: "sin",
    arabic: "س", initial: "سـ", medial: "ـسـ", final: "ـس",
    connects: true,
    name: { fr: "Sin", en: "Sin", ar: "سِين", ru: "Син" },
    transliteration: "s",
    example: { word: "سَمَاء", transliteration: "samāʾ", meaning: { fr: "ciel", en: "sky", ar: "سماء", ru: "небо" } },
  },
  {
    id: "shin",
    arabic: "ش", initial: "شـ", medial: "ـشـ", final: "ـش",
    connects: true,
    name: { fr: "Shin", en: "Shin", ar: "شِين", ru: "Шин" },
    transliteration: "sh",
    example: { word: "شَمْس", transliteration: "shams", meaning: { fr: "soleil", en: "sun", ar: "شمس", ru: "солнце" } },
  },
  {
    id: "sad",
    arabic: "ص", initial: "صـ", medial: "ـصـ", final: "ـص",
    connects: true,
    name: { fr: "Sad", en: "Sad", ar: "صَاد", ru: "Сад" },
    transliteration: "ṣ",
    example: { word: "صَلَاة", transliteration: "ṣalāt", meaning: { fr: "prière", en: "prayer", ar: "صلاة", ru: "молитва" } },
  },
  {
    id: "dad",
    arabic: "ض", initial: "ضـ", medial: "ـضـ", final: "ـض",
    connects: true,
    name: { fr: "Dad", en: "Dad", ar: "ضَاد", ru: "Дад" },
    transliteration: "ḍ",
    example: { word: "ضَوْء", transliteration: "ḍawʾ", meaning: { fr: "lumière", en: "light", ar: "ضوء", ru: "свет" } },
  },
  {
    id: "ta2",
    arabic: "ط", initial: "طـ", medial: "ـطـ", final: "ـط",
    connects: true,
    name: { fr: "Ta (emphatique)", en: "Ta (emphatic)", ar: "طَاء", ru: "Та (эмфат.)" },
    transliteration: "ṭ",
    example: { word: "طَرِيق", transliteration: "ṭarīq", meaning: { fr: "chemin", en: "road", ar: "طريق", ru: "дорога" } },
  },
  {
    id: "dha",
    arabic: "ظ", initial: "ظـ", medial: "ـظـ", final: "ـظ",
    connects: true,
    name: { fr: "Dha", en: "Dha", ar: "ظَاء", ru: "Зá (эмфат.)" },
    transliteration: "ẓ",
    example: { word: "ظُهْر", transliteration: "ẓuhr", meaning: { fr: "midi", en: "noon", ar: "ظهر", ru: "полдень" } },
  },
  {
    id: "ayn",
    arabic: "ع", initial: "عـ", medial: "ـعـ", final: "ـع",
    connects: true,
    name: { fr: "Ayn", en: "Ayn", ar: "عَيْن", ru: "Айн" },
    transliteration: "ʿ",
    example: { word: "عِلْم", transliteration: "ʿilm", meaning: { fr: "savoir", en: "knowledge", ar: "علم", ru: "знание" } },
  },
  {
    id: "ghayn",
    arabic: "غ", initial: "غـ", medial: "ـغـ", final: "ـغ",
    connects: true,
    name: { fr: "Ghayn", en: "Ghayn", ar: "غَيْن", ru: "Гайн" },
    transliteration: "gh",
    example: { word: "غَيْم", transliteration: "ghaym", meaning: { fr: "nuage", en: "cloud", ar: "غيم", ru: "облако" } },
  },
  {
    id: "fa",
    arabic: "ف", initial: "فـ", medial: "ـفـ", final: "ـف",
    connects: true,
    name: { fr: "Fa", en: "Fa", ar: "فَاء", ru: "Фа" },
    transliteration: "f",
    example: { word: "فَجْر", transliteration: "fajr", meaning: { fr: "aube", en: "dawn", ar: "فجر", ru: "заря" } },
  },
  {
    id: "qaf",
    arabic: "ق", initial: "قـ", medial: "ـقـ", final: "ـق",
    connects: true,
    name: { fr: "Qaf", en: "Qaf", ar: "قَاف", ru: "Каф" },
    transliteration: "q",
    example: { word: "قَلْب", transliteration: "qalb", meaning: { fr: "cœur", en: "heart", ar: "قلب", ru: "сердце" } },
  },
  {
    id: "kaf",
    arabic: "ك", initial: "كـ", medial: "ـكـ", final: "ـك",
    connects: true,
    name: { fr: "Kaf", en: "Kaf", ar: "كَاف", ru: "Каф (ك)" },
    transliteration: "k",
    example: { word: "كِتَاب", transliteration: "kitāb", meaning: { fr: "livre", en: "book", ar: "كتاب", ru: "книга" } },
  },
  {
    id: "lam",
    arabic: "ل", initial: "لـ", medial: "ـلـ", final: "ـل",
    connects: true,
    name: { fr: "Lam", en: "Lam", ar: "لَام", ru: "Лям" },
    transliteration: "l",
    example: { word: "لَيْل", transliteration: "layl", meaning: { fr: "nuit", en: "night", ar: "ليل", ru: "ночь" } },
  },
  {
    id: "mim",
    arabic: "م", initial: "مـ", medial: "ـمـ", final: "ـم",
    connects: true,
    name: { fr: "Mim", en: "Mim", ar: "مِيم", ru: "Мим" },
    transliteration: "m",
    example: { word: "مَاء", transliteration: "māʾ", meaning: { fr: "eau", en: "water", ar: "ماء", ru: "вода" } },
  },
  {
    id: "nun",
    arabic: "ن", initial: "نـ", medial: "ـنـ", final: "ـن",
    connects: true,
    name: { fr: "Nun", en: "Nun", ar: "نُون", ru: "Нун" },
    transliteration: "n",
    example: { word: "نُور", transliteration: "nūr", meaning: { fr: "lumière", en: "light", ar: "نور", ru: "свет" } },
  },
  {
    id: "ha2",
    arabic: "ه", initial: "هـ", medial: "ـهـ", final: "ـه",
    connects: true,
    name: { fr: "Ha (doux)", en: "Ha (soft)", ar: "هَاء", ru: "Ха (ه)" },
    transliteration: "h",
    example: { word: "هِلَال", transliteration: "hilāl", meaning: { fr: "croissant", en: "crescent", ar: "هلال", ru: "полумесяц" } },
  },
  {
    id: "waw",
    arabic: "و", initial: "و", medial: "ـو", final: "ـو",
    connects: false,
    name: { fr: "Waw", en: "Waw", ar: "وَاو", ru: "Вав" },
    transliteration: "w",
    example: { word: "وَلَد", transliteration: "walad", meaning: { fr: "enfant", en: "child", ar: "ولد", ru: "ребёнок" } },
  },
  {
    id: "ya",
    arabic: "ي", initial: "يـ", medial: "ـيـ", final: "ـي",
    connects: true,
    name: { fr: "Ya", en: "Ya", ar: "يَاء", ru: "Йа" },
    transliteration: "y",
    example: { word: "يَد", transliteration: "yad", meaning: { fr: "main", en: "hand", ar: "يد", ru: "рука" } },
  },
];

// ─── Vowel data ────────────────────────────────────────────────────────────

const SHORT_VOWELS: VowelItem[] = [
  {
    id: "fatha",
    display: "بَ",
    name: { fr: "Fatha", en: "Fatha", ar: "فَتْحَة", ru: "Фатха" },
    sound: "a",
    description: {
      fr: "Petit trait horizontal au-dessus de la lettre — son « a » bref",
      en: "Small horizontal stroke above the letter — short 'a' sound",
      ar: "خط أفقي صغير فوق الحرف — صوت «فتحة»",
      ru: "Маленькая горизонтальная черта над буквой — короткий звук «а»",
    },
    example: { word: "كَتَبَ", transliteration: "kataba", meaning: { fr: "il a écrit", en: "he wrote", ar: "كتب", ru: "он написал" } },
  },
  {
    id: "damma",
    display: "بُ",
    name: { fr: "Damma", en: "Damma", ar: "ضَمَّة", ru: "Дамма" },
    sound: "u",
    description: {
      fr: "Petit « و » au-dessus de la lettre — son « ou » bref",
      en: "Small 'و' above the letter — short 'u' sound",
      ar: "واو صغيرة فوق الحرف — صوت الضمة",
      ru: "Маленький «و» над буквой — короткий звук «у»",
    },
    example: { word: "كُتُب", transliteration: "kutub", meaning: { fr: "livres", en: "books", ar: "كتب", ru: "книги" } },
  },
  {
    id: "kasra",
    display: "بِ",
    name: { fr: "Kasra", en: "Kasra", ar: "كَسْرَة", ru: "Касра" },
    sound: "i",
    description: {
      fr: "Petit trait horizontal sous la lettre — son « i » bref",
      en: "Small horizontal stroke below the letter — short 'i' sound",
      ar: "خط أفقي صغير تحت الحرف — صوت الكسرة",
      ru: "Маленькая горизонтальная черта под буквой — короткий звук «и»",
    },
    example: { word: "بِسْم", transliteration: "bism", meaning: { fr: "au nom de", en: "in the name of", ar: "بسم", ru: "во имя" } },
  },
];

const SUKUN_SHADDA: VowelItem[] = [
  {
    id: "sukun",
    display: "بْ",
    name: { fr: "Sukun", en: "Sukun", ar: "سُكُون", ru: "Сукун" },
    sound: "(silence)",
    description: {
      fr: "Petit cercle au-dessus de la lettre — absence de voyelle",
      en: "Small circle above the letter — no vowel sound",
      ar: "دائرة صغيرة فوق الحرف — غياب الحركة",
      ru: "Маленький кружок над буквой — отсутствие гласного звука",
    },
    example: { word: "كَلْب", transliteration: "kalb", meaning: { fr: "chien", en: "dog", ar: "كلب", ru: "собака" } },
  },
  {
    id: "shadda",
    display: "بّ",
    name: { fr: "Shadda", en: "Shadda", ar: "شَدَّة", ru: "Шадда" },
    sound: "(doublement)",
    description: {
      fr: "Signe en forme de « w » — la lettre est doublée (géminée)",
      en: "'w'-shaped sign — the letter is doubled (geminated)",
      ar: "علامة على شكل «و» — الحرف مشدد (مضاعف)",
      ru: "Знак в форме «w» — удвоение (геминация) буквы",
    },
    example: { word: "مُحَمَّد", transliteration: "muḥammad", meaning: { fr: "Muhammad ﷺ", en: "Muhammad ﷺ", ar: "محمد ﷺ", ru: "Мухаммад ﷺ" } },
  },
  {
    id: "tanwin-fath",
    display: "بً",
    name: { fr: "Tanwīn Fath", en: "Tanwīn Fath", ar: "تَنْوِين الفَتْح", ru: "Танвин фатх" },
    sound: "-an",
    description: {
      fr: "Double fatha — prononcé « -an » à la fin du mot",
      en: "Double fatha — pronounced '-an' at the end of a word",
      ar: "فتحتان — تُلفَظ «-ان» في آخر الكلمة",
      ru: "Двойная фатха — произносится «-ан» в конце слова",
    },
    example: { word: "كِتَابًا", transliteration: "kitāban", meaning: { fr: "un livre (accus.)", en: "a book (acc.)", ar: "كتاباً", ru: "книгу (вин. пад.)" } },
  },
];

// ─── Essential words data ──────────────────────────────────────────────────

const ISLAMIC_PHRASES: WordItem[] = [
  {
    id: "bismillah",
    arabic: "بِسْمِ اللّٰهِ",
    transliteration: "Bismillāh",
    meaning: { fr: "Au nom d'Allah", en: "In the name of Allah", ar: "بسم الله", ru: "Во имя Аллаха" },
  },
  {
    id: "alhamdulillah",
    arabic: "الْحَمْدُ لِلّٰهِ",
    transliteration: "Al-ḥamdu lillāh",
    meaning: { fr: "Louange à Allah", en: "Praise be to Allah", ar: "الحمد لله", ru: "Хвала Аллаху" },
  },
  {
    id: "subhanallah",
    arabic: "سُبْحَانَ اللّٰهِ",
    transliteration: "Subḥānallāh",
    meaning: { fr: "Gloire à Allah", en: "Glory be to Allah", ar: "سبحان الله", ru: "Пречист Аллах" },
  },
  {
    id: "allahuakbar",
    arabic: "اللّٰهُ أَكْبَرُ",
    transliteration: "Allāhu akbar",
    meaning: { fr: "Allah est le plus Grand", en: "Allah is the greatest", ar: "الله أكبر", ru: "Аллах велик" },
  },
  {
    id: "inshallah",
    arabic: "إِنْ شَاءَ اللّٰهُ",
    transliteration: "In shāʾ Allāh",
    meaning: { fr: "Si Allah le veut", en: "If Allah wills", ar: "إن شاء الله", ru: "Если Аллах пожелает" },
  },
  {
    id: "assalamualaikum",
    arabic: "السَّلَامُ عَلَيْكُمْ",
    transliteration: "As-salāmu ʿalaykum",
    meaning: { fr: "La paix soit sur vous", en: "Peace be upon you", ar: "السلام عليكم", ru: "Мир вам" },
  },
  {
    id: "jazakallahkhairan",
    arabic: "جَزَاكَ اللّٰهُ خَيْرًا",
    transliteration: "Jazāk Allāhu khayran",
    meaning: { fr: "Qu'Allah te récompense", en: "May Allah reward you", ar: "جزاك الله خيراً", ru: "Пусть Аллах вознаградит тебя" },
  },
];

const PRAYER_VOCABULARY: WordItem[] = [
  {
    id: "salat",
    arabic: "صَلَاة",
    transliteration: "ṣalāt",
    meaning: { fr: "Prière", en: "Prayer", ar: "صلاة", ru: "Намаз" },
  },
  {
    id: "adhan",
    arabic: "أَذَان",
    transliteration: "adhān",
    meaning: { fr: "Appel à la prière", en: "Call to prayer", ar: "أذان", ru: "Азан" },
  },
  {
    id: "rakaa",
    arabic: "رَكْعَة",
    transliteration: "rakʿa",
    meaning: { fr: "Unité de prière", en: "Prayer cycle", ar: "ركعة", ru: "Ракяат" },
  },
  {
    id: "sajda",
    arabic: "سَجْدَة",
    transliteration: "sajda",
    meaning: { fr: "Prosternation", en: "Prostration", ar: "سجدة", ru: "Земной поклон" },
  },
  {
    id: "qibla",
    arabic: "قِبْلَة",
    transliteration: "qibla",
    meaning: { fr: "Direction de la prière", en: "Prayer direction", ar: "قبلة", ru: "Кибла" },
  },
  {
    id: "wudu",
    arabic: "وُضُوء",
    transliteration: "wuḍūʾ",
    meaning: { fr: "Ablutions", en: "Ritual purification", ar: "وضوء", ru: "Омовение" },
  },
  {
    id: "masjid",
    arabic: "مَسْجِد",
    transliteration: "masjid",
    meaning: { fr: "Mosquée", en: "Mosque", ar: "مسجد", ru: "Мечеть" },
  },
  {
    id: "duaa",
    arabic: "دُعَاء",
    transliteration: "duʿāʾ",
    meaning: { fr: "Invocation / supplication", en: "Supplication", ar: "دعاء", ru: "Дуа" },
  },
];

// ─── Units ─────────────────────────────────────────────────────────────────

export const UNITS: Unit[] = [
  {
    id: "alphabet",
    title: { fr: "L'alphabet", en: "The Alphabet", ar: "الحروف الهجائية", ru: "Алфавит" },
    description: {
      fr: "Apprenez les 28 lettres de l'alphabet arabe, leurs formes contextuelles et leur prononciation.",
      en: "Learn the 28 letters of the Arabic alphabet, their contextual forms and pronunciation.",
      ar: "تعلّم الحروف الهجائية العربية الـ28 وأشكالها السياقية ونطقها.",
      ru: "Изучите 28 букв арабского алфавита, их контекстные формы и произношение.",
    },
    icon: "أ",
    color: "bg-primary",
    lessons: [
      {
        id: "letters-1",
        unitId: "alphabet",
        type: "alphabet",
        title: { fr: "Lettres 1–7 (أ → خ)", en: "Letters 1–7 (أ → خ)", ar: "الحروف 1–7 (أ → خ)", ru: "Буквы 1–7 (أ → خ)" },
        letters: ALL_LETTERS.slice(0, 7),
      },
      {
        id: "letters-2",
        unitId: "alphabet",
        type: "alphabet",
        title: { fr: "Lettres 8–14 (د → ص)", en: "Letters 8–14 (د → ص)", ar: "الحروف 8–14 (د → ص)", ru: "Буквы 8–14 (د → ص)" },
        letters: ALL_LETTERS.slice(7, 14),
      },
      {
        id: "letters-3",
        unitId: "alphabet",
        type: "alphabet",
        title: { fr: "Lettres 15–21 (ض → ق)", en: "Letters 15–21 (ض → ق)", ar: "الحروف 15–21 (ض → ق)", ru: "Буквы 15–21 (ض → ق)" },
        letters: ALL_LETTERS.slice(14, 21),
      },
      {
        id: "letters-4",
        unitId: "alphabet",
        type: "alphabet",
        title: { fr: "Lettres 22–28 (ك → ي)", en: "Letters 22–28 (ك → ي)", ar: "الحروف 22–28 (ك → ي)", ru: "Буквы 22–28 (ك → ي)" },
        letters: ALL_LETTERS.slice(21, 28),
      },
    ],
  },
  {
    id: "voyelles",
    title: { fr: "Les voyelles (Harakat)", en: "Vowels (Harakat)", ar: "الحَرَكَات", ru: "Огласовки (Харакат)" },
    description: {
      fr: "Maîtrisez les signes diacritiques qui indiquent les voyelles courtes, le sukun et la shadda.",
      en: "Master the diacritical marks that indicate short vowels, sukun and shadda.",
      ar: "أتقن العلامات الدياكريتية الدالة على الحركات القصيرة والسكون والشدة.",
      ru: "Освойте диакритические знаки, обозначающие краткие гласные, сукун и шадду.",
    },
    icon: "َ◌",
    color: "bg-amber-500",
    lessons: [
      {
        id: "short-vowels",
        unitId: "voyelles",
        type: "vowels",
        title: { fr: "Voyelles courtes", en: "Short Vowels", ar: "الحركات القصيرة", ru: "Краткие гласные" },
        vowels: SHORT_VOWELS,
      },
      {
        id: "sukun-shadda",
        unitId: "voyelles",
        type: "vowels",
        title: { fr: "Sukun, Shadda & Tanwīn", en: "Sukun, Shadda & Tanwīn", ar: "السكون والشدة والتنوين", ru: "Сукун, Шадда и Танвин" },
        vowels: SUKUN_SHADDA,
      },
    ],
  },
  {
    id: "mots",
    title: { fr: "Mots essentiels", en: "Essential Words", ar: "كلمات أساسية", ru: "Основные слова" },
    description: {
      fr: "Découvrez les formules islamiques incontournables et le vocabulaire de la prière.",
      en: "Discover essential Islamic phrases and prayer vocabulary.",
      ar: "تعرَّف على العبارات الإسلامية الأساسية ومفردات الصلاة.",
      ru: "Изучите ключевые исламские фразы и словарь молитвы.",
    },
    icon: "ب",
    color: "bg-emerald-600",
    lessons: [
      {
        id: "phrases",
        unitId: "mots",
        type: "words",
        title: { fr: "Formules islamiques", en: "Islamic phrases", ar: "الصيغ الإسلامية", ru: "Исламские фразы" },
        words: ISLAMIC_PHRASES,
      },
      {
        id: "priere",
        unitId: "mots",
        type: "words",
        title: { fr: "Vocabulaire de la prière", en: "Prayer vocabulary", ar: "مفردات الصلاة", ru: "Словарь молитвы" },
        words: PRAYER_VOCABULARY,
      },
    ],
  },
];

// ─── Helpers ───────────────────────────────────────────────────────────────

export function getUnit(unitId: string): Unit | undefined {
  return UNITS.find((u) => u.id === unitId);
}

export function getLesson(unitId: string, lessonId: string): Lesson | undefined {
  return getUnit(unitId)?.lessons.find((l) => l.id === lessonId);
}

export const ALL_LETTERS_FLAT = ALL_LETTERS;
