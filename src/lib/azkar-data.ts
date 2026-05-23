import type { Locale } from "./i18n";

/**
 * Données des azkar (invocations) — d'après "Hisn al-Muslim" (La forteresse
 * du musulman), Saʿīd ibn ʿAlī al-Qaḥtānī.
 *
 * Champs :
 *  - `arabic`              : texte arabe voyellisé
 *  - `transliteration`     : translittération latine (FR/EN/AR)
 *  - `transliterationRu`   : translittération cyrillique (optionnelle)
 *  - `translations`        : sens en FR / EN / AR / RU
 *  - `repeat`              : nombre de répétitions (défaut 1)
 *  - `source`              : référence prophétique
 */

export type LocalizedText = Record<Locale, string>;

export interface Zikr {
  id: string;
  /** Titre court / occasion (ex: « En entrant aux toilettes »).
   *  Si omis, la carte affiche un numéro auto-incrémenté. */
  title?: LocalizedText;
  arabic: string;
  transliteration: string;
  transliterationRu?: string;
  translations: LocalizedText;
  repeat?: number;
  source?: string;
}

export type AzkarCategoryId =
  | "morning"
  | "evening"
  | "after-prayer"
  | "daily-life";

export interface AzkarCategory {
  id: AzkarCategoryId;
  title: LocalizedText;
  description: LocalizedText;
  items: Zikr[];
}

/* ────────────────────────────── MATIN ────────────────────────────── */

