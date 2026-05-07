# Sticky Delete Interaction Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Remplacer le modèle clic→édition par clic→sélection / double-clic→édition, et ajouter un bouton × au hover pour supprimer un sticky.

**Architecture:** Deux fichiers modifiés en TDD strict. `StickyCardComponent` reçoit un nouvel output `deleteRequest` et un bouton × dans son template. `CanvasComponent` change son `onMouseUp` (plus d'édition sur clic court), ajoute `onStickyDblClick` et `onDeleteSticky`, et câble les nouveaux bindings.

**Tech Stack:** Angular 21 zoneless, signals, Tailwind CSS, Vitest

---

## Fichiers modifiés

| Fichier | Changement |
|---|---|
| `src/app/shared/ui/sticky-card/sticky-card.component.ts` | output `deleteRequest` + bouton × dans le template |
| `src/app/shared/ui/sticky-card/sticky-card.component.spec.ts` | 2 nouveaux tests |
| `src/app/features/canvas/canvas.component.ts` | `onMouseUp` sans édition, `onStickyDblClick`, `onDeleteSticky`, bindings template |
| `src/app/features/canvas/canvas.component.spec.ts` | 1 test mis à jour + 2 nouveaux tests |

---

## Task 1 — StickyCardComponent : bouton × (TDD)

**Files:**
- Modify: `src/app/shared/ui/sticky-card/sticky-card.component.spec.ts`
- Modify: `src/app/shared/ui/sticky-card/sticky-card.component.ts`

- [ ] **Step 1 : Écrire les tests échouants**

Dans `sticky-card.component.spec.ts`, ajouter à la fin du `describe` :

```typescript
it('should render a delete button', () => {
  const el = create();
  const btn = el.querySelector('[data-testid="delete-btn"]');
  expect(btn).not.toBeNull();
});

it('should emit deleteRequest when delete button is clicked', () => {
  const el = create();
  const emitted: void[] = [];
  fixture.componentInstance.deleteRequest.subscribe(() => emitted.push(undefined));
  const btn = el.querySelector('[data-testid="delete-btn"]') as HTMLElement;
  btn.click();
  expect(emitted).toHaveLength(1);
});
```

- [ ] **Step 2 : Vérifier que les tests échouent**

```bash
rtk npm test -- --reporter=verbose src/app/shared/ui/sticky-card/sticky-card.component.spec.ts
```

Attendu : 2 tests `FAIL` — "Cannot read properties of null" et "subscribe is not a function".

- [ ] **Step 3 : Implémenter le bouton × dans `sticky-card.component.ts`**

Ajouter l'import `output` (déjà présent, vérifier). Ajouter l'output après `editingDone` :

```typescript
readonly deleteRequest = output<void>();
```

Dans le template, ajouter `group` sur le `div` racine (ajouter à la fin de la `class` existante) :

```html
<div
  data-testid="sticky-card"
  class="relative flex items-center justify-center p-3 select-none transition-[box-shadow,transform] duration-150 group"
  ...
>
```

Ajouter le bouton × **juste après la balise ouvrante** du `div` racine, avant le `@if (isEditing())` :

```html
  <button
    data-testid="delete-btn"
    class="absolute -top-2 -right-2 w-5 h-5 rounded-full bg-gray-800/80 text-white opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center text-xs leading-none z-10"
    aria-label="Supprimer"
    (mousedown)="$event.stopPropagation()"
    (click)="$event.stopPropagation(); deleteRequest.emit()"
  >×</button>
```

- [ ] **Step 4 : Vérifier que les tests passent**

```bash
rtk npm test -- --reporter=verbose src/app/shared/ui/sticky-card/sticky-card.component.spec.ts
```

Attendu : tous les tests `PASS`.

- [ ] **Step 5 : Commit**

```bash
rtk git add src/app/shared/ui/sticky-card/sticky-card.component.ts src/app/shared/ui/sticky-card/sticky-card.component.spec.ts
git commit -m "feat: sticky-card — output deleteRequest + bouton × au hover"
```

---

## Task 2 — CanvasComponent : modèle Figma + câblage deleteRequest (TDD)

**Files:**
- Modify: `src/app/features/canvas/canvas.component.spec.ts`
- Modify: `src/app/features/canvas/canvas.component.ts`

- [ ] **Step 1 : Mettre à jour le test de clic simple et ajouter 2 nouveaux tests échouants**

Dans `canvas.component.spec.ts`, dans le `describe('sticky mouse interaction')` :

**Remplacer** ce test existant :
```typescript
it('should enter edit mode when mouseup follows without movement beyond 3px threshold', () => {
  const card = fixture.debugElement.query(By.css('app-sticky-card'));
  card.triggerEventHandler('mousedown', new MouseEvent('mousedown', { clientX: 100, clientY: 100 }));
  document.dispatchEvent(new MouseEvent('mouseup', { bubbles: true }));
  expect(component['editingId']()).toBe('s1');
});
```

**Par** :
```typescript
it('should select but NOT enter edit mode on short click', () => {
  const card = fixture.debugElement.query(By.css('app-sticky-card'));
  card.triggerEventHandler('mousedown', new MouseEvent('mousedown', { clientX: 100, clientY: 100 }));
  document.dispatchEvent(new MouseEvent('mouseup', { bubbles: true }));
  expect(component['selectedId']()).toBe('s1');
  expect(component['editingId']()).toBeNull();
});
```

**Ajouter** après ce test :
```typescript
it('should enter edit mode on dblclick', () => {
  const card = fixture.debugElement.query(By.css('app-sticky-card'));
  card.triggerEventHandler('dblclick', new MouseEvent('dblclick'));
  expect(component['editingId']()).toBe('s1');
  expect(component['selectedId']()).toBe('s1');
});

it('should call removeSticky and clear selectedId when deleteRequest is emitted', () => {
  component['selectedId'].set('s1');
  const card = fixture.debugElement.query(By.css('app-sticky-card'));
  card.triggerEventHandler('deleteRequest', undefined);
  expect(removeSticky).toHaveBeenCalledWith('s1');
  expect(component['selectedId']()).toBeNull();
});
```

- [ ] **Step 2 : Vérifier que les tests échouent**

```bash
rtk npm test -- --reporter=verbose src/app/features/canvas/canvas.component.spec.ts
```

Attendu : 3 tests `FAIL` — "should select but NOT", "should enter edit mode on dblclick", "should call removeSticky… deleteRequest".

- [ ] **Step 3 : Modifier `onMouseUp` dans `canvas.component.ts`**

Dans `onMouseUp`, **supprimer** les lignes qui entrent en édition sur clic court :

```typescript
@HostListener('document:mouseup')
onMouseUp(): void {
  this.isPanning.set(false);
  if (this.stickyMove) {
    if (!this.hasMoved) {
      // clic court → sélection uniquement, l'édition nécessite un double-clic
    }
    this.draggingId.set(null);
    this.stickyMove = null;
    this.hasMoved = false;
  }
}
```

- [ ] **Step 4 : Ajouter `onStickyDblClick` et `onDeleteSticky` dans `canvas.component.ts`**

Ajouter après la méthode `onStickyMouseDown` :

```typescript
protected onStickyDblClick(id: string): void {
  this.selectedId.set(id);
  this.editingId.set(id);
}

protected onDeleteSticky(id: string): void {
  this.workshopStore.removeSticky(id);
  this.selectedId.set(null);
}
```

- [ ] **Step 5 : Câbler les nouveaux bindings dans le template**

Dans le template de `canvas.component.ts`, sur `<app-sticky-card>`, ajouter les deux bindings :

```html
<app-sticky-card
  [type]="s.type"
  [label]="s.label"
  [rotation]="s.rotation"
  [selected]="selectedId() === s.id"
  [isEditing]="editingId() === s.id"
  [isDragging]="draggingId() === s.id"
  [showEmptyPlaceholder]="true"
  (mousedown)="onStickyMouseDown($event, s)"
  (dblclick)="onStickyDblClick(s.id)"
  (labelChange)="workshopStore.updateLabel(s.id, $event)"
  (editingDone)="clearEditing()"
  (deleteRequest)="onDeleteSticky(s.id)"
/>
```

- [ ] **Step 6 : Vérifier que tous les tests passent**

```bash
rtk npm test -- --reporter=verbose src/app/features/canvas/canvas.component.spec.ts
```

Attendu : tous les tests `PASS`.

- [ ] **Step 7 : Lancer la suite complète**

```bash
rtk npm test
```

Attendu : 0 tests en échec.

- [ ] **Step 8 : Commit**

```bash
rtk git add src/app/features/canvas/canvas.component.ts src/app/features/canvas/canvas.component.spec.ts
git commit -m "feat: canvas — clic=sélection, double-clic=édition, suppression via × ou Suppr"
```
