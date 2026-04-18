# EventStormer — Instructions Claude Code

Outil web de projection pour animateur DDD pilotant un atelier Event Storming.
Angular 21 zoneless, 100 % frontend, déployé sur Azure Static Web Apps.

**Contexte complet** : @docs/SPEC.md (spec fonctionnelle) — @docs/BOOTSTRAP.md (plan bootstrap)

## Stack

Angular 21 (zoneless, standalone, signals) · Tailwind CSS · Angular Material (minimal : MatDialog + MatSnackBar uniquement) · Angular CDK DragDrop + Overlay · Dexie.js (IndexedDB) · Vitest · Geist typography (local).

## Règles non négociables

- **Toutes les commandes bash/PowerShell préfixées par `rtk`** (alias local, convention projet). Exemple : `rtk npm ci`, `rtk npx ng serve`, `rtk git commit`.
- **TDD strict** : red → green → refactor → commit. Pas de code de `domain/` sans spec Vitest écrite AVANT.
- **Signals uniquement** pour le state : `signal()`, `computed()`, `effect()`. Jamais de `BehaviorSubject`, jamais de NgRx.
- **Standalone uniquement**. Pas de `NgModule`.
- **Zoneless**. Pas d'import `zone.js`, pas de `provideZoneChangeDetection`.
- **Domain layer pur** (`src/app/domain/`) : aucun import Angular, uniquement TypeScript.
- **Respect strict angular.dev** : control flow `@if`/`@for`/`@switch`, `input()`, `output()`, `model()`, `computed()`, `inject()`.
- **Commits conventionnels** : `feat:`, `fix:`, `test:`, `refactor:`, `docs:`, `chore:`.
- **Architecture as code** : tous les diagrammes en Mermaid dans les `.md`, jamais d'images.

## Direction visuelle (critique)

Inspiration : **Figma / Linear / Excalidraw / tldraw**. Minimalisme précis + touche tactile discrète.
Détails complets dans SPEC §9. Les points critiques :

- Thème clair uniquement en v1. Canvas `#FAFAF7`, grille de points discrète.
- Typographie **Geist** chargée localement (fichiers `.woff2` dans `public/fonts/`), jamais de CDN Google Fonts.
- Canvas plein écran. **Dock flottant en bas** (style macOS, pinned par défaut). Barre actions en bas-droite.
- Stickies avec rotation aléatoire ±2° fixée à la création (RM16).
- **Tout en Tailwind custom**. Material réservé aux dialogs/snackbars uniquement, thème personnalisé (pas de Material 3 violet par défaut).

## Anti-patterns à éviter absolument

- UI qui ressemble à une démo Angular Material générique (toolbar en haut, drawer latéral, cards empilées).
- Utilisation de `Inter`, `Roboto`, `Arial` (cf skill frontend-design). Geist uniquement.
- Couleurs Material 3 violettes par défaut.
- `matTooltip` natif pour les tooltips pédagogiques → utiliser CDK Overlay avec popover custom (SPEC §8).
- `any` en TypeScript. Si un type est difficile, créer une interface dédiée.
- Commentaires évidents du type `// increment counter`. Commenter uniquement les passages complexes (maths de transformation canvas, algorithmes de tri, astuces non évidentes).

## Skills à consulter systématiquement

- **frontend-design** *(public)* — **Obligatoire avant chaque composant UI**. Sans consultation, tu produiras du générique.
- **po-spec** *(user)* — Référence pour la spec, utile si évolution fonctionnelle.
- **rodin** *(user)* — Remise en question architecturale sur décision structurante.

## MCP à utiliser

- **Context7** — Vérifier les signatures API Angular 21 actuelles avant toute utilisation (providers, CDK DragDrop, Material, Tailwind, Dexie). Mes connaissances peuvent être datées.
- **Mermaid Chart** — Validation syntaxique des diagrammes générés par l'export avant commit.
- **GitHub** *(si connecté)* — Création PR, workflows, issues.

Note sur **aidesigner** MCP : pas nécessaire en v1. Le skill frontend-design + Context7 suffisent pour une UI à écran unique comme celle-ci. À considérer uniquement si évolution v2 avec plusieurs écrans.

## Commandes projet

- `rtk npm ci` — install
- `rtk npx ng serve` — dev server
- `rtk npx vitest` — tests en watch (TDD)
- `rtk npx vitest run --coverage` — tests one-shot avec couverture
- `rtk npx ng lint` — lint
- `rtk npx ng build --configuration=production` — build prod
- `rtk git checkout -b feat/<nom>` — nouvelle branche feature

## Workflow

1. Toute nouvelle fonctionnalité = branche `feat/<nom>`, PR avec CI verte avant merge.
2. Avant d'écrire du code domain : écrire la spec Vitest, la voir échouer, implémenter, refactorer.
3. Avant d'écrire un composant UI : consulter frontend-design skill, puis Context7 pour les API Angular utilisées.
4. Avant de commit un export Mermaid : valider via MCP Mermaid Chart.
5. Toute décision structurante : produire un ADR dans `docs/adr/NNNN-titre.md`.
6. Si une convention du code surprend : la documenter dans ce CLAUDE.md (feedback loop).

## Commentaires dans le code

- Pas de commentaire évident paraphrasant le code.
- **Commenter systématiquement** : la logique de transformation coordonnées écran↔canvas, les algos de tri à tiebreaker (export Mermaid), le piège CDK DragDrop+scale, la détection géométrique BoundedContext, les fallback de compatibilité (IndexedDB incognito, API Fullscreen).
- Format : JSDoc pour les fonctions publiques du domain, commentaire inline pour les passages complexes.
- Les commentaires expliquent **le pourquoi**, jamais le quoi.

## Ergonomie cible

- Lisibilité à 3-5 m sur vidéoprojecteur (stickies dimensionnés en conséquence).
- Contraste WCAG AAA sur stickies, AA minimum partout ailleurs.
- Raccourcis clavier prioritaires (voir SPEC §3.6) : `F`, `Espace+drag`, `Ctrl+E`, `Ctrl+N`, `D`.
- Mode plein écran via touche `F` (UC-09).

## Ce que tu fais quand je te demande quelque chose d'ambigu

Demande avant d'agir. Scope l'investigation étroitement. Ne lis pas 30 fichiers pour "comprendre le contexte" — utilise les specs dans `docs/`. Si une spec manque ou est ambiguë, dis-le et pose une question ciblée.

## Rappels Claude Code

- Utilise `/clear` entre deux tâches indépendantes pour garder le contexte propre.
- Utilise le **plan mode** avant les tâches complexes de l'étape 6 à 11 du BOOTSTRAP.
- Si tu écris > 50 lignes de code d'un coup, reviens au TDD : tu as probablement sauté l'étape test.
- Si tu reproduis une erreur récurrente malgré ce fichier, signale-la et on ajoute une règle ici.
