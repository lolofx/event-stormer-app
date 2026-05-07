# EventStormer

Outil web de projection pour animateur DDD pilotant un atelier Event Storming.
Angular 21 zoneless · Tailwind CSS · Azure Static Web Apps.

## Stack

- **Angular 21** — zoneless, standalone, signals
- **Tailwind CSS** — design tokens, typographie Geist locale
- **Angular Material** — MatDialog + MatSnackBar uniquement
- **Dexie.js** — persistance IndexedDB
- **Vitest** — tests unitaires TDD

## Commandes

```bash
# Développement
rtk npm start

# Tests (TDD)
rtk npm run test:watch

# Tests one-shot + coverage
rtk npm test
rtk npm run test:coverage

# Build production
rtk npm run build:prod

# Lint
rtk npm run lint
```

## État du projet

| # | Étape | État |
|---|---|---|
| 1–3 | Angular 21 + Tailwind + Material minimal | ✅ mergé |
| 4 | Domain layer TDD (RM01–RM16) | ✅ mergé |
| 4b | CI GitHub Actions | ✅ actif |
| 5 | Persistance Dexie + fallback InMemory | ✅ mergé |
| 6 | Canvas SVG + pan/zoom + fullscreen | ✅ mergé |
| 7 | Composants UI custom (sticky, dock, action-bar…) | ✅ mergé |
| 8 | Palette dock pédagogique + WorkshopStore | ⏳ PR #11 |
| 9 | Progression des niveaux | ⬜ à venir |
| 10 | Export Markdown + Mermaid | ⬜ à venir |
| 11 | Garde-fou nouveau workshop + import JSON | ⬜ à venir |
| 12 | Azure Static Web Apps + Lighthouse CI | ⬜ à venir |

## Documentation

- [Spécification fonctionnelle](docs/SPEC.md)
- [Plan de bootstrap](docs/BOOTSTRAP.md)
- [Décisions d'architecture](docs/adr/)

## CI/CD

GitHub Actions — CI verte requise avant tout merge sur `main`.
Azure Static Web Apps — déploiement configuré à l'étape 12 (après canvas).
