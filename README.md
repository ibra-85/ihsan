# ☪️ Ihsan — Bibliothèque islamique numérique

> Plateforme de lecture et d'apprentissage du Coran et des sciences islamiques.
> PWA installable, fonctionne hors-ligne, 100 % de tes données restent sur ton appareil.

---

## ✨ Fonctionnalités

### 📚 Bibliothèque
- Catalogue de PDFs (Coran, apprentissage, tajwid, prières)
- Filtres **multi-sélection** par catégorie et par langue (panneau dédié)
- Recherche **cross-langue** : trouve un document via son titre dans n'importe quelle langue
- Pré-cache au survol — les PDFs s'ouvrent quasi-instantanément
- Page **détail** par document avec stats personnelles, progression et documents similaires

### 📖 Lecteur PDF
- Mode **paginé** (desktop) ou **scroll continu** (mobile par défaut)
- **Zoom** boutons, Ctrl+molette, **pinch-to-zoom** sur mobile
- **Vignettes** des pages dans une sidebar (sans re-parsing du PDF)
- **Recherche dans le texte** du PDF (Ctrl+F), résultats cliquables
- **Marque-pages** par page, regroupés par document
- **Notes** par page, exportables en `.txt`
- **Partage** de page via URL hash (`#p42`) + bouton copier le lien
- **Plein écran**, **streaming** progressif avec barre de téléchargement
- **Temps de lecture** comptabilisé automatiquement
- Fond du viewer adapté au thème clair / sombre

### ✏️ Dessin & annotations sur les PDFs
- **7 outils** : stylo, surligneur, ligne, flèche, rectangle, texte, gomme
- **6 couleurs**, 3 épaisseurs, 3 tailles de texte avec **gras / italique**
- Texte **WYSIWYG** : crée, ré-édite et déplace un bloc texte
- **Undo / Redo** (Ctrl+Z / Ctrl+Y) + historique de 60 états par page
- Coordonnées normalisées → les annotations **suivent le zoom**
- Persistance par page dans `localStorage`
- Marche en mode paginé **et** continu
- Export PNG des pages annotées (en cours)

### 🌍 Internationalisation
- **4 langues** d'interface : 🇫🇷 Français · 🇬🇧 English · 🇸🇦 العربية · 🇷🇺 Русский
- **RTL automatique** pour l'arabe (toute la mise en page bascule)
- Catalogue de documents traduit (titres + descriptions)
- Sélecteur de langue dans la navbar

### 🎨 Apparence
- Thème **clair / sombre / système**
- 5 couleurs d'**accent** (vert, bleu, violet, doré, rose)
- Polices : Inter (latin) + Amiri (arabe)
- Composants **shadcn/ui** preset *radix-nova*, Tailwind v4

### 💾 Données locales
- **Tout est stocké en `localStorage`** — aucun serveur, aucun compte
- Statistiques personnelles dans les paramètres (marque-pages, notes, docs lus, temps)
- **Export / import** d'une sauvegarde `.json` pour transférer ses données vers un autre navigateur ou appareil (fonctionne aussi sur smartphone)
- Suppressions ciblées (par type) ou réinitialisation totale

### 📱 PWA hors-ligne
- Installable sur mobile et desktop
- Service Worker avec stratégies de cache adaptées
- Continue de fonctionner sans connexion une fois les PDFs téléchargés

### 🔔 UX
- Dialogues de confirmation **shadcn/ui** (plus de `confirm()` natif)
- Notifications **Sonner** synchronisées au thème
- Toolbar du lecteur entièrement responsive, menu **⋯ More** sur mobile

---

## 🚀 Démarrage rapide

Prérequis : Node.js ≥ 20, npm.

```bash
git clone <repo>
cd quran-library
npm install
npm run dev
```

