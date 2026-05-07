# ADR 0005 — Progressive Level Unlock

**Date** : 2026-05-07  
**Statut** : Accepté  
**Étape** : 9

## Contexte

Event Storming se pratique en trois niveaux de profondeur : Big Picture, Process Level, Design Level. Présenter d'emblée tous les types de stickies (8) surcharge les débutants et nuit au déroulement pédagogique de l'atelier.

## Décision

Progression unidirectionnelle par confirmation explicite (MatDialog) :

1. **Big Picture** actif au démarrage — seul `DomainEvent` est draggable (RM13).
2. **Process Level** débloqué via bouton dédié → confirmation → `processUnlocked = true + activeLevel = ProcessLevel`. Ajoute Command, Actor, Policy, ExternalSystem.
3. **Design Level** débloqué uniquement si Process est débloqué → idem. Ajoute Aggregate, ReadModel, BoundedContext.

Les niveaux débloqués restent accessibles pour toujours (RM14). La bascule entre niveaux débloqués se fait via un segmented control 3 pills dans le dock. Les stickies ne sont jamais supprimés lors d'un changement de niveau (RM03).

Les types verrouillés restent visibles dans le dock, grisés avec icône cadenas (signal visuel sans gating technique).

## Alternatives rejetées

- **Gating technique** (masquer complètement les types non disponibles) : crée de la confusion sur ce qui existe. Rejeté — c'est un nudge pédagogique, pas une restriction.
- **Unlock automatique par seuil** (ex. "10 events posés → unlock Process") : trop opaque, l'animateur doit rester maître du rythme. Rejeté.
- **Sélecteur de niveau séparé du dock** : fragmente l'UI. Le dock est le point d'entrée naturel pour la gestion du niveau actif.

## Conséquences

- `WorkshopStore` expose `unlockProcess()`, `unlockDesign()`, `setActiveLevel()`.
- `LevelUnlockService` orchestre le dialogue de confirmation (MatDialog) avant mutation.
- `LevelSelectorComponent` : segmented control autonome, réutilisable, testable sans store.
- État persisté dans IndexedDB via `levelUnlockState` (RM15) et inclus dans l'export JSON.
- Pulse discret sur les boutons de déblocage — attire l'attention sans distraire.
