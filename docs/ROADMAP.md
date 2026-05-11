# EventStormer — Roadmap

## Progression

| # | Étape | PR | État |
|---|---|---|---|
| 1–3 | Init Angular 21, Tailwind, Material | — | ✅ |
| 4 | Domain layer TDD | #3 | ✅ |
| 4b | CI GitHub Actions | — | ✅ |
| 5 | Persistance Dexie + fallback | #8 | ✅ |
| 6 | Canvas SVG + pan/zoom + fullscreen | #9 | ✅ |
| 7 | Composants UI custom | #10 | ✅ |
| 8 | Palette dock pédagogique + WorkshopStore | #11 | ✅ |
| 9 | Progression des niveaux | #12 | ✅ |
| 9b | Resize interactif des stickies + démo | — | ✅ |
| 10 | Export Markdown + Mermaid | — | ✅ |
| 11 | Garde-fou nouveau workshop + import JSON | — | ⬜ |
| 12 | Azure SWA + Lighthouse CI | — | ⬜ |

## Étape 9 — Progression des niveaux

`features/workshop/` : `level-unlock.service.ts` + `level-selector.component.ts`

- Bouton "Débloquer Process Level" → `MatDialog` confirmation → `processUnlocked + activeLevel = Process`
- Idem Design Level (uniquement si Process débloqué)
- `segmented-control` pour bascule entre niveaux débloqués
- Pulse discret au déblocage, état persisté (RM13–RM15)
- ADR `0005-progressive-level-unlock.md`

## Étape 9b — Resize interactif des stickies ✅

Tous les stickies sont redimensionnables. Le BoundedContext en est le cas prioritaire (détection géométrique à l'export).

**Implémentation réelle** : 4 poignées SVG `<rect>` aux coins, directement dans `canvas.component.ts` (pas de composant séparé). Taille constante 8 px écran via `vector-effect="non-scaling-stroke"` + compensation zoom (`4 / viewport.zoom`).

`features/canvas/canvas.component.ts` :
- Poignées rendues pour le sticky sélectionné (hors mode édition), `nw/ne/se/sw`
- `onResizeStart` → `doResize` : Δ calculé en coordonnées canvas depuis les valeurs figées au mousedown ; ancre opposée fixe pour chaque coin
- `WorkshopStore.resizeSticky(id, x, y, width, height)` — inclut la position car NW/NE/SW déplacent l'origine

`domain/sticky.ts` : constantes `STICKY_MIN_WIDTH=80`, `STICKY_MIN_HEIGHT=60`, `BC_MIN_WIDTH=200`, `BC_MIN_HEIGHT=140` + helper `minStickyDimensions(type)`

`domain/workshop.ts` : `resizeSticky()` enforce les minima par type, préserve rotation (RM16)

**Comportements spécifiques BoundedContext** :
- Rotation fixée à 0° à la création (conteneur droit, RM16)
- Label aligné en haut à gauche (ne gêne pas les stickies intérieurs)
- Rendu en premier dans le groupe SVG (peintre model) → les autres stickies passent par-dessus et restent interactifs

**Note** : `BC_DEFAULT_WIDTH = 400 / BC_DEFAULT_HEIGHT = 280` — fix du `foreignObject` hardcodé 200×160 → dimensions réelles ; BC s'affiche maintenant à sa vraie taille dès la création.

**Bouton démo** (`domain/demo.ts`) : charge un scénario "Livraison de pizza" complet (3 BC × tous les types de stickies, niveaux Process + Design débloqués) si et seulement si le canvas est vide. Bouton ✨ dans la barre d'actions, disparaît dès le premier sticky posé.

## Étape 10 — Export Markdown + Mermaid

`core/export/` :

- `mermaid-builder.ts` : `flowchart LR`, tri `DomainEvent` par X (tiebreaker Y → id), subgraphs par type, `classDef` couleurs Brandolini, BoundedContext géométrique (commenter l'algo), `sanitizeMermaidLabel()` avec tests
- `markdown-exporter.ts` : assemblage, nom `<kebab-case>-<YYYYMMDD>.md`
- `json-exporter.ts` : snapshot avec `schemaVersion + levelUnlockState`
- Tests : golden files `.md`, validation MCP Mermaid Chart, tri stable, sanitisation labels spéciaux
- `Ctrl+E` déclenche — ADR `0004-no-implicit-links-in-export.md`

## Étape 11 — Garde-fou nouveau workshop + import

- UC-01 : `MatDialog`, export `.json` obligatoire avant reset, `LevelUnlockState` réinitialisé (`BigPicture` uniquement)
- UC-07 : file input, validation schéma JSON, confirmation, remplacement atomique
- Raccourci `Ctrl+N`

## Étape 12 — Azure SWA + Lighthouse

1. Créer ressource Azure SWA (plan gratuit), récupérer token
2. Secret `AZURE_STATIC_WEB_APPS_API_TOKEN` → GitHub repo secrets
3. `azure-deploy.yml` : push `main` → prod, PR → preview env
4. `staticwebapp.config.json` : `navigationFallback → index.html`, CSP stricte, `X-Frame-Options: DENY`, `Referrer-Policy`
5. Lighthouse CI ≥ 90 perf + accessibilité

## ADRs produits

| # | Titre | Étape |
|---|---|---|
| 0001 | signals-over-ngrx | 1 |
| 0002 | tailwind-first-material-minimal | 3 |
| 0003 | dexie-for-indexeddb | 5 |
| 0004 | no-implicit-links-in-export | 10 |
| 0005 | progressive-level-unlock | 9 |
| 0006 | visual-direction-figma-like | 2 |

## Pièges actifs (étapes 10–12)

- **Mermaid déterministe** : tri stable X → Y → id, sanitiser labels (parenthèses, guillemets, retours ligne)
- **BoundedContext géométrique** : O(n²) ok ≤ 150 stickies — commenter l'algo de détection
- **API Fullscreen** : interaction utilisateur explicite requise, fallback si refusée
- **Rotation non persistée** : RM16 — stocker à la création, jamais recalculer (BC = toujours 0°)