const MORNING: Zikr[] = [
  {
    id: "morning-1",
    arabic:
      "اللَّهُمَّ أَنْتَ رَبِّي لَا إِلَٰهَ إِلَّا أَنْتَ، خَلَقْتَنِي وَأَنَا عَبْدُكَ، وَأَنَا عَلَىٰ عَهْدِكَ وَوَعْدِكَ مَا اسْتَطَعْتُ، أَعُوذُ بِكَ مِنْ شَرِّ مَا صَنَعْتُ، أَبُوءُ لَكَ بِنِعْمَتِكَ عَلَيَّ، وَأَبُوءُ بِذَنْبِي فَاغْفِرْ لِي، فَإِنَّهُ لَا يَغْفِرُ الذُّنُوبَ إِلَّا أَنْتَ.",
    transliteration:
      "Allāhumma anta Rabbī lā ilāha illā anta, khalaqtanī wa anā ʿabduka, wa anā ʿalā ʿahdika wa waʿdika mā staṭaʿtu, aʿūdhu bika min sharri mā ṣanaʿtu, abū'u laka bi-niʿmatika ʿalayya, wa abū'u bi-dhanbī fa-ghfir lī, fa-innahu lā yaghfiru dh-dhunūba illā anta.",
    transliterationRu:
      "Аллахумма, Анта Рабби, ля иляха илля Анта, халякта-ни ва ана 'абду-кя, ва ана 'аля 'ахди-кя ва ва'ди-кя ма-стата'ту. А'узу би-кя мин шарри ма сана'ту, абу'у ля-кя би-ни'мати-кя 'аляййя, ва абу'у би-занби, фа-гфир ли, фа-инна-ху ля йагфи-ру-з-зунуба илля Анта!",
    translations: {
      fr: "Ô Allāh, Tu es mon Seigneur, nulle divinité hormis Toi, Tu m'as créé et je suis Ton serviteur, je reste fidèle à Ton pacte et à Ta promesse autant que je le peux ; je cherche refuge auprès de Toi contre le mal de ce que j'ai fait, je reconnais le bienfait que Tu m'as accordé et je reconnais mon péché — pardonne-moi, car nul ne pardonne les péchés à part Toi. (Sayyid al-Istighfār)",
      en: "O Allāh, You are my Lord, none has the right to be worshipped but You, You created me and I am Your slave, I keep Your covenant and pledge as best I can; I seek refuge in You from the evil of what I have done, I acknowledge Your favour upon me and I confess my sin — forgive me, for no one forgives sins but You. (Sayyid al-Istighfār)",
      ar: "اللهم أنت ربي لا إله إلا أنت، خلقتني وأنا عبدك، وأنا على عهدك ووعدك ما استطعت، أعوذ بك من شر ما صنعت، أبوء لك بنعمتك علي، وأبوء بذنبي فاغفر لي، فإنه لا يغفر الذنوب إلا أنت.",
      ru: "О Аллах, Ты — Господь мой, и нет достойного поклонения, кроме Тебя, Ты создал меня, а я — Твой раб, и я буду хранить верность Тебе, пока у меня хватит сил. Прибегаю к Тебе от зла того, что я сделал, признаю милость, оказанную Тобой мне, и признаю грех свой. Прости же меня, ибо, поистине, никто не прощает грехов, кроме Тебя!",
    },
    source: "Bukhārī",
  },
  {
    id: "morning-2",
    arabic:
      "لَا إِلَٰهَ إِلَّا اللَّهُ وَحْدَهُ لَا شَرِيكَ لَهُ، لَهُ الْمُلْكُ وَلَهُ الْحَمْدُ وَهُوَ عَلَىٰ كُلِّ شَيْءٍ قَدِيرٌ.",
    transliteration:
      "Lā ilāha illā Llāhu waḥdahu lā sharīka lah, lahu l-mulku wa lahu l-ḥamdu wa Huwa ʿalā kulli shay'in qadīr.",
    transliterationRu:
      "Ля иляха илля-Ллаху вахда-ху ля шарикя ля-ху, ля-ху-ль-мульку ва ля-ху-ль-хамду ва хуа 'аля кулли шайин кадир.",
    translations: {
      fr: "Nulle divinité hormis Allāh, seul, sans associé ; à Lui la royauté et la louange, et Il est sur toute chose capable.",
      en: "There is no deity but Allāh alone, without partner; His is the kingdom and praise, and He has power over all things.",
      ar: "لا إله إلا الله وحده لا شريك له، له الملك وله الحمد وهو على كل شيء قدير.",
      ru: "Нет достойного поклонения, кроме одного лишь Аллаха, у которого нет сотоварища, Ему принадлежит владычество, Ему хвала, Он всё может.",
    },
    repeat: 10,
    source: "Aḥmad",
  },
  {
    id: "morning-3",
    arabic: "سُبْحَانَ اللَّهِ وَبِحَمْدِهِ.",
    transliteration: "Subḥāna Llāhi wa bi-ḥamdihi.",
    transliterationRu: "Субхана-Ллахи ва би-хамди-хи.",
    translations: {
      fr: "Gloire à Allāh et louange à Lui.",
      en: "Glory be to Allāh and praise be to Him.",
      ar: "سبحان الله وبحمده.",
      ru: "Пречист Аллах и хвала Ему.",
    },
    repeat: 100,
    source: "Muslim",
  },
  {
    id: "morning-4",
    arabic:
      "أَصْبَحْنَا وَأَصْبَحَ الْمُلْكُ لِلَّهِ، وَالْحَمْدُ لِلَّهِ، لَا إِلَٰهَ إِلَّا اللَّهُ وَحْدَهُ لَا شَرِيكَ لَهُ، لَهُ الْمُلْكُ وَلَهُ الْحَمْدُ وَهُوَ عَلَىٰ كُلِّ شَيْءٍ قَدِيرٌ. رَبِّ أَسْأَلُكَ خَيْرَ مَا فِي هَٰذَا الْيَوْمِ وَخَيْرَ مَا بَعْدَهُ، وَأَعُوذُ بِكَ مِنْ شَرِّ مَا فِي هَٰذَا الْيَوْمِ وَشَرِّ مَا بَعْدَهُ. رَبِّ أَعُوذُ بِكَ مِنَ الْكَسَلِ وَسُوءِ الْكِبَرِ، رَبِّ أَعُوذُ بِكَ مِنْ عَذَابٍ فِي النَّارِ وَعَذَابٍ فِي الْقَبْرِ.",
    transliteration:
      "Aṣbaḥnā wa aṣbaḥa l-mulku lillāh, wa l-ḥamdu lillāh, lā ilāha illā Llāhu waḥdahu lā sharīka lah, lahu l-mulku wa lahu l-ḥamdu wa Huwa ʿalā kulli shay'in qadīr. Rabbi as'aluka khayra mā fī hādhā l-yawmi wa khayra mā baʿdah, wa aʿūdhu bika min sharri mā fī hādhā l-yawmi wa sharri mā baʿdah. Rabbi aʿūdhu bika mina l-kasali wa sū'i l-kibar, Rabbi aʿūdhu bika min ʿadhābin fī n-nāri wa ʿadhābin fī l-qabr.",
    transliterationRu:
      "Асбахна ва асбаха-ль-мульку ли-Лляхи ва-ль-хамду ли-Лляхи, ля иляха илля Ллаху вахда-ху ля шарикя ля-ху, ля-ху-ль-мульку ва ля-ху-ль-хамду ва хуа 'аля кулли шайин кадирун. Рабби, ас'алю-кя хайра ма фи хаза-ль-йауми ва хайра ма ба'да-ху ва а'узу би-кя мин шарри ма фи хаза-ль-йауми ва шарри ма ба'да-ху! Рабби, а'узу би-кя мин аль-кясали ва суи-ль-кибари, Рабби, а'узу би-кя мин 'азабин фи-н-нари ва 'азабин фи-ль-кабри!",
    translations: {
      fr: "Nous voici au matin et la royauté appartient à Allāh ; louange à Allāh ; nulle divinité hormis Allāh, seul, sans associé ; à Lui la royauté et la louange, et Il est sur toute chose capable. Seigneur, je Te demande le bien de ce jour et le bien qui suivra, et je cherche refuge auprès de Toi contre le mal de ce jour et le mal qui suivra. Seigneur, je cherche refuge auprès de Toi contre la paresse et la décrépitude de la vieillesse ; Seigneur, je cherche refuge auprès de Toi contre le châtiment du Feu et le châtiment de la tombe.",
      en: "We have entered the morning and the kingdom belongs to Allāh; praise be to Allāh; there is no deity but Allāh alone without partner; His is the kingdom and praise, and He is able to do all things. Lord, I ask You for the good of this day and the good that comes after it, and I seek refuge in You from the evil of this day and the evil that comes after it. Lord, I seek refuge in You from laziness and the helplessness of old age; Lord, I seek refuge in You from the punishment of the Fire and the punishment of the grave.",
      ar: "أصبحنا وأصبح الملك لله، والحمد لله، لا إله إلا الله وحده لا شريك له، له الملك وله الحمد وهو على كل شيء قدير. رب أسألك خير ما في هذا اليوم وخير ما بعده، وأعوذ بك من شر ما في هذا اليوم وشر ما بعده. رب أعوذ بك من الكسل وسوء الكبر، رب أعوذ بك من عذاب في النار وعذاب في القبر.",
      ru: "Мы дожили до утра, и этим утром владычество принадлежит Аллаху и хвала Аллаху, нет достойного поклонения, кроме одного лишь Аллаха, у которого нет сотоварища. Ему принадлежит владычество, Ему хвала, Он всё может. Господь мой, прошу Тебя о благе того, что будет в этот день, и благе того, что за ним последует, и прибегаю к Тебе от зла того, что будет в этот день, и зла того, что за ним последует. Господь мой, прибегаю к Тебе от нерадения и старческой дряхлости, Господь мой, прибегаю к Тебе от мучений в огне и мучений в могиле!",
    },
    source: "Muslim",
  },
  {
    id: "morning-5",
    arabic:
      "اللَّهُمَّ بِكَ أَصْبَحْنَا، وَبِكَ أَمْسَيْنَا، وَبِكَ نَحْيَا، وَبِكَ نَمُوتُ، وَإِلَيْكَ النُّشُورُ.",
    transliteration:
      "Allāhumma bika aṣbaḥnā, wa bika amsaynā, wa bika naḥyā, wa bika namūtu, wa ilayka n-nushūr.",
    transliterationRu:
      "Аллахумма, би-кя асбахна, ва би-кя амсайна, ва би-кя нахйа, ва би-кя наму-ту ва иляй-кя-н-нушуру.",
    translations: {
      fr: "Ô Allāh, par Toi nous voici au matin, par Toi nous atteignons le soir, par Toi nous vivons et mourons, et c'est vers Toi qu'est la résurrection.",
      en: "O Allāh, by You we reach the morning and by You we reach the evening, by You we live and die, and to You is the resurrection.",
      ar: "اللهم بك أصبحنا، وبك أمسينا، وبك نحيا، وبك نموت، وإليك النشور.",
      ru: "О Аллах, благодаря Тебе мы дожили до утра и благодаря Тебе мы дожили до вечера, Ты даёшь нам жизнь, и Ты лишаешь нас её и Ты воскресишь нас для отчёта.",
    },
    source: "Aḥmad, Abū Dāwūd, Tirmidhī",
  },
  {
    id: "morning-6",
    arabic:
      "بِسْمِ اللَّهِ الَّذِي لَا يَضُرُّ مَعَ اسْمِهِ شَيْءٌ فِي الْأَرْضِ وَلَا فِي السَّمَاءِ، وَهُوَ السَّمِيعُ الْعَلِيمُ.",
    transliteration:
      "Bismi Llāhi alladhī lā yaḍurru maʿa smihi shay'un fī l-arḍi wa lā fī s-samā', wa Huwa s-Samīʿu l-ʿAlīm.",
    transliterationRu:
      "Би-сми-Лляхи аллязи ля йадурру ма'а исми-хи шайун фи-ль-арди ва ля фи-с-самаи ва хуа-с-Сами'у-ль-'Алиму.",
    translations: {
      fr: "Au nom d'Allāh, avec le nom duquel rien sur terre ni au ciel ne peut nuire ; Il est l'Audient, l'Omniscient.",
      en: "In the name of Allāh, with Whose name nothing on earth or in heaven can cause harm; He is the All-Hearing, the All-Knowing.",
      ar: "بسم الله الذي لا يضر مع اسمه شيء في الأرض ولا في السماء، وهو السميع العليم.",
      ru: "С именем Аллаха, с именем которого ничто не причинит вред ни на земле, ни на небе, ведь Он — Слышащий, Знающий!",
    },
    repeat: 3,
    source: "Aḥmad, Tirmidhī",
  },
  {
    id: "morning-7",
    arabic:
      "اللَّهُمَّ إِنِّي أَسْأَلُكَ الْعَافِيَةَ فِي الدُّنْيَا وَالْآخِرَةِ، اللَّهُمَّ إِنِّي أَسْأَلُكَ الْعَفْوَ وَالْعَافِيَةَ فِي دِينِي وَدُنْيَايَ وَأَهْلِي وَمَالِي، اللَّهُمَّ اسْتُرْ عَوْرَاتِي، وَآمِنْ رَوْعَاتِي، اللَّهُمَّ احْفَظْنِي مِنْ بَيْنِ يَدَيَّ وَمِنْ خَلْفِي وَعَنْ يَمِينِي وَعَنْ شِمَالِي وَمِنْ فَوْقِي، وَأَعُوذُ بِعَظَمَتِكَ أَنْ أُغْتَالَ مِنْ تَحْتِي.",
    transliteration:
      "Allāhumma innī as'aluka l-ʿāfiyata fī d-dunyā wa l-ākhirah, Allāhumma innī as'aluka l-ʿafwa wa l-ʿāfiyata fī dīnī wa dunyāya wa ahlī wa mālī, Allāhumma stur ʿawrātī, wa āmin rawʿātī, Allāhumma ḥfaẓnī min bayni yadayya wa min khalfī wa ʿan yamīnī wa ʿan shimālī wa min fawqī, wa aʿūdhu bi-ʿaẓamatika an ughtāla min taḥtī.",
    transliterationRu:
      "Аллахумма, инни ас'алю-кя-ль-'афийата фи-д-дунья ва-ль-ахирати, Аллахумма, инни ас'алю-кя-ль-'афуа ва-ль-'афийата фи дини, ва ду-ньяйа, ва ахли, ва мали. Аллахумма-стур 'аурати ва-эмин рау'ати, Аллахумма-хфаз-ни мин байни йадаййа, ва мин хальфи, ва 'ан ямини, ва 'ан шимали ва мин фауки, ва а'узу би-'азамати-кя ан угталя мин тахти!",
    translations: {
      fr: "Ô Allāh, je Te demande le salut dans ce bas-monde et dans l'au-delà ; ô Allāh, je Te demande le pardon et le salut dans ma religion, mes affaires terrestres, ma famille et mes biens ; ô Allāh, voile ce que je veux cacher et apaise mes craintes ; ô Allāh, protège-moi par-devant, par-derrière, à ma droite, à ma gauche et au-dessus de moi ; et je cherche refuge dans Ta grandeur contre tout coup traître venant de dessous moi.",
      en: "O Allāh, I ask You for well-being in this world and the next; O Allāh, I ask You for pardon and well-being in my religion, my worldly affairs, my family and my wealth; O Allāh, conceal my faults and ease my fears; O Allāh, protect me from in front of me, behind me, on my right, on my left and above me; and I take refuge in Your greatness from being struck down from beneath me.",
      ar: "اللهم إني أسألك العافية في الدنيا والآخرة، اللهم إني أسألك العفو والعافية في ديني ودنياي وأهلي ومالي، اللهم استر عوراتي وآمن روعاتي، اللهم احفظني من بين يدي ومن خلفي وعن يميني وعن شمالي ومن فوقي وأعوذ بعظمتك أن أغتال من تحتي.",
      ru: "О Аллах, поистине, я прошу Тебя о благополучии в мире этом и в мире ином, о Аллах, поистине, я прошу Тебя о прощении и благополучии в моей религии, и моих мирских делах, в моей семье и в моём имуществе. О Аллах, прикрой мою наготу и огради меня от страха, о Аллах, защити меня спереди, и сзади, и справа, и слева, и сверху, и я прибегаю к величию Твоему от того, чтобы быть предательски убитым снизу.",
    },
    source: "Aḥmad, Abū Dāwūd",
  },
  {
    id: "morning-8",
    arabic:
      "اللَّهُمَّ عَالِمَ الْغَيْبِ وَالشَّهَادَةِ، فَاطِرَ السَّمَاوَاتِ وَالْأَرْضِ، رَبَّ كُلِّ شَيْءٍ وَمَلِيكَهُ، أَشْهَدُ أَنْ لَا إِلَٰهَ إِلَّا أَنْتَ، أَعُوذُ بِكَ مِنْ شَرِّ نَفْسِي وَمِنْ شَرِّ الشَّيْطَانِ وَشِرْكِهِ، وَأَنْ أَقْتَرِفَ عَلَىٰ نَفْسِي سُوءًا أَوْ أَجُرَّهُ إِلَىٰ مُسْلِمٍ.",
    transliteration:
      "Allāhumma ʿālima l-ghaybi wa sh-shahādah, fāṭira s-samāwāti wa l-arḍ, Rabba kulli shay'in wa malīkah, ashhadu an lā ilāha illā ant, aʿūdhu bika min sharri nafsī wa min sharri sh-shayṭāni wa shirkih, wa an aqtarifa ʿalā nafsī sū'an aw ajurrahu ilā muslim.",
    transliterationRu:
      "Аллахумма, 'Алима-ль-гайби ва-ш-шахадати, Фатира-с-самавати ва-ль-арди, Рабба кулли шайин ва Малика-ху, ашхаду алля иляха илля Анта, а'узу би-кя мин шарри нафси, ва мин шарри-ш-шайтани ва ширки-хи ва ан актарифа 'аля нафси су'ан ау аджурра-ху иля мусли-мин.",
    translations: {
      fr: "Ô Allāh, Connaisseur de l'invisible et du visible, Créateur des cieux et de la terre, Seigneur et Souverain de toute chose, je témoigne qu'il n'y a de divinité que Toi ; je cherche refuge auprès de Toi contre le mal de mon âme, contre le mal du démon et de son polythéisme, et contre le fait de commettre du mal envers moi-même ou de le faire subir à un musulman.",
      en: "O Allāh, Knower of the unseen and the seen, Creator of the heavens and earth, Lord and Sovereign of all things, I bear witness that there is no deity but You; I seek refuge in You from the evil of my soul, the evil of Satan and his polytheism, and from inflicting evil upon myself or bringing it upon any Muslim.",
      ar: "اللهم عالم الغيب والشهادة، فاطر السماوات والأرض، رب كل شيء ومليكه، أشهد أن لا إله إلا أنت، أعوذ بك من شر نفسي ومن شر الشيطان وشركه، وأن أقترف على نفسي سوءاً أو أجره إلى مسلم.",
      ru: "О Аллах, Знающий сокрытое и явное, Творец небес и земли, Господь и Владыка всего, свидетельствую, что нет достойного поклонения, кроме Тебя, прибегаю к Тебе от зла души своей, от зла и многобожия шайтана и от того, чтобы причинить зло самому себе или навлечь его на какого-нибудь мусульманина.",
    },
    source: "Aḥmad, Tirmidhī",
  },
  {
    id: "morning-9",
    arabic:
      "أَصْبَحْنَا عَلَىٰ فِطْرَةِ الْإِسْلَامِ وَعَلَىٰ كَلِمَةِ الْإِخْلَاصِ، وَعَلَىٰ دِينِ نَبِيِّنَا مُحَمَّدٍ ﷺ، وَعَلَىٰ مِلَّةِ أَبِينَا إِبْرَاهِيمَ حَنِيفًا مُسْلِمًا وَمَا كَانَ مِنَ الْمُشْرِكِينَ.",
    transliteration:
      "Aṣbaḥnā ʿalā fiṭrati l-Islām, wa ʿalā kalimati l-ikhlāṣ, wa ʿalā dīni nabiyyinā Muḥammadin ṣallā Llāhu ʿalayhi wa sallam, wa ʿalā millati abīnā Ibrāhīma ḥanīfan musliman wa mā kāna mina l-mushrikīn.",
    transliterationRu:
      "Асбахна 'аля фитрати-ль-ислами ва 'аля кялимати-ль-ихляси ва 'аля дини набийй-на Мухаммадин, салля Ллаху 'аляй-хи ва салляма, ва 'аля милляти аби-на Ибрахима ханифан муслиман ва ма кяна мин аль-мушрикина.",
    translations: {
      fr: "Nous voici au matin dans la nature originelle de l'Islam, sur la parole de pure dévotion, sur la religion de notre Prophète Muḥammad ﷺ et sur la croyance de notre père Ibrāhīm, monothéiste pur et soumis, qui ne faisait point partie des polythéistes.",
      en: "We have entered the morning upon the natural disposition of Islam, upon the word of sincere devotion, upon the religion of our Prophet Muḥammad ﷺ, and upon the way of our father Ibrāhīm — pure monotheist and Muslim, and he was not among the polytheists.",
      ar: "أصبحنا على فطرة الإسلام وعلى كلمة الإخلاص، وعلى دين نبينا محمد ﷺ، وعلى ملة أبينا إبراهيم حنيفاً مسلماً وما كان من المشركين.",
      ru: "Мы дожили до утра в лоне ислама согласно слову искренности, исповедуя религию нашего пророка Мухаммада, ﷺ, и религию нашего отца Ибрахима, который был ханифом и мусульманином и не относился к многобожникам.",
    },
    source: "Aḥmad, Dārimī",
  },
  {
    id: "morning-10",
    arabic:
      "رَضِيتُ بِاللَّهِ رَبًّا، وَبِالْإِسْلَامِ دِينًا، وَبِمُحَمَّدٍ ﷺ نَبِيًّا.",
    transliteration:
      "Raḍītu billāhi Rabbā, wa bi-l-Islāmi dīnā, wa bi-Muḥammadin ṣallā Llāhu ʿalayhi wa sallama nabiyyā.",
    transliterationRu:
      "Радийту би-Лляхи Раббан, ва би-ль-ислами динан ва би-Мухаммадин, салля-Ллаху 'аляй-хи ва салляма, набийан.",
    translations: {
      fr: "Je suis satisfait d'Allāh comme Seigneur, de l'Islam comme religion et de Muḥammad ﷺ comme Prophète.",
      en: "I am pleased with Allāh as Lord, with Islām as religion, and with Muḥammad ﷺ as Prophet.",
      ar: "رضيت بالله رباً، وبالإسلام ديناً، وبمحمد ﷺ نبياً.",
      ru: "Доволен я Аллахом как Господом, исламом — как религией и Мухаммадом — как пророком!",
    },
    repeat: 3,
    source: "Aḥmad, Abū Dāwūd",
  },
  {
    id: "morning-11",
    arabic:
      "يَا حَيُّ يَا قَيُّومُ، بِرَحْمَتِكَ أَسْتَغِيثُ، أَصْلِحْ لِي شَأْنِي كُلَّهُ، وَلَا تَكِلْنِي إِلَىٰ نَفْسِي طَرْفَةَ عَيْنٍ.",
    transliteration:
      "Yā Ḥayyu yā Qayyūm, bi-raḥmatika astaghīth, aṣliḥ lī sha'nī kullahu, wa lā takilnī ilā nafsī ṭarfata ʿayn.",
    transliterationRu:
      "Йа Хаййу, йа Кайюму, би-рахмати-кя астагису, аслих ли ша'ни кулля-ху ва ля такиль-ни иля нафси тарфата 'айнин!",
    translations: {
      fr: "Ô Vivant, ô Subsistant par Soi, j'implore Ta miséricorde, arrange-moi toutes mes affaires et ne m'abandonne pas à moi-même le temps d'un clin d'œil.",
      en: "O Ever-Living, O Self-Sustaining, by Your mercy I seek help, set right all my affairs, and do not leave me to myself for the blink of an eye.",
      ar: "يا حي يا قيوم برحمتك أستغيث، أصلح لي شأني كله، ولا تكلني إلى نفسي طرفة عين.",
      ru: "О Живой, о Вечносущий, обращаюсь за защитой к милосердию Твоему, приведи в порядок все мои дела и не доверяй меня душе моей ни на мгновение!",
    },
    source: "Nasā'ī",
  },
  {
    id: "morning-12",
    arabic:
      "سُبْحَانَ اللَّهِ وَبِحَمْدِهِ، عَدَدَ خَلْقِهِ، وَرِضَا نَفْسِهِ، وَزِنَةَ عَرْشِهِ، وَمِدَادَ كَلِمَاتِهِ.",
    transliteration:
      "Subḥāna Llāhi wa bi-ḥamdihi, ʿadada khalqihi, wa riḍā nafsihi, wa zinata ʿarshihi, wa midāda kalimātih.",
    transliterationRu:
      "Субхана-Ллахи ва би-хамди-хи 'адада хальки-хи, ва рида нафси-хи, ва зината 'арши-хи ва мидада кялимати-хи!",
    translations: {
      fr: "Gloire et louange à Allāh, autant que Sa création, autant qu'Il en est satisfait, autant que le poids de Son Trône et autant que l'encre de Ses paroles.",
      en: "Glory be to Allāh and praise be to Him, as many times as the number of His creation, as much as His pleasure, the weight of His Throne, and the ink of His words.",
      ar: "سبحان الله وبحمده عدد خلقه ورضا نفسه وزنة عرشه ومداد كلماته.",
      ru: "Пречист Аллах и хвала Ему столько раз, сколько существует Его творений, и столько раз, сколько будет Ему угодно, пусть вес этих славословий и похвал будет равен весу Его трона и пусть для записи их потребуется столько же чернил, сколько нужно их для записи слов Его!",
    },
    repeat: 3,
    source: "Muslim",
  },
  {
    id: "morning-13",
    arabic:
      "حَسْبِيَ اللَّهُ لَا إِلَٰهَ إِلَّا هُوَ، عَلَيْهِ تَوَكَّلْتُ، وَهُوَ رَبُّ الْعَرْشِ الْعَظِيمِ.",
    transliteration:
      "Ḥasbiya Llāhu lā ilāha illā Huwa, ʿalayhi tawakkaltu, wa Huwa Rabbu l-ʿarshi l-ʿaẓīm.",
    transliterationRu:
      "Хасбия-Ллаху, ля иляха илля хуа, 'аляй-хи таваккяльту ва хуа Раббу-ль-'арши-ль-'азыми.",
    translations: {
      fr: "Allāh me suffit, nulle divinité hormis Lui, à Lui je m'en remets, et Il est le Seigneur du Trône immense.",
      en: "Allāh is sufficient for me, none has the right to be worshipped but Him, in Him I trust, and He is the Lord of the Great Throne.",
      ar: "حسبي الله لا إله إلا هو، عليه توكلت، وهو رب العرش العظيم.",
      ru: "Достаточно мне Аллаха, нет достойного поклонения, кроме Него, на Него я уповаю и Он — Господь великого трона.",
    },
    repeat: 7,
    source: "Abū Dāwūd",
  },
  {
    id: "morning-ikhlas",
    arabic:
      "بِسْمِ اللَّهِ الرَّحْمَٰنِ الرَّحِيمِ\nقُلْ هُوَ اللَّهُ أَحَدٌ ﴿١﴾ اللَّهُ الصَّمَدُ ﴿٢﴾ لَمْ يَلِدْ وَلَمْ يُولَدْ ﴿٣﴾ وَلَمْ يَكُن لَّهُ كُفُوًا أَحَدٌ ﴿٤﴾",
    transliteration:
      "Bismi Llāhi r-Raḥmāni r-Raḥīm. Qul Huwa Llāhu Aḥad. Allāhu ṣ-Ṣamad. Lam yalid wa lam yūlad. Wa lam yakun lahu kufuwan aḥad.",
    transliterationRu:
      "Куль хува-Ллаху ахад. Аллаху-ссамад. Лям ялид ва лям юляд. Ва лям якулляху куфуван ахад.",
    translations: {
      fr: "Sourate al-Ikhlāṣ (à lire 3 fois) — Dis : « Il est Allāh, Unique ; Allāh, le Soutien universel ; Il n'a pas engendré et n'a pas été engendré ; et nul n'est égal à Lui. »",
      en: "Surah al-Ikhlāṣ (recited 3 times) — Say: \"He is Allāh, the One; Allāh, the Eternal Refuge; He neither begets nor is born; nor is there to Him any equivalent.\"",
      ar: "سورة الإخلاص (تُقرأ ثلاث مرات).",
      ru: "Сура «Аль-Ихляс» (читается 3 раза) — Скажи: «Он — Аллах Единый, Аллах Самодостаточный. Он не родил и не был рождён, и нет никого равного Ему».",
    },
    repeat: 3,
    source: "Aḥmad, Abū Dāwūd, Tirmidhī, Nasā'ī",
  },
  {
    id: "morning-falaq",
    arabic:
      "بِسْمِ اللَّهِ الرَّحْمَٰنِ الرَّحِيمِ\nقُلْ أَعُوذُ بِرَبِّ الْفَلَقِ ﴿١﴾ مِن شَرِّ مَا خَلَقَ ﴿٢﴾ وَمِن شَرِّ غَاسِقٍ إِذَا وَقَبَ ﴿٣﴾ وَمِن شَرِّ النَّفَّاثَاتِ فِي الْعُقَدِ ﴿٤﴾ وَمِن شَرِّ حَاسِدٍ إِذَا حَسَدَ ﴿٥﴾",
    transliteration:
      "Bismi Llāhi r-Raḥmāni r-Raḥīm. Qul aʿūdhu bi-Rabbi l-falaq. Min sharri mā khalaq. Wa min sharri ghāsiqin idhā waqab. Wa min sharri n-naffāthāti fī l-ʿuqad. Wa min sharri ḥāsidin idhā ḥasad.",
    transliterationRu:
      "Куль а'узу би раббиль фаляк. Мин шарри ма холяк. Ва мин шарри гасикин иза вакаб. Ва мин шарри-ннаффасати филь укад. Ва мин шарри хасидин иза хасад.",
    translations: {
      fr: "Sourate al-Falaq (à lire 3 fois) — Dis : « Je cherche refuge auprès du Seigneur de l'aube, contre le mal de ce qu'Il a créé, contre le mal de l'obscurité quand elle s'approfondit, contre le mal des souffleuses sur les nœuds, et contre le mal de l'envieux quand il envie. »",
      en: "Surah al-Falaq (recited 3 times) — Say: \"I seek refuge in the Lord of the daybreak, from the evil of what He created, from the evil of darkness when it settles, from the evil of the blowers in knots, and from the evil of the envier when he envies.\"",
      ar: "سورة الفلق (تُقرأ ثلاث مرات).",
      ru: "Сура «Аль-Фаляк» (читается 3 раза) — Скажи: «Прибегаю к защите Господа рассвета от зла того, что Он сотворил, от зла мрака, когда он наступает, от зла колдуний, поплёвывающих на узлы, от зла завистника, когда он завидует».",
    },
    repeat: 3,
    source: "Aḥmad, Abū Dāwūd, Tirmidhī, Nasā'ī",
  },
  {
    id: "morning-nas",
    arabic:
      "بِسْمِ اللَّهِ الرَّحْمَٰنِ الرَّحِيمِ\nقُلْ أَعُوذُ بِرَبِّ النَّاسِ ﴿١﴾ مَلِكِ النَّاسِ ﴿٢﴾ إِلَٰهِ النَّاسِ ﴿٣﴾ مِن شَرِّ الْوَسْوَاسِ الْخَنَّاسِ ﴿٤﴾ الَّذِي يُوَسْوِسُ فِي صُدُورِ النَّاسِ ﴿٥﴾ مِنَ الْجِنَّةِ وَالنَّاسِ ﴿٦﴾",
    transliteration:
      "Bismi Llāhi r-Raḥmāni r-Raḥīm. Qul aʿūdhu bi-Rabbi n-nās. Maliki n-nās. Ilāhi n-nās. Min sharri l-waswāsi l-khannās. Alladhī yuwaswisu fī ṣudūri n-nās. Mina l-jinnati wa n-nās.",
    transliterationRu:
      "Куль а'узу би рабби-ннас. Малики-ннас. Иляхи-ннас. Мин шарриль васвасиль хоннас. Аллязи ювасвысу фи судури-ннас. Миналь джиннати ва-ннас.",
    translations: {
      fr: "Sourate an-Nās (à lire 3 fois) — Dis : « Je cherche refuge auprès du Seigneur des hommes, le Roi des hommes, le Dieu des hommes, contre le mal du mauvais conseiller furtif, qui souffle le mal dans les poitrines des hommes, qu'il soit djinn ou humain. »",
      en: "Surah an-Nās (recited 3 times) — Say: \"I seek refuge in the Lord of mankind, the King of mankind, the God of mankind, from the evil of the retreating whisperer who whispers into the hearts of mankind, from jinn and mankind.\"",
      ar: "سورة الناس (تُقرأ ثلاث مرات).",
      ru: "Сура «Ан-Нас» (читается 3 раза) — Скажи: «Прибегаю к защите Господа людей, Царя людей, Бога людей, от зла искусителя, отступающего при поминании Аллаха, который наущает в груди людей, и бывает из джиннов и людей».",
    },
    repeat: 3,
    source: "Aḥmad, Abū Dāwūd, Tirmidhī, Nasā'ī",
  },
];

