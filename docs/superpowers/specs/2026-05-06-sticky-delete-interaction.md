# Spec — Suppression stickies & modèle d'interaction Figma

> Date : 2026-05-06 | Statut : Approuvé

## Contexte

Bug étape 8 : un clic sur un sticky entre immédiatement en mode édition, bloquant la touche `Suppr`. Le `@HostListener` Delete est court-circuité par la garde `if (this.editingId()) return`.

Solution : adopter le modèle Figma — clic simple = sélection, double-clic = édition — et ajouter un bouton × visible au hover pour la suppression via souris.

## Modèle d'interaction

| Geste | Avant | Après |
|---|---|---|
| Clic simple sur sticky | sélectionne + entre en édition | sélectionne uniquement (ring `2px #0a0a0a`) |
| Double-clic sur sticky | — | entre en mode édition (textarea focus) |
| `Suppr` / `Backspace` | bloqué (édition active) | supprime le sticky sélectionné |
| `Échap` | quitte édition + désélectionne | inchangé |
| Clic hors sticky | désélectionne | inchangé |

## Bouton × (suppression via souris)

**Apparence :**
- Cercle ~20 px, positionné `absolute -top-2 -right-2` (coin supérieur droit, déborde légèrement)
- `bg-gray-800/80 text-white`, icône `×`
- Invisible au repos (`opacity-0`), visible au hover du sticky (`group-hover:opacity-100`)
- Transition `opacity 150ms`

**Comportement :**
- `(mousedown)` : `stopPropagation` → pas de sélection/drag
- `(click)` : `stopPropagation` + `deleteRequest.emit()`
- Visible aussi bien en état repos que sélectionné ; pas affiché en mode édition (masqué par le textarea)

## Fichiers impactés

### `sticky-card.component.ts`
- Ajouter `deleteRequest = output<void>()`
- Ajouter classe `group` sur le `div` racine
- Ajouter le bouton × dans le template

### `canvas.component.ts`
- `onMouseUp` : supprimer `this.editingId.set(this.stickyMove.id)` sur clic court (sélection uniquement)
- Ajouter méthode `onStickyDblClick(id: string)` → `this.editingId.set(id); this.selectedId.set(id)`
- Ajouter `(dblclick)="onStickyDblClick(s.id)"` sur `<app-sticky-card>` dans le template
- Ajouter méthode `onDeleteSticky(id: string)` → `this.workshopStore.removeSticky(id); this.selectedId.set(null)`
- Ajouter `(deleteRequest)="onDeleteSticky(s.id)"` sur `<app-sticky-card>`
- `clearEditing()` reste inchangé (Échap = quitte édition + désélectionne)

### `sticky-card.component.spec.ts`
- Le bouton × est présent dans le DOM
- `deleteRequest` est émis au clic sur ×
- `mousedown` sur × ne propage pas

### `canvas.component.spec.ts`
- Clic simple → `selectedId` positionné, `editingId` null
- Double-clic → `editingId` positionné
- `deleteRequest` → `workshopStore.removeSticky` appelé, `selectedId` réinitialisé

## Hors périmètre

- Menu contextuel étendu (renommer, changer de type) — v2
- Undo/Redo — hors périmètre SPEC §11
