# EventStormer — Instructions Claude Code

Outil web de projection pour animateur DDD pilotant un atelier Event Storming.
Angular 21 zoneless, 100 % frontend, déployé sur Azure Static Web Apps.

**Contexte complet** : @docs/SPEC.md (spec fonctionnelle) — @docs/BOOTSTRAP.md (plan bootstrap)

## Environnement

- **OS** : WSL2 (Linux) — syntaxe bash Unix, jamais PowerShell
- **Python** : Python 3.12 disponible (`/usr/bin/python3`) si besoin ponctuel
- **gh CLI** : disponible nativement dans WSL (`/usr/bin/gh`), aucun export PATH nécessaire
- **rtk** : préfixe obligatoire sur toutes les commandes (`rtk npm ci`, `rtk git status`…). **Exception : `npx` — utiliser directement sans rtk.**

## Stack

Angular 21 (zoneless, standalone, signals) · Tailwind CSS · Angular Material (MatDialog + MatSnackBar uniquement) · Angular CDK DragDrop + Overlay · Dexie.js · Vitest · Geist (local).

## Règles non négociables

- **TDD strict** : red → green → refactor → commit. Jamais de code `domain/` sans spec écrite avant.
- **Signals uniquement** : `signal()`, `computed()`, `effect()`. Jamais `BehaviorSubject`, jamais NgRx.
- **Standalone uniquement**. Pas de `NgModule`.
- **Zoneless**. Pas de `zone.js`, pas de `provideZoneChangeDetection`.
- **Domain layer pur** (`src/app/domain/`) : zéro import Angular, TypeScript uniquement.
- **Angular.dev strict** : `@if`/`@for`/`@switch`, `input()`, `output()`, `model()`, `inject()`.
- **Commits conventionnels** : `feat:`, `fix:`, `test:`, `refactor:`, `docs:`, `chore:`.
- **Architecture as code** : diagrammes Mermaid dans `.md`, jamais d'images.

## TypeScript strict

Flags obligatoires dans `tsconfig.json` :
`strict`, `noImplicitAny`, `strictNullChecks`, `noUncheckedIndexedAccess`,
`noImplicitOverride`, `noFallthroughCasesInSwitch`, `noImplicitReturns`.

Interdits absolus : `any`, `as Foo` (sauf narrowing de `unknown`), `@ts-ignore`, `@ts-expect-error`.

## Conventions de nommage

| Élément | Convention | Exemple |
|---|---|---|
| Fichiers | `kebab-case.ts` | `sticky-type.ts` |
| Classes/Interfaces | `PascalCase` | `Workshop`, `StickyType` |
| Signals | `camelCase` sans suffixe | `stickies`, pas `stickies$` |
| Tests `it()` | `should [comportement] when [condition]` | `should reject empty label when saving` |
| Constantes | `SCREAMING_SNAKE_CASE` | `MAX_ZOOM` |

## TDD (Vitest)

Fichier `.spec.ts` à côté du fichier testé. Coverage cible ≥ 80 % sur `domain/`.
Mocks via `vi.fn()` / `vi.spyOn()`. `fake-indexeddb` pour Dexie. Golden files pour Mermaid.

## Direction visuelle (critique)

Inspiration : **Figma / Linear / Excalidraw / tldraw**. Minimalisme précis + touche tactile discrète.
Détails complets dans SPEC §9. Points critiques :

- Thème clair uniquement v1. Canvas `#FAFAF7`, grille de points discrète.
- Typographie **Geist** locale (`public/fonts/*.woff2`), jamais CDN Google Fonts.
- Canvas plein écran. Dock flottant en bas (style macOS). Barre actions bas-droite.
- Stickies : rotation aléatoire ±2° fixée à la création (RM16).
- **Tout en Tailwind custom**. Material = dialogs/snackbars uniquement, thème personnalisé.

## Anti-patterns à éviter

- UI ressemblant à une démo Angular Material (toolbar en haut, drawer latéral, cards empilées).
- Polices `Inter`, `Roboto`, `Arial` — Geist uniquement.
- Couleurs Material 3 violettes par défaut (override obligatoire).
- `matTooltip` natif → CDK Overlay + popover custom (SPEC §8).
- Commentaires évidents paraphrasant le code.

## Interdictions fermes

Ne jamais : `NgModule`, `*ngIf`/`*ngFor`, `@Input()`/`@Output()` décorateurs, code sans test préalable,
commit avec tests rouges, `any`, `@ts-ignore`, `--no-verify`, nouvelle dépendance sans validation.

## Langue

- Code, commentaires, noms de variables : **anglais**
- Commits (messages clairs et bref, sans signature), documentation projet, messages utilisateur : **français**

## Skills

- **`frontend-design`** — obligatoire avant chaque composant UI. Sans consultation = résultat générique.
- **`po-spec`** — si évolution fonctionnelle.
- **`rodin`** — si décision architecturale structurante.

## MCP

- **Context7** — signatures API Angular 21, CDK, Material, Tailwind, Dexie avant utilisation.
- **Mermaid Chart** — validation syntaxique des exports avant commit.
- **GitHub** — PR, workflows, issues (si connecté).

## Commandes projet

```bash
rtk npm ci                                                              # install
rtk npm start                                                           # dev
rtk npm run test:watch                                                  # watch (TDD)
rtk npm test                                                            # one-shot
rtk npm run test:coverage                                               # one-shot + coverage
rtk npm run lint && rtk npm test && rtk npm run build:prod              # pré-commit
```

## Workflow

1. Nouvelle fonctionnalité = branche `feat/<nom>`, PR avec CI verte avant merge (merge = toi).
2. Domain : spec Vitest d'abord, voir échouer, implémenter, refactorer.
3. Composant UI : skill `frontend-design` → Context7 pour APIs Angular → implémentation.
4. Export Mermaid : valider via MCP Mermaid Chart avant commit.
5. Décision structurante → ADR dans `docs/adr/NNNN-titre.md`.

## Commentaires dans le code

Commenter **uniquement** : coordonnées écran↔canvas, algos de tri (export Mermaid), piège CDK DragDrop+scale,
détection géométrique BoundedContext, fallbacks IndexedDB incognito / API Fullscreen.
JSDoc sur fonctions publiques du domain. Expliquer le **pourquoi**, jamais le quoi.

## Ce que tu fais quand je suis ambigu

Demande avant d'agir. Utilise les specs dans `docs/`. Ne lis pas 30 fichiers pour "comprendre le contexte".

## Rappels

- `/clear` entre deux tâches indépendantes.
- Plan mode avant les étapes complexes (6-11 du BOOTSTRAP) MAIS EN RESTANT PRAGMATIQUE, il faut le plan oui, mais peut-être pas toute l'implémentation au cas où des changements arriveraient.
- > 50 lignes d'un coup sans test préalable = retour au TDD.
- Erreur récurrente malgré ce fichier → signaler pour ajouter une règle ici.