/* ────────────────────────────── SOIR ────────────────────────────── */

const EVENING: Zikr[] = [
  {
    id: "evening-1",
    arabic: "أَعُوذُ بِكَلِمَاتِ اللَّهِ التَّامَّاتِ مِنْ شَرِّ مَا خَلَقَ.",
    transliteration: "Aʿūdhu bi-kalimāti Llāhi t-tāmmāti min sharri mā khalaq.",
    transliterationRu: "А'узу би-кялимати Лляхи-т-таммати мин шарри ма халяка.",
    translations: {
      fr: "Je cherche refuge dans les paroles parfaites d'Allāh contre le mal qu'Il a créé.",
      en: "I take refuge in the perfect words of Allāh from the evil of what He created.",
      ar: "أعوذ بكلمات الله التامات من شر ما خلق.",
      ru: "Прибегаю к совершенным словам Аллаха от зла того, что Он сотворил.",
    },
    repeat: 3,
    source: "Muslim",
  },
  {
    id: "evening-2",
    arabic:
      "اللَّهُمَّ أَنْتَ رَبِّي لَا إِلَٰهَ إِلَّا أَنْتَ، خَلَقْتَنِي وَأَنَا عَبْدُكَ، وَأَنَا عَلَىٰ عَهْدِكَ وَوَعْدِكَ مَا اسْتَطَعْتُ، أَعُوذُ بِكَ مِنْ شَرِّ مَا صَنَعْتُ، أَبُوءُ لَكَ بِنِعْمَتِكَ عَلَيَّ، وَأَبُوءُ بِذَنْبِي فَاغْفِرْ لِي، فَإِنَّهُ لَا يَغْفِرُ الذُّنُوبَ إِلَّا أَنْتَ.",
    transliteration:
      "Allāhumma anta Rabbī lā ilāha illā anta, khalaqtanī wa anā ʿabduka, wa anā ʿalā ʿahdika wa waʿdika mā staṭaʿtu, aʿūdhu bika min sharri mā ṣanaʿtu, abū'u laka bi-niʿmatika ʿalayya, wa abū'u bi-dhanbī fa-ghfir lī, fa-innahu lā yaghfiru dh-dhunūba illā anta.",
    transliterationRu:
      "Аллахумма, Анта Рабби, ля иляха илля Анта, халякта-ни ва ана 'абду-кя, ва ана 'аля 'ахди-кя ва ва'ди-кя ма-стата'ту. А'узу би-кя мин шарри ма сана'ту, абу'у ля-кя би-ни'мати-кя 'аляййя, ва абу'у би-занби, фа-гфир ли, фа-инна-ху ля йагфи-ру-з-зунуба илля Анта!",
    translations: {
      fr: "Ô Allāh, Tu es mon Seigneur, nulle divinité hormis Toi, Tu m'as créé et je suis Ton serviteur, je reste fidèle à Ton pacte et à Ta promesse autant que je le peux ; je cherche refuge auprès de Toi contre le mal de ce que j'ai fait, je reconnais le bienfait que Tu m'as accordé et je reconnais mon péché — pardonne-moi, car nul ne pardonne les péchés à part Toi.",
      en: "O Allāh, You are my Lord, none has the right to be worshipped but You, You created me and I am Your slave, I keep Your covenant and pledge as best I can; I seek refuge in You from the evil of what I have done, I acknowledge Your favour upon me and I confess my sin — forgive me, for no one forgives sins but You.",
      ar: "اللهم أنت ربي لا إله إلا أنت، خلقتني وأنا عبدك، وأنا على عهدك ووعدك ما استطعت، أعوذ بك من شر ما صنعت، أبوء لك بنعمتك علي، وأبوء بذنبي فاغفر لي، فإنه لا يغفر الذنوب إلا أنت.",
      ru: "О Аллах, Ты — Господь мой, и нет достойного поклонения, кроме Тебя, Ты создал меня, а я — Твой раб, и я буду хранить верность Тебе, пока у меня хватит сил. Прибегаю к Тебе от зла того, что я сделал, признаю милость, оказанную Тобой мне, и признаю грех свой. Прости же меня, ибо, поистине, никто не прощает грехов, кроме Тебя!",
    },
    source: "Bukhārī",
  },
  {
    id: "evening-3",
    arabic:
      "لَا إِلَٰهَ إِلَّا اللَّهُ وَحْدَهُ لَا شَرِيكَ لَهُ، لَهُ الْمُلْكُ وَلَهُ الْحَمْدُ وَهُوَ عَلَىٰ كُلِّ شَيْءٍ قَدِيرٌ.",
    transliteration:
      "Lā ilāha illā Llāhu waḥdahu lā sharīka lah, lahu l-mulku wa lahu l-ḥamdu wa Huwa ʿalā kulli shay'in qadīr.",
    transliterationRu:
      "Ля иляха илля-Ллаху вахда-ху ля шарикя ля-ху, ля-ху-ль-мульку ва ля-ху-ль-хамду ва хуа 'аля кулли шайин кадир.",
    translations: {
      fr: "Nulle divinité hormis Allāh, seul, sans associé ; à Lui la royauté et la louange, et Il est sur toute chose capable.",
      en: "There is no deity but Allāh alone, without partner; His is the kingdom and praise, and He has power over all things.",
      ar: "لا إله إلا الله وحده لا شريك له، له الملك وله الحمد وهو على كل شيء قدير.",
      ru: "Нет достойного поклонения, кроме одного лишь Аллаха, у которого нет сотоварища, Ему принадлежит владычество, Ему хвала, Он всё может.",
    },
    repeat: 10,
    source: "Aḥmad",
  },
  {
    id: "evening-4",
    arabic: "سُبْحَانَ اللَّهِ وَبِحَمْدِهِ.",
    transliteration: "Subḥāna Llāhi wa bi-ḥamdihi.",
    transliterationRu: "Субхана-Ллахи ва би-хамди-хи.",
    translations: {
      fr: "Gloire à Allāh et louange à Lui.",
      en: "Glory be to Allāh and praise be to Him.",
      ar: "سبحان الله وبحمده.",
      ru: "Пречист Аллах и хвала Ему.",
    },
    repeat: 100,
    source: "Muslim",
  },
  {
    id: "evening-5",
    arabic:
      "أَمْسَيْنَا وَأَمْسَى الْمُلْكُ لِلَّهِ، وَالْحَمْدُ لِلَّهِ، لَا إِلَٰهَ إِلَّا اللَّهُ وَحْدَهُ لَا شَرِيكَ لَهُ، لَهُ الْمُلْكُ وَلَهُ الْحَمْدُ وَهُوَ عَلَىٰ كُلِّ شَيْءٍ قَدِيرٌ. رَبِّ أَسْأَلُكَ خَيْرَ مَا فِي هَٰذِهِ اللَّيْلَةِ وَخَيْرَ مَا بَعْدَهَا، وَأَعُوذُ بِكَ مِنْ شَرِّ مَا فِي هَٰذِهِ اللَّيْلَةِ وَشَرِّ مَا بَعْدَهَا. رَبِّ أَعُوذُ بِكَ مِنَ الْكَسَلِ وَسُوءِ الْكِبَرِ، رَبِّ أَعُوذُ بِكَ مِنْ عَذَابٍ فِي النَّارِ وَعَذَابٍ فِي الْقَبْرِ.",
    transliteration:
      "Amsaynā wa amsā l-mulku lillāh, wa l-ḥamdu lillāh… Rabbi as'aluka khayra mā fī hādhihi l-laylati wa khayra mā baʿdahā, wa aʿūdhu bika min sharri mā fī hādhihi l-laylati wa sharri mā baʿdahā. Rabbi aʿūdhu bika mina l-kasali wa sū'i l-kibar, Rabbi aʿūdhu bika min ʿadhābin fī n-nāri wa ʿadhābin fī l-qabr.",
    transliterationRu:
      "Амсайна ва амса-ль-мульку ли-Лляхи ва-ль-хамду ли-Лляхи, ля иляха илля Ллаху вахда-ху ля шарикя ля-ху, ля-ху-ль-мульку ва ля-ху-ль-хамду ва хуа 'аля кулли шайин кадирун. Рабби ас'алюкя хайра ма фи хазихи-ль-лейляти ва хайра ма ба'адаха ва а'узу бикя мин шарри ма фи хазихи-ль-лейляти ва шарри ма ба'адаха Рабби, а'узу би-кя мин аль-кясали ва суи-ль-кибари, Рабби, а'узу би-кя мин 'азабин фи-н-нари ва 'азабин фи-ль-кабри!",
    translations: {
      fr: "Nous voici au soir et la royauté appartient à Allāh ; louange à Allāh ; nulle divinité hormis Allāh, seul, sans associé ; à Lui la royauté et la louange, et Il est sur toute chose capable. Seigneur, je Te demande le bien de cette nuit et le bien qui suivra, et je cherche refuge auprès de Toi contre le mal de cette nuit et le mal qui suivra. Seigneur, je cherche refuge auprès de Toi contre la paresse et la décrépitude de la vieillesse ; Seigneur, je cherche refuge auprès de Toi contre le châtiment du Feu et le châtiment de la tombe.",
      en: "We have reached the evening and the kingdom belongs to Allāh… Lord, I ask You for the good of this night and the good that comes after it, and I seek refuge in You from the evil of this night and the evil that follows. Lord, I seek refuge in You from laziness and the helplessness of old age; Lord, I seek refuge in You from the punishment of the Fire and the punishment of the grave.",
      ar: "أمسينا وأمسى الملك لله، والحمد لله، لا إله إلا الله وحده لا شريك له، له الملك وله الحمد وهو على كل شيء قدير. رب أسألك خير ما في هذه الليلة وخير ما بعدها، وأعوذ بك من شر ما في هذه الليلة وشر ما بعدها. رب أعوذ بك من الكسل وسوء الكبر، رب أعوذ بك من عذاب في النار وعذاب في القبر.",
      ru: "Мы дожили до вечера, и этим вечером владычество принадлежит Аллаху, и хвала Аллаху, нет достойного поклонения, кроме одного лишь Аллаха, у которого нет сотоварища. Ему принадлежит владычество, Ему хвала, Он всё может. Господь мой, прошу Тебя о благе того, что будет в эту ночь, и благе того, что за ней последует, и прибегаю к Тебе от зла того, что будет в эту ночь, и зла того, что за ней последует. Господь мой, прибегаю к Тебе от нерадения и старческой дряхлости, Господь мой, прибегаю к Тебе от мучений в огне и мучений в могиле!",
    },
    source: "Muslim",
  },
  {
    id: "evening-6",
    arabic:
      "اللَّهُمَّ بِكَ أَمْسَيْنَا، وَبِكَ نَحْيَا، وَبِكَ نَمُوتُ، وَإِلَيْكَ الْمَصِيرُ.",
    transliteration:
      "Allāhumma bika amsaynā, wa bika naḥyā, wa bika namūtu, wa ilayka l-maṣīr.",
    transliterationRu:
      "Аллахумма, би-ка амсайна, ва би-ка нахйа, ва би-ка намуту ва иляй-ка-ль-масыру.",
    translations: {
      fr: "Ô Allāh, par Toi nous voici au soir, par Toi nous vivons et mourons, et c'est vers Toi qu'est le devenir.",
      en: "O Allāh, by You we reach the evening, by You we live and die, and to You is the final destination.",
      ar: "اللهم بك أمسينا، وبك نحيا، وبك نموت، وإليك المصير.",
      ru: "О Аллах, благодаря Тебе мы дожили до вечера. Ты даёшь нам жизнь, и Ты лишаешь нас её и Ты воскресишь нас для отчёта.",
    },
  },
  {
    id: "evening-7",
    arabic:
      "اللَّهُمَّ إِنِّي أَسْأَلُكَ الْعَافِيَةَ فِي الدُّنْيَا وَالْآخِرَةِ، اللَّهُمَّ إِنِّي أَسْأَلُكَ الْعَفْوَ وَالْعَافِيَةَ فِي دِينِي وَدُنْيَايَ وَأَهْلِي وَمَالِي، اللَّهُمَّ اسْتُرْ عَوْرَاتِي، وَآمِنْ رَوْعَاتِي، اللَّهُمَّ احْفَظْنِي مِنْ بَيْنِ يَدَيَّ وَمِنْ خَلْفِي وَعَنْ يَمِينِي وَعَنْ شِمَالِي وَمِنْ فَوْقِي، وَأَعُوذُ بِعَظَمَتِكَ أَنْ أُغْتَالَ مِنْ تَحْتِي.",
    transliteration:
      "Allāhumma innī as'aluka l-ʿāfiyata fī d-dunyā wa l-ākhirah… Allāhumma stur ʿawrātī, wa āmin rawʿātī, Allāhumma ḥfaẓnī…",
    transliterationRu:
      "Аллахумма, инни ас'алю-кя-ль-'афийата фи-д-дунья ва-ль-ахирати, Аллахумма, инни ас'алю-кя-ль-'афуа ва-ль-'афийата фи дини, ва дуньяйа, ва ахли, ва мали. Аллахумма-стур 'аурати ва-эмин рау'ати, Аллахумма-хфаз-ни мин байни йадаййа, ва мин хальфи, ва 'ан ямини, ва 'ан шимали ва мин фауки, ва а'узу би-'азамати-кя ан угталя мин тахти!",
    translations: {
      fr: "Ô Allāh, je Te demande le salut dans ce bas-monde et dans l'au-delà ; ô Allāh, je Te demande le pardon et le salut dans ma religion, mes affaires terrestres, ma famille et mes biens ; ô Allāh, voile ce que je veux cacher et apaise mes craintes ; ô Allāh, protège-moi par-devant, par-derrière, à ma droite, à ma gauche et au-dessus de moi ; et je cherche refuge dans Ta grandeur contre tout coup traître venant de dessous moi.",
      en: "O Allāh, I ask You for well-being in this world and the next; O Allāh, I ask You for pardon and well-being in my religion, my worldly affairs, my family and my wealth; O Allāh, conceal my faults and ease my fears; O Allāh, protect me from in front, behind, on my right, on my left and above me; and I take refuge in Your greatness from being struck down from beneath me.",
      ar: "اللهم إني أسألك العافية في الدنيا والآخرة، اللهم إني أسألك العفو والعافية في ديني ودنياي وأهلي ومالي، اللهم استر عوراتي وآمن روعاتي، اللهم احفظني من بين يدي ومن خلفي وعن يميني وعن شمالي ومن فوقي وأعوذ بعظمتك أن أغتال من تحتي.",
      ru: "О Аллах, поистине, я прошу Тебя о благополучии в мире этом и в мире ином, о Аллах, поистине, я прошу Тебя о прощении и благополучии в моей религии, и моих мирских делах, в моей семье и в моём имуществе. О Аллах, прикрой мою наготу и огради меня от страха, о Аллах, защити меня спереди, и сзади, и справа, и слева, и сверху, и я прибегаю к величию Твоему от того, чтобы быть предательски убитым снизу.",
    },
    source: "Aḥmad, Abū Dāwūd",
  },
  {
    id: "evening-8",
    arabic:
      "اللَّهُمَّ عَالِمَ الْغَيْبِ وَالشَّهَادَةِ، فَاطِرَ السَّمَاوَاتِ وَالْأَرْضِ، رَبَّ كُلِّ شَيْءٍ وَمَلِيكَهُ، أَشْهَدُ أَنْ لَا إِلَٰهَ إِلَّا أَنْتَ، أَعُوذُ بِكَ مِنْ شَرِّ نَفْسِي وَمِنْ شَرِّ الشَّيْطَانِ وَشِرْكِهِ، وَأَنْ أَقْتَرِفَ عَلَىٰ نَفْسِي سُوءًا أَوْ أَجُرَّهُ إِلَىٰ مُسْلِمٍ.",
    transliteration:
      "Allāhumma ʿālima l-ghaybi wa sh-shahādah, fāṭira s-samāwāti wa l-arḍ, Rabba kulli shay'in wa malīkah, ashhadu an lā ilāha illā ant, aʿūdhu bika min sharri nafsī wa min sharri sh-shayṭāni wa shirkih.",
    transliterationRu:
      "Аллахумма, 'Алима-ль-гайби ва-ш-шахадати, Фатира-с-самавати ва-ль-арди, Рабба кулли шайин ва Малика-ху, ашхаду алля иляха илля Анта, а'узу би-кя мин шарри нафси, ва мин шарри-ш-шайтани ва ширки-хи ва ан актарифа 'аля нафси су'ан ау аджурра-ху иля мусли-мин.",
    translations: {
      fr: "Ô Allāh, Connaisseur de l'invisible et du visible, Créateur des cieux et de la terre, Seigneur et Souverain de toute chose, je témoigne qu'il n'y a de divinité que Toi ; je cherche refuge auprès de Toi contre le mal de mon âme, contre le mal du démon et de son polythéisme, et contre le fait de commettre du mal envers moi-même ou de le faire subir à un musulman.",
      en: "O Allāh, Knower of the unseen and the seen, Creator of the heavens and earth, Lord and Sovereign of all things, I bear witness that there is no deity but You; I seek refuge in You from the evil of my soul, the evil of Satan and his polytheism, and from inflicting evil upon myself or bringing it upon any Muslim.",
      ar: "اللهم عالم الغيب والشهادة، فاطر السماوات والأرض، رب كل شيء ومليكه، أشهد أن لا إله إلا أنت، أعوذ بك من شر نفسي ومن شر الشيطان وشركه، وأن أقترف على نفسي سوءاً أو أجره إلى مسلم.",
      ru: "О Аллах, Знающий сокрытое и явное, Творец небес и земли, Господь и Владыка всего, свидетельствую, что нет достойного поклонения, кроме Тебя, прибегаю к Тебе от зла души своей, от зла и многобожия шайтана и от того, чтобы причинить зло самому себе или навлечь его на какого-нибудь мусульманина.",
    },
    source: "Aḥmad, Tirmidhī",
  },
  {
    id: "evening-9",
    arabic:
      "رَضِيتُ بِاللَّهِ رَبًّا، وَبِالْإِسْلَامِ دِينًا، وَبِمُحَمَّدٍ ﷺ نَبِيًّا.",
    transliteration:
      "Raḍītu billāhi Rabbā, wa bi-l-Islāmi dīnā, wa bi-Muḥammadin ṣallā Llāhu ʿalayhi wa sallama nabiyyā.",
    transliterationRu:
      "Радийту би-Лляхи Раббан, ва би-ль-ислами динан ва би-Мухаммадин, салля-Ллаху 'аляй-хи ва салляма, набийан.",
    translations: {
      fr: "Je suis satisfait d'Allāh comme Seigneur, de l'Islam comme religion et de Muḥammad ﷺ comme Prophète.",
      en: "I am pleased with Allāh as Lord, with Islām as religion, and with Muḥammad ﷺ as Prophet.",
      ar: "رضيت بالله رباً، وبالإسلام ديناً، وبمحمد ﷺ نبياً.",
      ru: "Доволен я Аллахом как Господом, исламом — как религией и Мухаммадом — как пророком!",
    },
    repeat: 3,
    source: "Aḥmad, Abū Dāwūd",
  },
  {
    id: "evening-10",
    arabic:
      "يَا حَيُّ يَا قَيُّومُ، بِرَحْمَتِكَ أَسْتَغِيثُ، أَصْلِحْ لِي شَأْنِي كُلَّهُ، وَلَا تَكِلْنِي إِلَىٰ نَفْسِي طَرْفَةَ عَيْنٍ.",
    transliteration:
      "Yā Ḥayyu yā Qayyūm, bi-raḥmatika astaghīth, aṣliḥ lī sha'nī kullahu, wa lā takilnī ilā nafsī ṭarfata ʿayn.",
    transliterationRu:
      "Йа Хаййу, йа Кайюму, би-рахмати-кя астагису, аслих ли ша'ни кулля-ху ва ля такиль-ни иля нафси тарфата 'айнин!",
    translations: {
      fr: "Ô Vivant, ô Subsistant par Soi, j'implore Ta miséricorde, arrange-moi toutes mes affaires et ne m'abandonne pas à moi-même le temps d'un clin d'œil.",
      en: "O Ever-Living, O Self-Sustaining, by Your mercy I seek help, set right all my affairs, and do not leave me to myself for the blink of an eye.",
      ar: "يا حي يا قيوم برحمتك أستغيث، أصلح لي شأني كله، ولا تكلني إلى نفسي طرفة عين.",
      ru: "О Живой, о Вечносущий, обращаюсь за защитой к милосердию Твоему, приведи в порядок все мои дела и не доверяй меня душе моей ни на мгновение!",
    },
    source: "Nasā'ī",
  },
  {
    id: "evening-11",
    arabic:
      "حَسْبِيَ اللَّهُ لَا إِلَٰهَ إِلَّا هُوَ، عَلَيْهِ تَوَكَّلْتُ، وَهُوَ رَبُّ الْعَرْشِ الْعَظِيمِ.",
    transliteration:
      "Ḥasbiya Llāhu lā ilāha illā Huwa, ʿalayhi tawakkaltu, wa Huwa Rabbu l-ʿarshi l-ʿaẓīm.",
    transliterationRu:
      "Хасбия-Ллаху, ля иляха илля хуа, 'аляй-хи таваккяльту ва хуа Раббу-ль-'арши-ль-'азыми.",
    translations: {
      fr: "Allāh me suffit, nulle divinité hormis Lui, à Lui je m'en remets, et Il est le Seigneur du Trône immense.",
      en: "Allāh is sufficient for me, none has the right to be worshipped but Him, in Him I trust, and He is the Lord of the Great Throne.",
      ar: "حسبي الله لا إله إلا هو، عليه توكلت، وهو رب العرش العظيم.",
      ru: "Достаточно мне Аллаха, нет достойного поклонения, кроме Него, на Него я уповаю и Он — Господь великого трона.",
    },
    repeat: 7,
    source: "Abū Dāwūd",
  },
  {
    id: "evening-12",
    arabic:
      "بِسْمِ اللَّهِ الَّذِي لَا يَضُرُّ مَعَ اسْمِهِ شَيْءٌ فِي الْأَرْضِ وَلَا فِي السَّمَاءِ، وَهُوَ السَّمِيعُ الْعَلِيمُ.",
    transliteration:
      "Bismi Llāhi alladhī lā yaḍurru maʿa smihi shay'un fī l-arḍi wa lā fī s-samā', wa Huwa s-Samīʿu l-ʿAlīm.",
    transliterationRu:
      "Би-сми-Лляхи аллязи ля йадурру ма'а исми-хи шайун фи-ль-арди ва ля фи-с-самаи ва хуа-с-Сами'у-ль-'Алиму.",
    translations: {
      fr: "Au nom d'Allāh, avec le nom duquel rien sur terre ni au ciel ne peut nuire ; Il est l'Audient, l'Omniscient.",
      en: "In the name of Allāh, with Whose name nothing on earth or in heaven can cause harm; He is the All-Hearing, the All-Knowing.",
      ar: "بسم الله الذي لا يضر مع اسمه شيء في الأرض ولا في السماء، وهو السميع العليم.",
      ru: "С именем Аллаха, с именем которого ничто не причинит вред ни на земле, ни на небе, ведь Он — Слышащий, Знающий!",
    },
    repeat: 3,
    source: "Aḥmad, Tirmidhī",
  },
  {
    id: "evening-ikhlas",
    arabic:
      "بِسْمِ اللَّهِ الرَّحْمَٰنِ الرَّحِيمِ\nقُلْ هُوَ اللَّهُ أَحَدٌ ﴿١﴾ اللَّهُ الصَّمَدُ ﴿٢﴾ لَمْ يَلِدْ وَلَمْ يُولَدْ ﴿٣﴾ وَلَمْ يَكُن لَّهُ كُفُوًا أَحَدٌ ﴿٤﴾",
    transliteration:
      "Qul Huwa Llāhu Aḥad. Allāhu ṣ-Ṣamad. Lam yalid wa lam yūlad. Wa lam yakun lahu kufuwan aḥad.",
    transliterationRu:
      "Куль хува-Ллаху ахад. Аллаху-ссамад. Лям ялид ва лям юляд. Ва лям якулляху куфуван ахад.",
    translations: {
      fr: "Sourate al-Ikhlāṣ (à lire 3 fois).",
      en: "Surah al-Ikhlāṣ (recited 3 times).",
      ar: "سورة الإخلاص (تُقرأ ثلاث مرات).",
      ru: "Сура «Аль-Ихляс» (читается 3 раза).",
    },
    repeat: 3,
    source: "Aḥmad, Abū Dāwūd, Tirmidhī, Nasā'ī",
  },
  {
    id: "evening-falaq",
    arabic:
      "بِسْمِ اللَّهِ الرَّحْمَٰنِ الرَّحِيمِ\nقُلْ أَعُوذُ بِرَبِّ الْفَلَقِ ﴿١﴾ مِن شَرِّ مَا خَلَقَ ﴿٢﴾ وَمِن شَرِّ غَاسِقٍ إِذَا وَقَبَ ﴿٣﴾ وَمِن شَرِّ النَّفَّاثَاتِ فِي الْعُقَدِ ﴿٤﴾ وَمِن شَرِّ حَاسِدٍ إِذَا حَسَدَ ﴿٥﴾",
    transliteration:
      "Qul aʿūdhu bi-Rabbi l-falaq. Min sharri mā khalaq. Wa min sharri ghāsiqin idhā waqab. Wa min sharri n-naffāthāti fī l-ʿuqad. Wa min sharri ḥāsidin idhā ḥasad.",
    transliterationRu:
      "Куль а'узу би раббиль фаляк. Мин шарри ма холяк. Ва мин шарри гасикин иза вакаб. Ва мин шарри-ннаффасати филь укад. Ва мин шарри хасидин иза хасад.",
    translations: {
      fr: "Sourate al-Falaq (à lire 3 fois).",
      en: "Surah al-Falaq (recited 3 times).",
      ar: "سورة الفلق (تُقرأ ثلاث مرات).",
      ru: "Сура «Аль-Фаляк» (читается 3 раза).",
    },
    repeat: 3,
    source: "Aḥmad, Abū Dāwūd, Tirmidhī, Nasā'ī",
  },
  {
    id: "evening-nas",
    arabic:
      "بِسْمِ اللَّهِ الرَّحْمَٰنِ الرَّحِيمِ\nقُلْ أَعُوذُ بِرَبِّ النَّاسِ ﴿١﴾ مَلِكِ النَّاسِ ﴿٢﴾ إِلَٰهِ النَّاسِ ﴿٣﴾ مِن شَرِّ الْوَسْوَاسِ الْخَنَّاسِ ﴿٤﴾ الَّذِي يُوَسْوِسُ فِي صُدُورِ النَّاسِ ﴿٥﴾ مِنَ الْجِنَّةِ وَالنَّاسِ ﴿٦﴾",
    transliteration:
      "Qul aʿūdhu bi-Rabbi n-nās. Maliki n-nās. Ilāhi n-nās. Min sharri l-waswāsi l-khannās. Alladhī yuwaswisu fī ṣudūri n-nās. Mina l-jinnati wa n-nās.",
    transliterationRu:
      "Куль а'узу би рабби-ннас. Малики-ннас. Иляхи-ннас. Мин шарриль васвасиль хоннас. Аллязи ювасвысу фи судури-ннас. Миналь джиннати ва-ннас.",
    translations: {
      fr: "Sourate an-Nās (à lire 3 fois).",
      en: "Surah an-Nās (recited 3 times).",
      ar: "سورة الناس (تُقرأ ثلاث مرات).",
      ru: "Сура «Ан-Нас» (читается 3 раза).",
    },
    repeat: 3,
    source: "Aḥmad, Abū Dāwūd, Tirmidhī, Nasā'ī",
  },
  {
    id: "evening-baqarah-285-286",
    arabic:
      "آمَنَ الرَّسُولُ بِمَا أُنزِلَ إِلَيْهِ مِن رَّبِّهِ وَالْمُؤْمِنُونَ ۚ كُلٌّ آمَنَ بِاللَّهِ وَمَلَائِكَتِهِ وَكُتُبِهِ وَرُسُلِهِ لَا نُفَرِّقُ بَيْنَ أَحَدٍ مِّن رُّسُلِهِ ۚ وَقَالُوا سَمِعْنَا وَأَطَعْنَا ۖ غُفْرَانَكَ رَبَّنَا وَإِلَيْكَ الْمَصِيرُ ﴿٢٨٥﴾ لَا يُكَلِّفُ اللَّهُ نَفْسًا إِلَّا وُسْعَهَا ۚ لَهَا مَا كَسَبَتْ وَعَلَيْهَا مَا اكْتَسَبَتْ ۗ رَبَّنَا لَا تُؤَاخِذْنَا إِن نَّسِينَا أَوْ أَخْطَأْنَا ۚ رَبَّنَا وَلَا تَحْمِلْ عَلَيْنَا إِصْرًا كَمَا حَمَلْتَهُ عَلَى الَّذِينَ مِن قَبْلِنَا ۚ رَبَّنَا وَلَا تُحَمِّلْنَا مَا لَا طَاقَةَ لَنَا بِهِ ۖ وَاعْفُ عَنَّا وَاغْفِرْ لَنَا وَارْحَمْنَا ۚ أَنتَ مَوْلَانَا فَانصُرْنَا عَلَى الْقَوْمِ الْكَافِرِينَ ﴿٢٨٦﴾",
    transliteration:
      "Āmana r-rasūlu bimā unzila ilayhi min Rabbihi wa l-mu'minūn… (Coran 2:285-286)",
    transliterationRu:
      "Амана-р-расулю бима унзиля илайхи мир-раббихи валь-му'минун… (Коран 2:285-286)",
    translations: {
      fr: "Les deux derniers versets de la sourate al-Baqarah (2:285-286) — protection durant la nuit.",
      en: "The last two verses of Surah al-Baqarah (2:285-286) — protection during the night.",
      ar: "آخر آيتين من سورة البقرة (٢٨٥-٢٨٦).",
      ru: "Последние два аята суры «Аль-Бакара» (2:285-286) — защита ночью.",
    },
    source: "Bukhārī, Muslim",
  },
];

