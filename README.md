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
rtk npx ng serve

# Tests
rtk npx vitest run
rtk npx vitest run --coverage

# Build production
rtk npx ng build --configuration=production

# Lint
rtk npx ng lint
```

## Documentation

- [Spécification fonctionnelle](docs/SPEC.md)
- [Plan de bootstrap](docs/BOOTSTRAP.md)
- [Décisions d'architecture](docs/adr/)

## Déploiement

Azure Static Web Apps — CI/CD via GitHub Actions.
