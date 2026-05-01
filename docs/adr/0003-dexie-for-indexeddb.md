# ADR 0003 — Dexie.js pour la persistance IndexedDB

**Statut** : Accepté | **Date** : 2026-04-30

## Contexte

EventStormer est 100 % frontend, sans backend. La persistance locale (RM08) doit survivre aux rechargements de page. L'API IndexedDB native est verbeux ; une abstraction est nécessaire.

## Décision

Utiliser **Dexie.js** comme couche d'abstraction sur IndexedDB.

## Alternatives considérées

| Option | Raison du rejet |
|---|---|
| API IndexedDB native | API callback/event-based, boilerplate important, gestion d'erreurs fragile |
| localStorage | Limité à ~5 Mo, synchrone (bloque le thread), sérialisation manuelle |
| localForage | Maintenance ralentie, abstraction plus floue que Dexie |
| OPFS | Trop bas-niveau, aucun bénéfice pour un seul objet |

## Conséquences

**Positives**
- API Promise native, typée avec TypeScript
- Support du versioning de schéma (`db.version(N).stores(...)`) pour les migrations futures
- `fake-indexeddb` permet des tests d'intégration réels sans browser (injectée via constructeur)
- Bundle additionnel ~20 Ko gzip, acceptable pour la cible < 300 Ko

**Négatives / risques**
- Dépendance externe supplémentaire
- En navigation privée, IndexedDB peut être bloqué (SecurityError) → fallback `InMemoryWorkshopRepository` avec snackbar d'avertissement

## Architecture retenue

```
WorkshopRepository (interface)
  ├── DexieWorkshopRepository   — production (IndexedDB via Dexie)
  └── InMemoryWorkshopRepository — fallback incognito / tests unitaires

WorkshopPersistenceService (Angular)
  — détecte la disponibilité d'IndexedDB au démarrage
  — expose repository + signal usingFallback
  — affiche MatSnackBar si fallback actif
```

Schéma Dexie version 1 : table `workshops`, clé `_key` fixe `"current"` (un seul workshop actif, RM01).
