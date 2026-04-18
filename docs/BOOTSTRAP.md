# EventStormer — Plan de bootstrap Claude Code

> Document compagnon de `SPEC.md` v1.2. Plan d'install, structure, prompts, CI/CD.

## Sommaire

- [0. Avant de démarrer (à faire ensemble)](#0-avant-de-démarrer-à-faire-ensemble)
- [1. Pré-requis et environnement](#1-pré-requis-et-environnement)
- [2. Skills et MCP à activer](#2-skills-et-mcp-à-activer)
- [3. Phase d'install](#3-phase-dinstall)
- [4. Structure cible du repo](#4-structure-cible-du-repo)
- [5. Conventions de travail](#5-conventions-de-travail)
- [6. Séquence de bootstrap (prompts Claude Code)](#6-séquence-de-bootstrap-prompts-claude-code)
- [7. Stratégie TDD](#7-stratégie-tdd)
- [8. CI/CD GitHub → Azure Static Web Apps](#8-cicd-github--azure-static-web-apps)
- [9. Pièges identifiés à anticiper](#9-pièges-identifiés-à-anticiper)

---

## 0. Avant de démarrer (à faire ensemble)

Cette étape est **interactive** et se fait en session Claude Code avant tout commit. Elle harmonise ce projet avec tes conventions déjà éprouvées.

### 0.1 Récupération du CLAUDE.md de référence

Le fichier `CLAUDE.md` fourni avec ce bootstrap est **autonome et fonctionnel**, mais tu souhaites t'aligner sur les conventions utilisées dans **devnotes-garden-app** (ou tout autre projet de référence).

**Action** : en début de session Claude Code, fournir le chemin du projet `devnotes-garden-app` et demander à Claude :

```
J'aimerais aligner le CLAUDE.md de ce projet sur celui de devnotes-garden-app.
Le chemin est : <CHEMIN_ABSOLU_DEVNOTES_GARDEN_APP>
Analyse le CLAUDE.md de ce projet de référence et propose une synthèse :
- Conventions rtk confirmées (commandes préfixées)
- Structure de sections retenue
- Hooks, skills ou rules déjà utilisés qui seraient pertinents ici
- Formulations de règles que je veux réutiliser mot pour mot
Puis fais un diff avec le CLAUDE.md actuel d'EventStormer et propose un patch.
Garde strictement sous 200 lignes.
```

Si le projet de référence n'est pas accessible, **le CLAUDE.md fourni reste valide et utilisable en l'état**.

### 0.2 Validation des skills et MCP

- `po-spec`, `rodin`, `frontend-design` chargés côté Claude Code
- `Context7`, `Mermaid Chart`, `GitHub` activés et testés

### 0.3 Vérifications environnement
- `rtk node -v` (≥ 20 LTS)
- `rtk npx @angular/cli version` (doit permettre de créer Angular 21)
- Accès GitHub (repo à créer)
- Accès Azure (Static Web App à créer pour récupérer le deployment token)

### 0.4 Premier commit
Fichiers racine : `CLAUDE.md`, `.gitignore`, `README.md` (squelette).
Fichiers `docs/` : `SPEC.md`, `BOOTSTRAP.md`.
Commit : `chore: bootstrap project with specs and claude instructions`.

## 1. Pré-requis et environnement

- **Node.js** 20 LTS minimum
- **Angular CLI** via `npx`
- **Git** + compte GitHub
- **Azure account** avec Static Web App (tier Free)
- **Claude Code** installé localement

## 2. Skills et MCP à activer

### Skills

| Skill | Source | Rôle |
|---|---|---|
| `po-spec` | user | Référence pour `SPEC.md` |
| `rodin` | user | Remise en question architecturale ponctuelle |
| **`frontend-design`** | public | **Central** : consultation obligatoire avant chaque composant UI |

Si un skill manque côté utilisateur, il se trouve dans `~/.claude/skills/user/<nom>/SKILL.md`. Les skills publics sont automatiquement disponibles.

### MCP

| MCP | Pourquoi | Obligatoire ? |
|---|---|---|
| **Context7** | Doc Angular 21+, CDK, Material, Tailwind, Dexie à jour | Oui |
| **Mermaid Chart** | Archi + validation syntaxique des exports générés | Oui |
| **GitHub** | Workflows Actions, PR, issues | Recommandé |
| **aidesigner** | Génération d'UI HTML/Tailwind à la demande | **Non recommandé en v1** |

**Note sur aidesigner** : le MCP aidesigner est un générateur d'UI (HTML + Tailwind, OAuth, crédits). Pour ce projet à **écran unique** (canvas + dock + barre actions), le ROI est faible : il faudrait reconvertir l'HTML généré en composants Angular. Le skill `frontend-design` + `Context7` couvrent le besoin. À reconsidérer si v2 avec plusieurs écrans ou besoin de variations rapides.

## 3. Phase d'install

Voir §0 ci-dessus. Une fois la phase faite, passer à §4 (structure) puis §6 (séquence des prompts).

## 4. Structure cible du repo

```
eventstormer/
├── .github/
│   └── workflows/
│       ├── ci.yml
│       └── azure-deploy.yml
├── docs/
│   ├── SPEC.md
│   ├── BOOTSTRAP.md
│   ├── adr/
│   │   ├── 0001-signals-over-ngrx.md
│   │   ├── 0002-tailwind-first-material-minimal.md
│   │   ├── 0003-dexie-for-indexeddb.md
│   │   ├── 0004-no-implicit-links-in-export.md
│   │   ├── 0005-progressive-level-unlock.md
│   │   └── 0006-visual-direction-figma-like.md
│   └── architecture.md
├── public/
│   └── fonts/
│       ├── Geist-Regular.woff2
│       ├── Geist-Medium.woff2
│       └── Geist-SemiBold.woff2
├── src/
│   ├── app/
│   │   ├── domain/                           # pur TS, TDD
│   │   │   ├── workshop.ts
│   │   │   ├── sticky.ts
│   │   │   ├── viewport.ts
│   │   │   ├── level.ts
│   │   │   ├── level-unlock-state.ts
│   │   │   ├── sticky-type.ts
│   │   │   └── *.spec.ts
│   │   ├── core/
│   │   │   ├── persistence/
│   │   │   │   ├── workshop.repository.ts
│   │   │   │   ├── dexie-workshop.repository.ts
│   │   │   │   └── in-memory-workshop.repository.ts
│   │   │   ├── export/
│   │   │   │   ├── markdown-exporter.ts
│   │   │   │   ├── mermaid-builder.ts
│   │   │   │   └── json-exporter.ts
│   │   │   ├── import/
│   │   │   │   └── json-importer.ts
│   │   │   └── fullscreen/
│   │   │       └── fullscreen.service.ts
│   │   ├── shared/
│   │   │   ├── ui/
│   │   │   │   ├── dock/
│   │   │   │   ├── action-bar/
│   │   │   │   ├── pedagogy-tooltip/
│   │   │   │   ├── sticky-card/
│   │   │   │   ├── segmented-control/
│   │   │   │   └── editable-title/
│   │   │   └── pedagogy/
│   │   │       └── sticky-tooltips.ts        # data §8 SPEC
│   │   ├── features/
│   │   │   ├── canvas/
│   │   │   │   ├── canvas.component.ts
│   │   │   │   ├── canvas.store.ts
│   │   │   │   ├── coordinate-translator.ts
│   │   │   │   ├── background-grid.component.ts
│   │   │   │   └── sticky-renderer.component.ts
│   │   │   ├── palette/
│   │   │   │   └── palette-dock.component.ts
│   │   │   └── workshop/
│   │   │       ├── workshop.component.ts
│   │   │       ├── workshop.store.ts
│   │   │       ├── level-selector.component.ts
│   │   │       └── level-unlock.service.ts
│   │   ├── app.component.ts
│   │   ├── app.config.ts
│   │   └── app.routes.ts
│   ├── styles/
│   │   ├── tailwind.css
│   │   ├── tokens.css
│   │   ├── fonts.css
│   │   └── material-minimal-theme.scss
│   └── main.ts
├── angular.json
├── package.json
├── tailwind.config.ts
├── tsconfig.json
├── staticwebapp.config.json
├── CLAUDE.md
├── README.md
└── .gitignore
```

## 5. Conventions de travail

### Commandes préfixées `rtk`
Toutes les commandes shell commencent par `rtk`. Règle héritée de tes autres projets (voir `devnotes-garden-app`). Claude Code doit systématiquement respecter ce préfixe, le `CLAUDE.md` le rappelle en règle non négociable.

### Workflow Git
- `main` protégée
- Branches `feat/<nom>`, `fix/<nom>`
- PR obligatoire, CI verte avant merge, squash merge

### Documentation vivante
- Décision structurante → ADR dans `docs/adr/`
- Diagrammes en Mermaid, jamais d'image
- `README.md` à jour avec commandes dev/build/test/deploy

### Commentaires dans le code
- Pas de commentaire évident paraphrasant le code
- **Commenter systématiquement** les passages complexes : transformation coordonnées écran↔canvas, algos de tri stable pour l'export, piège CDK DragDrop+scale, détection géométrique BoundedContext, fallbacks de compat
- JSDoc pour les fonctions publiques du domain
- Les commentaires expliquent le **pourquoi**, pas le quoi

## 6. Séquence de bootstrap (prompts Claude Code)

Chaque étape = une branche Git + une PR. Utiliser le **plan mode** de Claude Code pour les étapes complexes (6-11).

### Étape 1 — Initialisation Angular 21
```
Crée un nouveau projet Angular 21 nommé eventstormer à la racine actuelle.
Configuration :
- zoneless (provideZonelessChangeDetection) par défaut
- standalone uniquement (pas de NgModule)
- SCSS
- routing activé
- pas de SSR (canvas incompatible avec le prérendu)
- strict mode TypeScript (+ strictTemplates)
- Vitest comme runner (natif v21)
Respecte angular.dev. Vérifie via Context7 MCP les providers exacts pour la v21.
Commit : "chore: initialize Angular 21 zoneless project"
```

### Étape 2 — Tailwind + tokens + fonts (AVANT Material)
```
Configure Tailwind et les fondations visuelles AVANT de toucher à Material (SPEC §9).

1. Installe Tailwind CSS, configure tailwind.config.ts avec :
   - Palette personnalisée (stickies, neutres, accents) de SPEC §9.2
   - Font family "geist" pointant sur var(--font-sans)
   - Shadows : shadow-sticky-rest, shadow-sticky-hover, shadow-dock
   - Border radius custom

2. Télécharge les .woff2 Geist dans public/fonts/ (Regular, Medium, SemiBold).
   Crée src/styles/fonts.css avec les @font-face.
   Vérifie la licence OFL de Geist.

3. Crée src/styles/tokens.css avec les CSS variables (SPEC §9.2 complet).

4. Import ordonné dans src/styles.scss :
   fonts.css → tokens.css → tailwind.css → material-minimal-theme.scss (vide)

5. Vérifie : app.component affiche "EventStormer" en Geist 600, fond --canvas-bg,
   grille radial-gradient en background-image.

Produit docs/adr/0006-visual-direction-figma-like.md.
Commit : "feat: setup Tailwind, design tokens and Geist typography"
```

### Étape 3 — Material minimaliste
```
Ajoute Angular Material UNIQUEMENT pour MatDialog et MatSnackBar.
Thème Material 3 minimaliste dans material-minimal-theme.scss :
- Pas de couleur primaire "produit" Material (dialogs/snackbars = surfaces neutres)
- Override variables Material avec les tokens de l'étape 2
- Désactive les couleurs par défaut Material 3 violettes

ADR 0002-tailwind-first-material-minimal.md.
Commit : "feat: integrate minimal Material theme for dialogs only"
```

### Étape 4 — Domain layer (TDD strict)
```
Implémente src/app/domain/ selon SPEC §6. TDD strict, spec AVANT implémentation.
- Pur TypeScript, zéro import Angular
- Vitest, couverture 95 %+
- Factory functions + readonly

Ordre :
1. sticky-type.ts + level.ts (enums)
2. level-unlock-state.ts + .spec.ts (RM13-RM15)
3. viewport.ts + .spec.ts
4. sticky.ts + .spec.ts (rotation ±2° à la création, RM16)
5. workshop.ts + .spec.ts (CRUD stickies, déblocage niveaux, bascule)

Tester RM01-RM16 explicitement par tests nommés.
Commentaires JSDoc sur les fonctions publiques.
Commit par cycle TDD : "test: ...", "feat: ..."
```

### Étape 5 — Persistance Dexie + fallback
```
core/persistence/ :
- Interface WorkshopRepository (save, load, clear)
- DexieWorkshopRepository (schemaVersion=1)
- InMemoryWorkshopRepository (fallback incognito)
- Factory choisissant l'impl
- Tests intégration avec fake-indexeddb
- MatSnackBar pour alerter si fallback mémoire actif
Commentaires sur la stratégie de fallback.
ADR 0003-dexie-for-indexeddb.md
```

### Étape 6 — Canvas SVG + grille + pan/zoom + fullscreen
```
features/canvas/ :
- canvas.component.ts : SVG plein écran, transform pan/zoom via signals
- background-grid.component.ts : radial-gradient CSS (pas SVG pattern)
- coordinate-translator.ts : conversion écran↔canvas, TESTÉ
- FullscreenService : wrapper API Fullscreen avec fallback
- Raccourcis clavier SPEC §3.6
- PIÈGE CDK DragDrop + transform scale : passer input `scale` au cdkDrag.
  COMMENTER cette subtilité dans le code.
Commenter les formules de transformation de coordonnées.
```

### Étape 7 — Composants UI custom (frontend-design obligatoire)
```
AVANT chaque composant, consulte le skill frontend-design.
Puis Context7 pour les API Angular utilisées (CDK Overlay notamment).

Implémente dans src/app/shared/ui/ (1 PR par composant) :
1. sticky-card/     — rendu sticky, rotation CSS, SPEC §9.6
2. dock/            — conteneur flottant, SPEC §9.4
3. pedagogy-tooltip/— CDK Overlay, contenu §8
4. action-bar/      — barre actions bas-droite
5. segmented-control/— sélecteur niveau style iOS
6. editable-title/  — nom workshop haut-gauche

Tests ciblés logique et accessibilité.
```

### Étape 8 — Palette dock pédagogique
```
features/palette/palette-dock.component.ts :
- Utilise shared/ui/dock
- Items draggables CDK
- pedagogy-tooltip au hover (data shared/pedagogy)
- Items verrouillés grisés + cadenas
- Animation fade-in à l'apparition des nouveaux items après déblocage
- Drop sur canvas → workshop.store avec rotation RM16
- Édition inline + focus auto
- Suppression Delete
```

### Étape 9 — Progression des niveaux
```
features/workshop/level-unlock.service.ts + level-selector.component.ts :
- Bouton "Débloquer Process Level" (icône clé)
- MatDialog confirmation explicative
- Validation → processUnlocked + activeLevel = Process
- Idem Design, accessible si Process débloqué
- segmented-control pour bascule entre débloqués
- Pulse discret au déblocage
ADR 0005-progressive-level-unlock.md
```

### Étape 10 — Export Markdown + Mermaid
```
core/export/ :
- mermaid-builder.ts : flowchart LR, SPEC §7.1-§7.2
  * Timeline DomainEvent tri X (tiebreaker Y puis id)
  * Subgraphs par type
  * classDef couleurs Brandolini
  * BoundedContext détection géométrique (commenter l'algo)
  * sanitizeMermaidLabel() avec tests
- markdown-exporter.ts : assemblage, nom kebab-case + YYYYMMDD
- json-exporter.ts : snapshot avec schemaVersion + levelUnlockState

Tests :
- Golden files Markdown (fixtures .md)
- Validation via MCP Mermaid Chart sur exemples générés
- Tri stable, sanitisation labels spéciaux
Ctrl+E déclenche.
```

### Étape 11 — Garde-fou nouveau workshop + import
```
UC-01 : MatDialog, bouton Créer désactivé tant qu'export non déclenché.
Après export → reset (LevelUnlockState réinitialisé : seul BigPicture).
UC-07 : file input, validation schéma, confirmation, remplacement atomique.
Raccourci Ctrl+N.
```

### Étape 12 — CI/CD
```
.github/workflows/ :
- ci.yml : checkout → node 20 → npm ci → lint → vitest coverage → build prod
- azure-deploy.yml : deploy main + preview PR
- Secret AZURE_STATIC_WEB_APPS_API_TOKEN
- Job Lighthouse CI
staticwebapp.config.json : navigationFallback, CSP stricte, X-Frame-Options DENY
```

## 7. Stratégie TDD

- **80 %** unitaires domain (Vitest pur)
- **15 %** services (Vitest + TestBed, providers mockés)
- **5 %** intégration composants (@angular/testing-library)
- Pas d'e2e v1

Cadence : red → green → refactor → commit par cycle.

Doubles : `vi.fn()`, `vi.mock()`, `fake-indexeddb` pour Dexie, golden files pour Mermaid + validation MCP.

## 8. CI/CD GitHub → Azure Static Web Apps

### ci.yml
1. Checkout → Setup Node 20
2. `rtk npm ci`
3. `rtk npx ng lint`
4. `rtk npx vitest run --coverage`
5. `rtk npx ng build --configuration=production`

### azure-deploy.yml
- main → prod, PR → preview env
- Action `Azure/static-web-apps-deploy@v1`
- Secret `AZURE_STATIC_WEB_APPS_API_TOKEN`

### staticwebapp.config.json
- `navigationFallback` → `index.html`
- CSP stricte, `X-Frame-Options: DENY`, `Referrer-Policy`

## 9. Pièges identifiés à anticiper

1. **CDK DragDrop + transform scale** : input `scale` au cdkDrag. Commenter en code.
2. **Coordonnées écran ↔ canvas** : `coordinate-translator.ts`, TDD.
3. **Zoneless + Dexie** : callbacks → signals explicites ou `runInInjectionContext`.
4. **Tailwind + Material** : Material scoped dialogs/snackbars. ADR-0002.
5. **Export Mermaid déterministe** : tri stable (X → Y → id).
6. **IndexedDB incognito** : fallback `InMemoryWorkshopRepository` + snackbar.
7. **Perf 150+ stickies** : signals + OnPush zoneless devraient suffire. Mesurer avant d'optimiser.
8. **Sanitisation Mermaid** : parenthèses, guillemets, retours ligne. Tests dédiés.
9. **BoundedContext géométrique** : O(n²) acceptable jusqu'à 150 stickies.
10. **Undo/Redo hors scope** : si tentant, améliorer précision drag/click.
11. **API Fullscreen restrictive** : interaction explicite requise.
12. **Tooltips verbeux parasitants** : augmenter délai si retour d'atelier négatif.
13. **Reverrouillage de niveau tentant** : non, RM14 immuable.
14. **Dock qui mange bas du canvas** : auto-hide, toggle `D`, position fixe v1.
15. **Geist local vs CDN** : local pour RGPD, vérifier licence OFL.
16. **Material 3 violet par défaut** : override OBLIGATOIRE sinon UI ressemble à démo.
17. **Rotation non persistée** : RM16, stocker à la création.
18. **Grille SVG pattern vs CSS** : CSS radial-gradient beaucoup plus perf.
19. **Skill frontend-design oublié** : chaque composant UI passe par ce skill. Sermon si oubli.
20. **CLAUDE.md sur-spécifié** : si > 200 lignes, Claude ignore. Garder dense.

---

**Prochaine étape concrète** : session Claude Code → §0 (récupération CLAUDE.md de devnotes-garden-app, validation skills/MCP) → §6 étape 1.
