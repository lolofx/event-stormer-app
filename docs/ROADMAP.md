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
| 9b | Resize interactif des stickies | — | ⬜ |
| 10 | Export Markdown + Mermaid | — | ⬜ |
| 11 | Garde-fou nouveau workshop + import JSON | — | ⬜ |
| 12 | Azure SWA + Lighthouse CI | — | ⬜ |

## Étape 9 — Progression des niveaux

`features/workshop/` : `level-unlock.service.ts` + `level-selector.component.ts`

- Bouton "Débloquer Process Level" → `MatDialog` confirmation → `processUnlocked + activeLevel = Process`
- Idem Design Level (uniquement si Process débloqué)
- `segmented-control` pour bascule entre niveaux débloqués
- Pulse discret au déblocage, état persisté (RM13–RM15)
- ADR `0005-progressive-level-unlock.md`

## Étape 9b — Resize interactif des stickies

Tous les stickies seront redimensionnables. Le BoundedContext en est le cas prioritaire (sinon la détection géométrique à l'export est inutilisable).

**Approche générique** : poignées de resize sur les 4 coins et 4 bords, drag natif SVG (pas de CDK — le canvas est SVG).

`features/canvas/` :

- `resize-handle.component.ts` : 8 poignées SVG `<rect>` invisibles (hitbox) + visible au hover/select
- `canvas.component.ts` : détecter `mousedown` sur poignée → `mousemove` → `mouseup` pour calculer `Δwidth`/`Δheight` en coordonnées canvas
- `WorkshopStore.resizeSticky(id, width, height)` → `domain/workshop.ts` `resizeSticky()`
- Contrainte : taille minimum 80×60 px pour tous types ; BoundedContext min 200×140 px
- Rotation préservée (RM16) — le resize ne doit pas recalculer la rotation
- Persistance : RM08 (debounce 500 ms)
- Tests : spec domain `resizeSticky`, spec store, spec canvas (resize events)

**Note** : `BC_DEFAULT_WIDTH = 400 / BC_DEFAULT_HEIGHT = 280` — taille par défaut déjà fixée à la création pour que la détection géométrique fonctionne avant implémentation du resize.

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

## Pièges actifs (étapes 9b–12)

- **Mermaid déterministe** : tri stable X → Y → id, sanitiser labels (parenthèses, guillemets, retours ligne)
- **BoundedContext géométrique** : O(n²) ok ≤ 150 stickies — commenter l'algo de détection
- **API Fullscreen** : interaction utilisateur explicite requise, fallback si refusée
- **Rotation non persistée** : RM16 — stocker à la création, jamais recalculer
- **Resize SVG** : coordonnées canvas (tenir compte du zoom/pan), pas de coordonnées écran brutes
- **Resize + rotation** : un sticky rotaté a son système de coordonnées local — le resize doit opérer dans l'espace non-rotaté puis réappliquer la rotation