/* ─────────────────────────── APRÈS PRIÈRE ────────────────────────── */

const AFTER_PRAYER: Zikr[] = [
  {
    id: "ap-1",
    arabic:
      "أَسْتَغْفِرُ اللَّهَ، أَسْتَغْفِرُ اللَّهَ، أَسْتَغْفِرُ اللَّهَ. اللَّهُمَّ أَنْتَ السَّلَامُ، وَمِنْكَ السَّلَامُ، تَبَارَكْتَ يَا ذَا الْجَلَالِ وَالْإِكْرَامِ.",
    transliteration:
      "Astaghfiru Llāh, astaghfiru Llāh, astaghfiru Llāh. Allāhumma anta s-Salām, wa minka s-salām, tabārakta yā Dhā l-Jalāli wa l-Ikrām.",
    transliterationRu:
      "Астагфиру Ллаха астагфиру Ллаха астагфиру Ллаха. Аллахумма анта с-Саляму ва минка с-саляму табаракта йа За-ль-джаляли ва-ль-икрам!",
    translations: {
      fr: "Je demande pardon à Allāh (×3). Ô Allāh, Tu es la Paix et de Toi vient la paix ; béni sois-Tu, ô Détenteur de la majesté et de la générosité.",
      en: "I seek forgiveness from Allāh (×3). O Allāh, You are Peace and from You comes peace; blessed are You, O Possessor of majesty and honour.",
      ar: "أستغفر الله، أستغفر الله، أستغفر الله. اللهم أنت السلام، ومنك السلام، تباركت يا ذا الجلال والإكرام.",
      ru: "Прошу Аллаха о прощении (×3). О Аллах, Ты — Совершенный, и от Тебя — избавление, благословен Ты, о Обладатель величия и щедрости!",
    },
    source: "Muslim",
  },
  {
    id: "ap-2",
    arabic:
      "لَا إِلَٰهَ إِلَّا اللَّهُ وَحْدَهُ لَا شَرِيكَ لَهُ، لَهُ الْمُلْكُ وَلَهُ الْحَمْدُ، وَهُوَ عَلَىٰ كُلِّ شَيْءٍ قَدِيرٌ. اللَّهُمَّ لَا مَانِعَ لِمَا أَعْطَيْتَ، وَلَا مُعْطِيَ لِمَا مَنَعْتَ، وَلَا يَنْفَعُ ذَا الْجَدِّ مِنْكَ الْجَدُّ.",
    transliteration:
      "Lā ilāha illā Llāhu waḥdahu lā sharīka lah, lahu l-mulku wa lahu l-ḥamdu wa Huwa ʿalā kulli shay'in qadīr. Allāhumma lā māniʿa li-mā aʿṭayta, wa lā muʿṭiya li-mā manaʿta, wa lā yanfaʿu dha l-jaddi minka l-jadd.",
    transliterationRu:
      "Ля иляха илля Ллаху вахда-ху ля шарика ля-ху. Ля-ху ль-мульку ва ля-ху ль-хамду ва хуа 'аля кулли шай'ин кадир. Аллахумма ля мани'а ли-ма а'тайта ва ля му'тыйа ли-ма мана'та ва ля йанфа'у за-ль-джадди мин-ка ль-джадд.",
    translations: {
      fr: "Nulle divinité hormis Allāh, seul, sans associé ; à Lui la royauté, à Lui la louange et Il est sur toute chose capable. Ô Allāh, nul ne peut empêcher ce que Tu accordes, ni donner ce que Tu refuses, et la richesse n'est d'aucun secours auprès de Toi à celui qui en possède.",
      en: "There is no deity but Allāh alone, without partner; His is the kingdom and praise, and He has power over all things. O Allāh, none can prevent what You bestow, none can bestow what You withhold, and no fortune avails its possessor against You.",
      ar: "لا إله إلا الله وحده لا شريك له، له الملك وله الحمد وهو على كل شيء قدير. اللهم لا مانع لما أعطيت ولا معطي لما منعت ولا ينفع ذا الجد منك الجد.",
      ru: "Нет бога, кроме одного лишь Аллаха, у Которого нет сотоварища; Ему принадлежит власть, Ему — хвала, и Он всё может. О Аллах, никто не лишит того, что Ты даровал, и никто не дарует того, чего Ты лишил, и бесполезным пред Тобой окажется богатство обладающего богатством.",
    },
    source: "Bukhārī, Muslim",
  },
  {
    id: "ap-3",
    arabic:
      "لَا إِلَٰهَ إِلَّا اللَّهُ وَحْدَهُ لَا شَرِيكَ لَهُ، لَهُ الْمُلْكُ وَلَهُ الْحَمْدُ، وَهُوَ عَلَىٰ كُلِّ شَيْءٍ قَدِيرٌ، لَا حَوْلَ وَلَا قُوَّةَ إِلَّا بِاللَّهِ، لَا إِلَٰهَ إِلَّا اللَّهُ، وَلَا نَعْبُدُ إِلَّا إِيَّاهُ، لَهُ النِّعْمَةُ وَلَهُ الْفَضْلُ وَلَهُ الثَّنَاءُ الْحَسَنُ، لَا إِلَٰهَ إِلَّا اللَّهُ مُخْلِصِينَ لَهُ الدِّينَ وَلَوْ كَرِهَ الْكَافِرُونَ.",
    transliteration:
      "Lā ilāha illā Llāhu waḥdahu lā sharīka lah, lahu l-mulku wa lahu l-ḥamdu wa Huwa ʿalā kulli shay'in qadīr, lā ḥawla wa lā quwwata illā billāh, lā ilāha illā Llāh, wa lā naʿbudu illā iyyāh, lahu n-niʿmatu wa lahu l-faḍlu wa lahu th-thanā'u l-ḥasan, lā ilāha illā Llāhu mukhliṣīna lahu d-dīna wa law kariha l-kāfirūn.",
    transliterationRu:
      "Ля иляха илля Ллаху вахда-ху ля шарика ля-ху, ля-ху ль-мульку ва ля-ху ль-хамду ва хуа 'аля кулли шай'ин кадир. Ля хауля ва ля куввата илля би-Лляхи ля иляха илля Ллаху ва ля на'буду илля иййа-ху. Ля-ху н-ни'мату ва ля-ху ль-фадлю ва ля-ху с-сана'у ль-хасан. Ля иляха илля Ллаху мухлисына ля-ху д-дина ва ляу кяриха ль-кафирун!",
    translations: {
      fr: "Nulle divinité hormis Allāh, seul, sans associé… Nulle force ni puissance qu'en Allāh ; nulle divinité hormis Allāh, nous n'adorons que Lui ; à Lui les bienfaits, à Lui la grâce, à Lui la belle louange ; nulle divinité hormis Allāh — nous Lui vouons un culte sincère, même si cela déplaît aux mécréants.",
      en: "There is no deity but Allāh alone… There is no power nor strength except with Allāh; none has the right to be worshipped but Allāh, and we worship none but Him; His are favours, grace and the finest praise; none has the right to be worshipped but Allāh, sincere to Him in religion even if the disbelievers detest it.",
      ar: "لا إله إلا الله وحده لا شريك له، له الملك وله الحمد وهو على كل شيء قدير، لا حول ولا قوة إلا بالله، لا إله إلا الله، ولا نعبد إلا إياه، له النعمة وله الفضل وله الثناء الحسن، لا إله إلا الله مخلصين له الدين ولو كره الكافرون.",
      ru: "Нет бога, кроме одного лишь Аллаха… Нет мощи и силы ни у кого, кроме Аллаха, нет бога, кроме Аллаха, и не поклоняемся мы никому, кроме Него. У Него есть возможность оказывать милости и благодеяния, и Ему следует воздавать должную хвалу. Нет бога, кроме Аллаха, пред Которым мы искренни в религии, даже если это и ненавистно неверным.",
    },
    source: "Muslim",
  },
  {
    id: "ap-4-tasbih",
    arabic: "سُبْحَانَ اللَّهِ.",
    transliteration: "Subḥāna Llāh.",
    transliterationRu: "Субхана-Ллах.",
    translations: {
      fr: "Gloire à Allāh.",
      en: "Glory be to Allāh.",
      ar: "سبحان الله.",
      ru: "Пречист Аллах.",
    },
    repeat: 33,
    source: "Muslim",
  },
  {
    id: "ap-4-tahmid",
    arabic: "الْحَمْدُ لِلَّهِ.",
    transliteration: "Al-ḥamdu lillāh.",
    transliterationRu: "Альхамду ли-Ллях.",
    translations: {
      fr: "Louange à Allāh.",
      en: "Praise be to Allāh.",
      ar: "الحمد لله.",
      ru: "Хвала Аллаху.",
    },
    repeat: 33,
    source: "Muslim",
  },
  {
    id: "ap-4-takbir",
    arabic: "اللَّهُ أَكْبَرُ.",
    transliteration: "Allāhu akbar.",
    transliterationRu: "Аллаху акбар.",
    translations: {
      fr: "Allāh est le plus grand.",
      en: "Allāh is the greatest.",
      ar: "الله أكبر.",
      ru: "Аллах велик.",
    },
    repeat: 33,
    source: "Muslim",
  },
  {
    id: "ap-4-tahlil",
    arabic:
      "لَا إِلَٰهَ إِلَّا اللَّهُ وَحْدَهُ لَا شَرِيكَ لَهُ، لَهُ الْمُلْكُ وَلَهُ الْحَمْدُ وَهُوَ عَلَىٰ كُلِّ شَيْءٍ قَدِيرٌ.",
    transliteration:
      "Lā ilāha illā Llāhu waḥdahu lā sharīka lah, lahu l-mulku wa lahu l-ḥamdu wa Huwa ʿalā kulli shay'in qadīr.",
    transliterationRu:
      "Ля иляха илля-Ллаху вахдаху ля шарика ля-х(у), Ля-ху-ль-мульку, ва ля-ху-ль-хамду ва хува 'аля кулли щай'ин къадир!",
    translations: {
      fr: "Compléter le tasbīḥ (33×3) par : nulle divinité hormis Allāh, seul, sans associé ; à Lui la royauté, à Lui la louange, et Il est sur toute chose capable.",
      en: "After 33×3, conclude with: there is no deity but Allāh alone, without partner; His is the kingdom and praise, and He has power over all things.",
      ar: "تختم 33×3 بـ: لا إله إلا الله وحده لا شريك له، له الملك وله الحمد وهو على كل شيء قدير.",
      ru: "Завершение 33×3: нет бога, кроме одного лишь Аллаха, у Которого нет сотоварища; Ему принадлежит власть, Ему — хвала, и Он всё может!",
    },
    source: "Muslim",
  },
  {
    id: "ap-5",
    arabic: "رَبِّ قِنِي عَذَابَكَ يَوْمَ تَبْعَثُ عِبَادَكَ.",
    transliteration: "Rabbi qinī ʿadhābaka yawma tabʿathu ʿibādak.",
    transliterationRu: "Рабби, кини 'азабака яума таб'асу 'ибадака.",
    translations: {
      fr: "Seigneur, préserve-moi de Ton châtiment le jour où Tu ressusciteras Tes serviteurs.",
      en: "Lord, protect me from Your punishment on the day You resurrect Your servants.",
      ar: "رب قني عذابك يوم تبعث عبادك.",
      ru: "Господь, защити от наказания в День Воскрешения.",
    },
    source: "Muslim",
  },
  {
    id: "ap-morning-evening",
    arabic:
      "لَا إِلَٰهَ إِلَّا اللَّهُ وَحْدَهُ لَا شَرِيكَ لَهُ، لَهُ الْمُلْكُ وَلَهُ الْحَمْدُ يُحْيِي وَيُمِيتُ وَهُوَ عَلَىٰ كُلِّ شَيْءٍ قَدِيرٌ.",
    transliteration:
      "Lā ilāha illā Llāhu waḥdahu lā sharīka lah, lahu l-mulku wa lahu l-ḥamdu yuḥyī wa yumītu wa Huwa ʿalā kulli shay'in qadīr.",
    transliterationRu:
      "Ля иляха илля-Ллаху вахдаху ля шарика ля-х(у), Ля-ху-ль-мульку, ва ля-ху-ль-хамду юхйи ва юмиту ва хува 'аля кулли щай'ин къадир!",
    translations: {
      fr: "À réciter après les prières du matin (Fajr) et du soir (Maghrib) : Nulle divinité hormis Allāh, seul, sans associé. À Lui la royauté et la louange. Il fait vivre et fait mourir, et Il est sur toute chose capable.",
      en: "Recited after the Fajr and Maghrib prayers: There is no deity but Allāh alone, without partner. His is the kingdom and praise. He gives life and causes death, and He has power over all things.",
      ar: "يُقال بعد صلاتي الفجر والمغرب: لا إله إلا الله وحده لا شريك له، له الملك وله الحمد يحيي ويميت وهو على كل شيء قدير.",
      ru: "Произносится после утреннего (Фаджр) и закатного (Магриб) намазов: нет бога, кроме одного лишь Аллаха, у Которого нет сотоварища. Ему принадлежит власть, и хвала Ему. Он оживляет и умерщвляет, и Он всё может!",
    },
    source: "Tirmidhī, Aḥmad",
  },
  {
    id: "ap-kursi",
    arabic:
      "اللَّهُ لَا إِلَٰهَ إِلَّا هُوَ الْحَيُّ الْقَيُّومُ ۚ لَا تَأْخُذُهُ سِنَةٌ وَلَا نَوْمٌ ۚ لَّهُ مَا فِي السَّمَاوَاتِ وَمَا فِي الْأَرْضِ ۗ مَن ذَا الَّذِي يَشْفَعُ عِندَهُ إِلَّا بِإِذْنِهِ ۚ يَعْلَمُ مَا بَيْنَ أَيْدِيهِمْ وَمَا خَلْفَهُمْ ۖ وَلَا يُحِيطُونَ بِشَيْءٍ مِّنْ عِلْمِهِ إِلَّا بِمَا شَاءَ ۚ وَسِعَ كُرْسِيُّهُ السَّمَاوَاتِ وَالْأَرْضَ ۖ وَلَا يَئُودُهُ حِفْظُهُمَا ۚ وَهُوَ الْعَلِيُّ الْعَظِيمُ.",
    transliteration: "Āyat al-Kursī (Coran 2:255).",
    transliterationRu: "Аят аль-Курси (Коран 2:255).",
    translations: {
      fr: "Verset du Trône (Āyat al-Kursī) — celui qui le récite après chaque prière obligatoire n'a entre lui et le Paradis que la mort.",
      en: "Verse of the Throne — whoever recites it after each obligatory prayer, nothing stands between him and Paradise except death.",
      ar: "آية الكرسي — من قرأها دبر كل صلاة لم يمنعه من دخول الجنة إلا الموت.",
      ru: "Аят аль-Курси — кто прочтёт его после каждой обязательной молитвы, между ним и Раем — только смерть.",
    },
    source: "Nasā'ī",
  },
];