Ouvre [http://localhost:3000](http://localhost:3000).

### Variables d'environnement (optionnelles)

```bash
# .env.local
NEXT_PUBLIC_CDN_URL=https://cdn.ihsan-coran.fr/coran
```

Par défaut, les PDFs sont chargés depuis le CDN Cloudflare R2 configuré dans `src/lib/documents.ts`.

---

## 🏗️ Stack technique

| Couche | Outil |
|---|---|
| Framework | Next.js 15 (App Router, Turbopack) |
| Langage | TypeScript |
| Styles | Tailwind CSS v4 |
| UI | shadcn/ui — preset **radix-nova** |
| Icônes | `@hugeicons/react` + `@hugeicons/core-free-icons` |
| PDF | `react-pdf` v10 (worker via unpkg CDN) |
| Polices | Inter + Amiri (`next/font/google`) |
| Notifications | `sonner` |
| Dialogs | `@radix-ui/react-alert-dialog` + provider custom |
| i18n | `LanguageProvider` custom + dictionnaires statiques |
| Hébergement PDF | Cloudflare R2 (CDN) |
| PWA | Service Worker custom + manifest |
| Persistance | `localStorage` (clés `ql-*`) |

---

## 📁 Structure du projet

```
src/
├── app/
│   ├── layout.tsx                # ThemeProvider + LanguageProvider + ConfirmProvider + Sonner
│   ├── page.tsx                  # Shell vers library-content
│   ├── library-content.tsx       # Bibliothèque (filtres, recherche, cartes)
│   ├── bookmarks/                # Page marque-pages (groupés par document)
│   ├── settings/                 # Paramètres : thème, accent, données, sauvegarde
│   ├── doc/[id]/                 # Page détail d'un document
│   └── reader/[id]/              # Lecteur PDF plein écran (sans navbar)
│
├── components/
│   ├── navbar.tsx                # Navigation principale + sélecteur de langue
│   ├── theme-provider.tsx        # Thème clair/sombre/système + accents
│   ├── i18n-provider.tsx         # Provider de traductions, dir/lang sur <html>
│   ├── confirm-provider.tsx      # useConfirm() impératif (remplace confirm())
│   ├── sonner-toaster.tsx        # Toaster synchronisé au thème
│   ├── pwa-register.tsx          # Enregistrement du SW (prod uniquement)
│   ├── ui/                       # shadcn : button, card, popover, dialog, select…
│   └── reader/
│       ├── pdf-reader.tsx        # Composant lecteur complet
│       ├── pdf-reader-client.tsx # Wrapper dynamic ssr:false
│       ├── drawing-layer.tsx     # Canvas overlay (dessin + texte)
│       └── drawing-toolbar.tsx   # Barre d'outils flottante de dessin
│
└── lib/
    ├── documents.ts              # Catalogue (titres/descriptions multilingues)
    ├── i18n.ts                   # Locales, helpers RTL
    ├── dictionaries/             # fr.ts, en.ts, ar.ts, ru.ts
    ├── store.ts                  # localStorage : bookmarks, notes, progression, export/import
    ├── annotations.ts            # Modèle dessin (Stroke, TextNote, PageAnnotations)
    ├── draw-render.ts            # Fonctions de rendu canvas (partagées layer ↔ export)
    └── utils.ts                  # cn()
```

---

## 🛣️ Roadmap

- [x] **Phase 1–7** — Infrastructure, bibliothèque, lecteur, marque-pages, notes, paramètres, PWA, URL hash, recherche texte, RTL
- [x] **Phase 8** — Dessin / annotations (set complet + texte)
- [x] **Phase 9** — Dialogs shadcn, toasts Sonner, export/import des données
- [x] **Phase 10** — Internationalisation FR/EN/AR/RU + RTL global + catalogue traduit
- [x] **Phase 11** — Export PNG des pages annotées (rendu partagé via `lib/draw-render.ts`)
- [ ] **Phase 12** — Cours d'apprentissage de l'arabe (tout âge, ludique, audio)
- [ ] **Phase 13** — Mode bloc-notes · traduction inline du texte arabe · stats avancées

---

## 📄 Licence

Projet personnel — usage libre dans le respect des contenus religieux référencés.