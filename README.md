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

| Étape | Statut |
|---|---|
| Angular 21 init | ✅ mergé |
| Tailwind + tokens + Geist | ✅ mergé |
| Angular Material minimal | ✅ mergé |
| Domain layer TDD (RM01-RM16) | ✅ mergé |
| CI GitHub Actions | ✅ actif |
| Dexie persistence | ⏳ à venir |
| Canvas SVG + pan/zoom | ⏳ à venir |
| UI components + dock | ⏳ à venir |
| Azure Static Web Apps | ⏳ après canvas |

## Documentation

- [Spécification fonctionnelle](docs/SPEC.md)
- [Plan de bootstrap](docs/BOOTSTRAP.md)
- [Décisions d'architecture](docs/adr/)

## CI/CD

GitHub Actions — CI verte requise avant tout merge sur `main`.
Azure Static Web Apps — déploiement configuré à l'étape 12 (après canvas).