/* ─────────────────────────── VIE QUOTIDIENNE ─────────────────────── */

const DAILY_LIFE: Zikr[] = [
  // — Vêtements —
  {
    id: "dl-newclothes",
    title: {
      fr: "En portant un vêtement neuf",
      en: "When putting on new clothes",
      ar: "عند لبس الثوب الجديد",
      ru: "При облачении в новую одежду",
    },
    arabic:
      "اللَّهُمَّ لَكَ الْحَمْدُ، أَنْتَ كَسَوْتَنِيهِ، أَسْأَلُكَ مِنْ خَيْرِهِ وَخَيْرِ مَا صُنِعَ لَهُ، وَأَعُوذُ بِكَ مِنْ شَرِّهِ وَشَرِّ مَا صُنِعَ لَهُ.",
    transliteration:
      "Allāhumma laka l-ḥamd, anta kasawtanīh, as'aluka min khayrihi wa khayri mā ṣuniʿa lah, wa aʿūdhu bika min sharrihi wa sharri mā ṣuniʿa lah.",
    transliterationRu:
      "Аллахумма ля-кя-ль-хамду! Анта кясаута-ни-хи ас'алю-кя мин хайри-хи ва хайри ма суни'а ля-ху ва а'узу би-кя мин шарри-хи ва шарри ма суни'а ля-ху.",
    translations: {
      fr: "Ô Allāh, à Toi la louange ! Tu m'as habillé de ce vêtement. Je Te demande son bien et le bien pour lequel il a été conçu, et je cherche refuge auprès de Toi contre son mal et le mal pour lequel il a été conçu.",
      en: "O Allāh, praise be to You! You have clothed me with this. I ask You for its good and the good for which it was made, and I seek refuge in You from its evil and the evil for which it was made.",
      ar: "اللهم لك الحمد، أنت كسوتنيه، أسألك من خيره وخير ما صنع له، وأعوذ بك من شره وشر ما صنع له.",
      ru: "О Аллах, хвала Тебе! Ты одел меня в эту одежду, и я прошу Тебя о благе её и благе того, для чего она была изготовлена, и прибегаю к Тебе от зла её и зла того, для чего она была изготовлена.",
    },
    source: "Aḥmad, Abū Dāwūd",
  },
  // — Toilettes —
  {
    id: "dl-toilet-in",
    title: {
      fr: "En entrant aux toilettes",
      en: "Entering the toilet",
      ar: "عند دخول الخلاء",
      ru: "При входе в уборную",
    },
    arabic:
      "بِسْمِ اللَّهِ. اللَّهُمَّ إِنِّي أَعُوذُ بِكَ مِنَ الْخُبْثِ وَالْخَبَائِثِ.",
    transliteration:
      "Bismi Llāh. Allāhumma innī aʿūdhu bika mina l-khubuthi wa l-khabā'ith.",
    transliterationRu:
      "Бисмиллях. Аллахумма инни а'узу бика мин-аль-хубси уа-ль-хабаиси.",
    translations: {
      fr: "Au nom d'Allāh. Ô Allāh, je cherche refuge auprès de Toi contre les démons mâles et femelles.",
      en: "In the name of Allāh. O Allāh, I take refuge in You from the male and female evil demons.",
      ar: "بسم الله. اللهم إني أعوذ بك من الخبث والخبائث.",
      ru: "С именем Аллаха. О Аллах, поистине, я прибегаю к Твоей защите от зла и дьяволов.",
    },
    source: "Bukhārī, Muslim",
  },
  {
    id: "dl-toilet-out",
    title: {
      fr: "En sortant des toilettes",
      en: "Leaving the toilet",
      ar: "عند الخروج من الخلاء",
      ru: "При выходе из уборной",
    },
    arabic: "غُفْرَانَكَ.",
    transliteration: "Ghufrānak.",
    transliterationRu: "Гуфранака.",
    translations: {
      fr: "(Je Te demande) Ton pardon.",
      en: "(I ask for) Your forgiveness.",
      ar: "غفرانك.",
      ru: "Прости меня.",
    },
    source: "Abū Dāwūd, Tirmidhī",
  },
  // — Ablutions —
  {
    id: "dl-wudu-after",
    title: {
      fr: "Après les ablutions",
      en: "After ablution",
      ar: "بعد الوضوء",
      ru: "После омовения",
    },
    arabic:
      "أَشْهَدُ أَنْ لَا إِلَٰهَ إِلَّا اللَّهُ وَحْدَهُ لَا شَرِيكَ لَهُ، وَأَشْهَدُ أَنَّ مُحَمَّدًا عَبْدُهُ وَرَسُولُهُ.",
    transliteration:
      "Ashhadu an lā ilāha illā Llāhu waḥdahu lā sharīka lah, wa ashhadu anna Muḥammadan ʿabduhu wa rasūluh.",
    transliterationRu:
      "Ашхаду алля иляха илля Лляху вахда-ху ля шарикя ля-ху ва ашхаду анна Мухаммадан 'абду-ху ва расулю-ху.",
    translations: {
      fr: "Je témoigne qu'il n'y a de divinité qu'Allāh, seul, sans associé, et je témoigne que Muḥammad est Son serviteur et Son messager.",
      en: "I bear witness that there is no deity but Allāh alone, without partner, and I bear witness that Muḥammad is His servant and messenger.",
      ar: "أشهد أن لا إله إلا الله وحده لا شريك له، وأشهد أن محمداً عبده ورسوله.",
      ru: "Свидетельствую, что нет бога, кроме одного лишь Аллаха, у которого нет сотоварища, и свидетельствую, что Мухаммад — Его раб и Его посланник.",
    },
    source: "Muslim, Tirmidhī, Nasā'ī",
  },
  // — Maison —
  {
    id: "dl-home-out",
    title: {
      fr: "En sortant de la maison",
      en: "Leaving home",
      ar: "دعاء الخروج من المنزل",
      ru: "При выходе из дома",
    },
    arabic:
      "اللَّهُمَّ إِنِّي أَعُوذُ بِكَ أَنْ أَضِلَّ أَوْ أُضَلَّ، أَوْ أَزِلَّ أَوْ أُزَلَّ، أَوْ أَظْلِمَ أَوْ أُظْلَمَ، أَوْ أَجْهَلَ أَوْ يُجْهَلَ عَلَيَّ.",
    transliteration:
      "Allāhumma innī aʿūdhu bika an aḍilla aw uḍall, aw azilla aw uzall, aw aẓlima aw uẓlam, aw ajhala aw yujhala ʿalayy.",
    transliterationRu:
      "Аллахумма иннии 'ауузу бикя ан адылля ав удалля ав азилля ав узалля ав азлимя ав узляма ав аджхаля ав юджхаля 'аляйя.",
    translations: {
      fr: "Ô Allāh, je cherche refuge auprès de Toi contre le fait d'égarer ou d'être égaré, de glisser ou d'être abusé, d'opprimer ou d'être opprimé, d'agir avec ignorance ou d'être traité avec ignorance.",
      en: "O Allāh, I take refuge in You from going astray or being led astray, from slipping or being caused to slip, from oppressing or being oppressed, from acting ignorantly or being treated ignorantly.",
      ar: "اللهم إني أعوذ بك أن أضل أو أضل، أو أزل أو أزل، أو أظلم أو أظلم، أو أجهل أو يجهل علي.",
      ru: "О Аллах! Поистине, я прибегаю к Тебе, чтобы не сбиться с верного пути и не быть сведённым с него; чтобы не ошибиться самому и не быть вынужденным ошибиться; чтобы не поступать несправедливо самому и не быть притесненным; чтобы не быть невежественным и чтобы по отношению ко мне не поступали невежественно.",
    },
    source: "Abū Dāwūd",
  },
  {
    id: "dl-home-in",
    title: {
      fr: "En entrant dans la maison",
      en: "Entering home",
      ar: "عند دخول المنزل",
      ru: "При входе в дом",
    },
    arabic: "بِسْمِ اللَّهِ.",
    transliteration: "Bismi Llāh.",
    transliterationRu: "Бисмиллях.",
    translations: {
      fr: "Au nom d'Allāh.",
      en: "In the name of Allāh.",
      ar: "بسم الله.",
      ru: "С именем Аллаха.",
    },
    source: "Muslim",
  },
  // — Mosquée —
  {
    id: "dl-mosque-in",
    title: {
      fr: "En entrant à la mosquée",
      en: "Entering the mosque",
      ar: "دعاء دخول المسجد",
      ru: "При входе в мечеть",
    },
    arabic: "اللَّهُمَّ افْتَحْ لِي أَبْوَابَ رَحْمَتِكَ.",
    transliteration: "Allāhumma ftaḥ lī abwāba raḥmatik.",
    transliterationRu: "Аллахумма ифтах ли абваба рахматика.",
    translations: {
      fr: "Ô Allāh, ouvre-moi les portes de Ta miséricorde.",
      en: "O Allāh, open for me the doors of Your mercy.",
      ar: "اللهم افتح لي أبواب رحمتك.",
      ru: "О Аллах, открой мне врата Своей милости!",
    },
    source: "Muslim",
  },
  {
    id: "dl-mosque-out",
    title: {
      fr: "En sortant de la mosquée",
      en: "Leaving the mosque",
      ar: "دعاء الخروج من المسجد",
      ru: "При выходе из мечети",
    },
    arabic: "اللَّهُمَّ إِنِّي أَسْأَلُكَ مِنْ فَضْلِكَ.",
    transliteration: "Allāhumma innī as'aluka min faḍlik.",
    transliterationRu: "Аллахумма инни асалюка мин фадликя.",
    translations: {
      fr: "Ô Allāh, je Te demande de Ta grâce.",
      en: "O Allāh, I ask You of Your bounty.",
      ar: "اللهم إني أسألك من فضلك.",
      ru: "О Аллах, я прошу Твоей милости.",
    },
    source: "Muslim",
  },
  // — Appel à la prière —
  {
    id: "dl-adhan-during",
    title: {
      fr: "Pendant l'adhān",
      en: "During the adhān",
      ar: "عند الأذان",
      ru: "Во время азана",
    },
    arabic: "لَا حَوْلَ وَلَا قُوَّةَ إِلَّا بِاللَّهِ.",
    transliteration: "Lā ḥawla wa lā quwwata illā billāh.",
    transliterationRu: "Ля хауля ва ля куввата илля биЛлях.",
    translations: {
      fr: "Nulle force ni puissance qu'en Allāh. (À dire après « ḥayya ʿalā ṣ-ṣalāh » et « ḥayya ʿalā l-falāḥ ». Pour le reste, on répète après le muezzin.)",
      en: "There is no power nor strength except with Allāh. (Said after \"ḥayya ʿalā ṣ-ṣalāh\" and \"ḥayya ʿalā l-falāḥ\". For the rest, repeat after the muezzin.)",
      ar: "ترديد ما يقول المؤذن، وعند 'حي على الصلاة' و'حي على الفلاح' يُقال: لا حول ولا قوة إلا بالله.",
      ru: "Повторять за муаззином, а после слов «спешите на намаз» и «спешите к спасению» сказать: «Нет силы и мощи ни у кого, кроме Аллаха.»",
    },
    source: "Muslim",
  },
  {
    id: "dl-adhan-after-1",
    title: {
      fr: "Après l'adhān (1)",
      en: "After the adhān (1)",
      ar: "بعد الأذان (١)",
      ru: "После азана (1)",
    },
    arabic:
      "أَشْهَدُ أَنْ لَا إِلَٰهَ إِلَّا اللَّهُ وَحْدَهُ لَا شَرِيكَ لَهُ، وَأَنَّ مُحَمَّدًا عَبْدُهُ وَرَسُولُهُ. رَضِيتُ بِاللَّهِ رَبًّا، وَبِمُحَمَّدٍ رَسُولًا، وَبِالْإِسْلَامِ دِينًا.",
    transliteration:
      "Ashhadu an lā ilāha illā Llāhu waḥdahu lā sharīka lah, wa anna Muḥammadan ʿabduhu wa rasūluh. Raḍītu billāhi Rabbā, wa bi-Muḥammadin rasūlā, wa bi-l-Islāmi dīnā.",
    transliterationRu:
      "Ашхаду алля иляха илля-Ллаху вахда-ху ля шарикя ля-ху ва анна Мухаммадан 'абду-ху ва расулю-ху; радыйту би-Лляхи Раббан, ва би-Мухаммадин расулян ва би-ль-ислями динан.",
    translations: {
      fr: "Je témoigne qu'il n'y a de divinité qu'Allāh, seul, sans associé, et que Muḥammad est Son serviteur et messager. Je suis satisfait d'Allāh comme Seigneur, de Muḥammad comme messager et de l'Islam comme religion.",
      en: "I bear witness that there is no deity but Allāh alone, without partner, and that Muḥammad is His servant and messenger. I am pleased with Allāh as Lord, Muḥammad as Messenger, and Islām as religion.",
      ar: "أشهد أن لا إله إلا الله وحده لا شريك له وأن محمداً عبده ورسوله، رضيت بالله رباً وبمحمد رسولاً وبالإسلام ديناً.",
      ru: "Свидетельствую, что нет бога, достойного поклонения, кроме одного лишь Аллаха, у Которого нет сотоварища, и что Мухаммад — Его раб и Его посланник; доволен я Аллахом как Господом, Мухаммадом — как посланником и исламом — как религией.",
    },
    source: "Muslim",
  },
  {
    id: "dl-adhan-after-2",
    title: {
      fr: "Après l'adhān (2)",
      en: "After the adhān (2)",
      ar: "بعد الأذان (٢)",
      ru: "После азана (2)",
    },
    arabic:
      "اللَّهُمَّ رَبَّ هَٰذِهِ الدَّعْوَةِ التَّامَّةِ، وَالصَّلَاةِ الْقَائِمَةِ، آتِ مُحَمَّدًا الْوَسِيلَةَ وَالْفَضِيلَةَ، وَابْعَثْهُ مَقَامًا مَحْمُودًا الَّذِي وَعَدْتَهُ.",
    transliteration:
      "Allāhumma Rabba hādhihi d-daʿwati t-tāmmah, wa ṣ-ṣalāti l-qā'imah, āti Muḥammadan al-wasīlata wa l-faḍīlah, wa bʿathhu maqāman maḥmūdan alladhī waʿadtah.",
    transliterationRu:
      "Аллахумма рабба хазихид-да'ватит-таммах, вассалятиль каимах. Аати Мухаммаданиль василята валь фадылята ваб'асху макамам-махмуданил-лязи ва'аттах.",
    translations: {
      fr: "Ô Allāh, Seigneur de cet appel parfait et de cette prière qui s'apprête à être célébrée, accorde à Muḥammad « al-Wasīla » (la plus haute station au Paradis) et la supériorité, et ressuscite-le dans la station louée que Tu lui as promise.",
      en: "O Allāh, Lord of this perfect call and prayer that is about to be established, grant Muḥammad al-Wasīla (the highest station in Paradise) and the eminence, and raise him to the praised station that You have promised him.",
      ar: "اللهم رب هذه الدعوة التامة، والصلاة القائمة، آت محمداً الوسيلة والفضيلة، وابعثه مقاماً محموداً الذي وعدته.",
      ru: "О Аллах, Владыка этого совершенного призыва и готовящегося намаза! Даруй Мухаммаду 'аль-Василя' (наивысшую ступень в Раю) и превосходство и воскреси его на 'Макам-Махмуд' (хвалимом месте), которое Ты обещал ему.",
    },
    source: "Abū Dāwūd, Tirmidhī, Nasā'ī",
  },
  // — Manger —
  {
    id: "dl-eat-before",
    title: {
      fr: "Avant de manger",
      en: "Before eating",
      ar: "قبل الأكل",
      ru: "Перед едой",
    },
    arabic: "بِسْمِ اللَّهِ.",
    transliteration: "Bismi Llāh.",
    transliterationRu: "Бисмиллях.",
    translations: {
      fr: "Au nom d'Allāh.",
      en: "In the name of Allāh.",
      ar: "بسم الله.",
      ru: "С именем Аллаха.",
    },
    source: "Bukhārī, Muslim",
  },
  {
    id: "dl-eat-forgot",
    title: {
      fr: "Si on a oublié la bismillāh au début du repas",
      en: "If you forgot bismillāh at the start of the meal",
      ar: "لمن نسي التسمية أوّل الطعام",
      ru: "Если забыл «БисмиЛлях» перед едой",
    },
    arabic: "بِسْمِ اللَّهِ فِي أَوَّلِهِ وَآخِرِهِ.",
    transliteration: "Bismi Llāhi fī awwalihi wa ākhirih.",
    transliterationRu: "Бисмилляхи фи аввали-хи ва ахыри-хи.",
    translations: {
      fr: "Au nom d'Allāh au début et à la fin.",
      en: "In the name of Allāh at its beginning and its end.",
      ar: "بسم الله في أوله وآخره.",
      ru: "С именем Аллаха в начале и конце еды.",
    },
    source: "Aḥmad, Abū Dāwūd",
  },
  {
    id: "dl-eat-after-1",
    title: {
      fr: "Après le repas (forme courte)",
      en: "After eating (short form)",
      ar: "بعد الأكل (مختصر)",
      ru: "После еды (краткая форма)",
    },
    arabic: "الْحَمْدُ لِلَّهِ.",
    transliteration: "Al-ḥamdu lillāh.",
    transliterationRu: "Альхамдулиллах.",
    translations: {
      fr: "Louange à Allāh.",
      en: "Praise be to Allāh.",
      ar: "الحمد لله.",
      ru: "Хвала Аллаху.",
    },
    source: "Muslim",
  },
  {
    id: "dl-eat-after-2",
    title: {
      fr: "Après le repas (forme longue)",
      en: "After eating (long form)",
      ar: "بعد الأكل (مفصّل)",
      ru: "После еды (полная форма)",
    },
    arabic:
      "الْحَمْدُ لِلَّهِ حَمْدًا كَثِيرًا طَيِّبًا مُبَارَكًا فِيهِ، غَيْرَ مَكْفِيٍّ وَلَا مُوَدَّعٍ وَلَا مُسْتَغْنًى عَنْهُ رَبَّنَا.",
    transliteration:
      "Al-ḥamdu lillāhi ḥamdan kathīran ṭayyiban mubārakan fīh, ghayra makfiyyin wa lā muwaddaʿin wa lā mustaghnan ʿanhu Rabbanā.",
    transliterationRu:
      "Альхамдулилляхи хамдан кясиран, тайибан, мубаракян фи-хи, гайра макфиййин, ва ля мувадда'ин ва ля мус-тагнан 'ан-ху! Рабба-на!",
    translations: {
      fr: "Louange à Allāh, louange abondante, bonne, bénie, qu'on ne saurait répéter assez, à laquelle on ne saurait dire adieu et dont on ne saurait se passer, ô notre Seigneur !",
      en: "Praise be to Allāh, abundant, good and blessed praise, never enough, never said in farewell, never to be done without, our Lord!",
      ar: "الحمد لله حمداً كثيراً طيباً مباركاً فيه، غير مكفي ولا مودع ولا مستغنى عنه ربنا.",
      ru: "Хвала Аллаху, хвала многая, благая и благословенная, хвала, которую следует произносить чаще, хвала непрерывная, хвала, в которой мы нуждаемся постоянно! Господь наш!",
    },
    source: "Bukhārī",
  },
  // — Voyage —
  {
    id: "dl-travel-start",
    title: {
      fr: "Au départ d'un voyage",
      en: "Starting a journey",
      ar: "دعاء السفر",
      ru: "В начале путешествия",
    },
    arabic:
      "اللَّهُ أَكْبَرُ، اللَّهُ أَكْبَرُ، اللَّهُ أَكْبَرُ، سُبْحَانَ الَّذِي سَخَّرَ لَنَا هَٰذَا وَمَا كُنَّا لَهُ مُقْرِنِينَ، وَإِنَّا إِلَىٰ رَبِّنَا لَمُنْقَلِبُونَ. اللَّهُمَّ إِنَّا نَسْأَلُكَ فِي سَفَرِنَا هَٰذَا الْبِرَّ وَالتَّقْوَىٰ، وَمِنَ الْعَمَلِ مَا تَرْضَىٰ. اللَّهُمَّ هَوِّنْ عَلَيْنَا سَفَرَنَا هَٰذَا وَاطْوِ عَنَّا بُعْدَهُ. اللَّهُمَّ أَنْتَ الصَّاحِبُ فِي السَّفَرِ، وَالْخَلِيفَةُ فِي الْأَهْلِ. اللَّهُمَّ إِنِّي أَعُوذُ بِكَ مِنْ وَعْثَاءِ السَّفَرِ، وَكَآبَةِ الْمَنْظَرِ، وَسُوءِ الْمُنْقَلَبِ فِي الْمَالِ وَالْأَهْلِ.",
    transliteration:
      "Allāhu akbar (×3), subḥāna lladhī sakhkhara lanā hādhā wa mā kunnā lahu muqrinīn, wa innā ilā Rabbinā la-munqalibūn. Allāhumma innā nas'aluka fī safarinā hādhā l-birra wa t-taqwā, wa mina l-ʿamali mā tarḍā…",
    transliterationRu:
      "Аллаху акбару (×3), Субханаль-лязи саххара ляня хаза ва ма куна ляху мукринин ва инна ила Раббина лямункалибун. Аллахумма, инна нас'алю-кя фи сафари-на хаза-ль-бирра ва-т-таква, ва мин аль-'амали ма тарда! Аллахумма, хаввин 'аляй-на сафара-на хаза, ва-тви 'анна бу'да-ху! Аллахумма, Анта-с-сахибу фи-с-сафари ва-ль-халифату фи-ль-ахли, Аллахумма, инни а'узу би-кя мин ва'саи-с-сафари, ва каабати-ль-манзари ва су'и-ль-мункаляби фи-ль-мали ва-ль-ахли!",
    translations: {
      fr: "Allāhu akbar ×3. Gloire à Celui qui a mis cela à notre service, nous n'aurions pu le faire par nous-mêmes ; et c'est vers notre Seigneur que nous retournerons. Ô Allāh, nous Te demandons dans ce voyage la piété, la crainte de Toi et des œuvres qui Te satisfont. Ô Allāh, facilite-nous ce voyage et raccourcis-en pour nous la distance. Ô Allāh, Tu es le Compagnon du voyage et Celui qui veille sur les familles. Ô Allāh, je cherche refuge auprès de Toi contre les fatigues du voyage, contre la tristesse de ce que l'on peut voir, et contre toute mauvaise nouvelle concernant les biens et la famille.",
      en: "Allāhu akbar ×3. Glory to the One who subjected this to us, we could not have done it ourselves; and indeed to our Lord we shall return. O Allāh, we ask You on this journey for righteousness, taqwā, and deeds that please You. O Allāh, ease this journey for us and fold up its distance. O Allāh, You are the Companion on the journey and the Guardian of the family. O Allāh, I seek refuge in You from the hardships of travel, from a disturbing sight, and from any bad turn concerning wealth and family.",
      ar: "الله أكبر، الله أكبر، الله أكبر، سبحان الذي سخر لنا هذا وما كنا له مقرنين، وإنا إلى ربنا لمنقلبون...",
      ru: "Аллах велик (×3). Он Аллах пречист от всех недостатков, и Он предоставил нам это для услужения нам, ибо не хватило бы наших собственных сил на это. Несомненно, мы все вернемся к Господу. О Аллах, поистине, мы просим Тебя о благочестии и богобоязненности в этом нашем путешествии, а также о совершении тех дел, которыми Ты останешься доволен! О Аллах, облегчи нам это наше путешествие и сократи для нас его дальность! О Аллах, Ты будешь спутником в этом путешествии, и Ты останешься с семьёй, о Аллах, поистине, я прибегаю к Тебе от трудностей пути, от уныния, в которое я могу впасть от того, что увижу, и от неприятностей, касающихся имущества и семьи!",
    },
    source: "Muslim",
  },
  {
    id: "dl-travel-back",
    title: {
      fr: "Au retour de voyage",
      en: "Returning from a journey",
      ar: "دعاء العودة من السفر",
      ru: "При возвращении из пути",
    },
    arabic: "آيِبُونَ تَائِبُونَ عَابِدُونَ لِرَبِّنَا حَامِدُونَ.",
    transliteration: "Āyibūna tā'ibūna ʿābidūna li-Rabbinā ḥāmidūn.",
    transliterationRu: "Айибуна, та'ибуна, 'абидуна ли-Рабби-на хамидуна!",
    translations: {
      fr: "Nous revenons, repentants, adorateurs, louant notre Seigneur.",
      en: "We return, repent, worship and praise our Lord.",
      ar: "آيبون تائبون عابدون لربنا حامدون.",
      ru: "Мы возвращаемся, каемся, поклоняемся и воздаём хвалу Господу нашему!",
    },
    source: "Muslim",
  },
  {
    id: "dl-arrive-place",
    title: {
      fr: "À l'arrivée dans une localité",
      en: "When arriving in a town",
      ar: "عند دخول قرية أو مدينة",
      ru: "При въезде в селение или город",
    },
    arabic:
      "اللَّهُمَّ رَبَّ السَّمَاوَاتِ السَّبْعِ وَمَا أَظْلَلْنَ، وَرَبَّ الْأَرَاضِينَ السَّبْعِ وَمَا أَقْلَلْنَ، وَرَبَّ الشَّيَاطِينِ وَمَا أَضْلَلْنَ، وَرَبَّ الرِّيَاحِ وَمَا ذَرَيْنَ. نَسْأَلُكَ خَيْرَ هَٰذِهِ الْقَرْيَةِ وَخَيْرَ أَهْلِهَا وَخَيْرَ مَا فِيهَا، وَنَعُوذُ بِكَ مِنْ شَرِّهَا وَشَرِّ أَهْلِهَا وَشَرِّ مَا فِيهَا.",
    transliteration:
      "Allāhumma Rabba s-samāwāti s-sabʿi wa mā aẓlalna, wa Rabba l-arāḍīna s-sabʿi wa mā aqlalna, wa Rabba sh-shayāṭīni wa mā aḍlalna, wa Rabba r-riyāḥi wa mā dharayna. Nas'aluka khayra hādhihi l-qaryati wa khayra ahlihā wa khayra mā fīhā, wa naʿūdhu bika min sharrihā wa sharri ahlihā wa sharri mā fīhā.",
    transliterationRu:
      "Аллахумма, Рабба-с-самавати-с-саб'и ва ма азляльна, ва Рабба-ль-арадына-с-саб'и ва ма акляльна, ва Рабба-ш-шайатыни ва ма адляльна, ва Рабба-р-рияхи ва ма зарайна, нас'алю-кя хайра ха-зихи-ль-карйати, ва хайра ахли-ха ва хайра ма фи-ха, ва на'узу би-кя мин шарри-ха, ва шарри ахли-ха ва шарри ма фи-ха.",
    translations: {
      fr: "Ô Allāh, Seigneur des sept cieux et de ce qu'ils ombragent, Seigneur des sept terres et de ce qu'elles portent, Seigneur des démons et de ceux qu'ils ont égarés, Seigneur des vents et de ce qu'ils ont dispersé : nous Te demandons le bien de cette cité, le bien de ses habitants et le bien de ce qu'elle contient ; et nous cherchons refuge auprès de Toi contre son mal, le mal de ses habitants et le mal de ce qu'elle contient.",
      en: "O Allāh, Lord of the seven heavens and what they overshadow, Lord of the seven earths and what they carry, Lord of the devils and what they have misled, Lord of the winds and what they scatter: we ask You for the good of this town, the good of its people and the good of what is in it; and we seek refuge in You from its evil, the evil of its people and the evil of what is in it.",
      ar: "اللهم رب السماوات السبع وما أظللن، ورب الأراضين السبع وما أقللن، ورب الشياطين وما أضللن، ورب الرياح وما ذرين. نسألك خير هذه القرية وخير أهلها وخير ما فيها، ونعوذ بك من شرها وشر أهلها وشر ما فيها.",
      ru: "О Аллах, Господь семи небес и того, что они собой покрыли, и Господь семи земель и того, что они несут на себе, и Господь шайтанов и того, что они сбили с пути, и Господь ветров и того, что они развеяли, просим Тебя о благе этого селения, и благе тех, кто его населяет, и благе того, что в нём есть, и прибегаем к Тебе от зла его, и зла тех, кто его населяет, и зла того, что в нём есть.",
    },
    source: "Ibn Khuzaymah",
  },
  // — Divers —
  {
    id: "dl-rooster",
    title: {
      fr: "En entendant chanter un coq",
      en: "When hearing a rooster crow",
      ar: "عند سماع صياح الديك",
      ru: "При кукареканье петуха",
    },
    arabic: "اللَّهُمَّ إِنِّي أَسْأَلُكَ مِنْ فَضْلِكَ.",
    transliteration: "Allāhumma innī as'aluka min faḍlik.",
    transliterationRu: "Аллахумма инни ас'алюка мин фадлика.",
    translations: {
      fr: "Ô Allāh, je Te demande de Ta grâce. (Le coq a vu un ange.)",
      en: "O Allāh, I ask You of Your bounty. (The rooster has seen an angel.)",
      ar: "اللهم إني أسألك من فضلك.",
      ru: "О Аллах, я прошу из Твоей милости. (Петух увидел ангела.)",
    },
    source: "Bukhārī, Muslim",
  },
  {
    id: "dl-donkey-dog",
    title: {
      fr: "En entendant braire un âne ou aboyer un chien",
      en: "When hearing a donkey bray or a dog bark",
      ar: "عند سماع نهيق الحمار أو نباح الكلب",
      ru: "При рёве осла или лае собаки",
    },
    arabic: "أَعُوذُ بِاللَّهِ مِنَ الشَّيْطَانِ الرَّجِيمِ.",
    transliteration: "Aʿūdhu billāhi mina sh-shayṭāni r-rajīm.",
    transliterationRu: "А'узу би-Лляхи мина-ш-шайтани-р-раджим.",
    translations: {
      fr: "Je cherche refuge auprès d'Allāh contre Satan le lapidé. (Ils ont vu un démon.)",
      en: "I take refuge in Allāh from the accursed Satan. (They have seen a devil.)",
      ar: "أعوذ بالله من الشيطان الرجيم.",
      ru: "Я прибегаю к защите Аллаха от проклятого шайтана. (Они увидели шайтана.)",
    },
    source: "Bukhārī, Muslim",
  },
  {
    id: "dl-intimacy",
    title: {
      fr: "Avant l'intimité conjugale",
      en: "Before marital intimacy",
      ar: "دعاء الجماع",
      ru: "Перед супружеской близостью",
    },
    arabic:
      "بِسْمِ اللَّهِ، اللَّهُمَّ جَنِّبْنَا الشَّيْطَانَ، وَجَنِّبِ الشَّيْطَانَ مَا رَزَقْتَنَا.",
    transliteration:
      "Bismi Llāh, Allāhumma jannibnā sh-shayṭān, wa jannibi sh-shayṭāna mā razaqtanā.",
    transliterationRu:
      "Би-сми-Лляхи! Аллахумма джаннибна-ш-шайтан, ва джанниби-ш-шайтана ма разактана!",
    translations: {
      fr: "Au nom d'Allāh ! Ô Allāh, éloigne de nous Satan, et éloigne Satan de ce que Tu nous accorderas.",
      en: "In the name of Allāh! O Allāh, keep Satan away from us, and keep Satan away from what You will grant us.",
      ar: "بسم الله، اللهم جنبنا الشيطان، وجنب الشيطان ما رزقتنا.",
      ru: "Во имя Аллаха! О Аллах! Удали сатану от нас и от того, чем Ты наделил нас!",
    },
    source: "Bukhārī",
  },
];

/* ────────────────────────────────────────────────────────────── */

export const AZKAR_CATEGORIES: AzkarCategory[] = [
  {
    id: "morning",
    title: {
      fr: "Adhkār du matin",
      en: "Morning adhkār",
      ar: "أذكار الصباح",
      ru: "Утренние азкары",
    },
    description: {
      fr: "Récités après la prière du Fajr, jusqu'au lever du soleil.",
      en: "Recited after Fajr prayer, until sunrise.",
      ar: "تُقال بعد صلاة الفجر حتى طلوع الشمس.",
      ru: "Читаются после утренней молитвы до восхода солнца.",
    },
    items: MORNING,
  },
  {
    id: "evening",
    title: {
      fr: "Adhkār du soir",
      en: "Evening adhkār",
      ar: "أذكار المساء",
      ru: "Вечерние азкары",
    },
    description: {
      fr: "Récités après la prière du ʿAṣr, jusqu'au coucher du soleil.",
      en: "Recited after ʿAṣr prayer, until sunset.",
      ar: "تُقال بعد صلاة العصر حتى غروب الشمس.",
      ru: "Читаются после послеполуденной молитвы до заката.",
    },
    items: EVENING,
  },
  {
    id: "after-prayer",
    title: {
      fr: "Après la prière",
      en: "After prayer",
      ar: "أذكار بعد الصلاة",
      ru: "После молитвы",
    },
    description: {
      fr: "Récités après les cinq prières obligatoires.",
      en: "Recited after the five obligatory prayers.",
      ar: "تُقال دبر الصلوات الخمس.",
      ru: "Читаются после пяти обязательных молитв.",
    },
    items: AFTER_PRAYER,
  },
  {
    id: "daily-life",
    title: {
      fr: "Situations de la vie",
      en: "Daily situations",
      ar: "أذكار اليوم والليلة",
      ru: "Повседневные ситуации",
    },
    description: {
      fr: "Vêtements, toilettes, ablutions, maison, mosquée, adhan, repas, voyage…",
      en: "Clothing, toilet, ablution, home, mosque, adhān, meals, travel…",
      ar: "الملابس، الخلاء، الوضوء، البيت، المسجد، الأذان، الطعام، السفر…",
      ru: "Одежда, уборная, омовение, дом, мечеть, азан, еда, путешествие…",
    },
    items: DAILY_LIFE,
  },
];

export function getAzkarCategory(id: string): AzkarCategory | undefined {
  return AZKAR_CATEGORIES.find((c) => c.id === id);
}
