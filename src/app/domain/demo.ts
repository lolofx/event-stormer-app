import { createSticky } from './sticky';
import { StickyType } from './sticky-type';
import {
  Workshop,
  addSticky,
  renameWorkshop,
  unlockDesignLevel,
  unlockProcessLevel,
} from './workshop';

const BC_W = 580;
const BC_H = 360;
/** Horizontal gap between BoundedContexts. */
const BC_GAP = 60;
/** Sticky column offsets relative to BC left edge. */
const COL = [30, 210, 390] as const;
/** Sticky row offsets relative to BC top edge (below label). */
const ROW = [80, 220] as const;

/**
 * Populates an empty workshop with a three-context pizza delivery scenario
 * covering all sticky types. Unlocks Process and Design levels.
 */
export function applyDemo(workshop: Workshop): Workshop {
  let w = renameWorkshop(workshop, 'Livraison de pizza — démo');
  w = unlockProcessLevel(w);
  w = unlockDesignLevel(w);

  // ── BC1 : Prise de commande ──────────────────────────────────────────────
  const x1 = 40, y1 = 60;
  w = addSticky(w, createSticky(StickyType.BoundedContext, x1, y1, { label: 'Prise de commande', width: BC_W, height: BC_H }));
  w = addSticky(w, createSticky(StickyType.Actor,       x1 + COL[0], y1 + ROW[0], { label: 'Client' }));
  w = addSticky(w, createSticky(StickyType.Command,     x1 + COL[1], y1 + ROW[0], { label: 'Passer commande' }));
  w = addSticky(w, createSticky(StickyType.DomainEvent, x1 + COL[2], y1 + ROW[0], { label: 'Commande passée' }));
  w = addSticky(w, createSticky(StickyType.Policy,      x1 + COL[1], y1 + ROW[1], { label: 'Si commande → préparer pizza' }));

  // ── BC2 : Préparation ────────────────────────────────────────────────────
  const x2 = x1 + BC_W + BC_GAP, y2 = y1;
  w = addSticky(w, createSticky(StickyType.BoundedContext, x2, y2, { label: 'Préparation', width: BC_W, height: BC_H }));
  w = addSticky(w, createSticky(StickyType.Aggregate,   x2 + COL[0], y2 + ROW[0], { label: 'Pizza' }));
  w = addSticky(w, createSticky(StickyType.Command,     x2 + COL[1], y2 + ROW[0], { label: 'Préparer pizza' }));
  w = addSticky(w, createSticky(StickyType.DomainEvent, x2 + COL[2], y2 + ROW[0], { label: 'Pizza prête' }));
  w = addSticky(w, createSticky(StickyType.Actor,       x2 + COL[0], y2 + ROW[1], { label: 'Cuisinier' }));

  // ── BC3 : Livraison ──────────────────────────────────────────────────────
  const x3 = x2 + BC_W + BC_GAP, y3 = y1;
  w = addSticky(w, createSticky(StickyType.BoundedContext, x3, y3, { label: 'Livraison', width: BC_W, height: BC_H }));
  w = addSticky(w, createSticky(StickyType.ExternalSystem, x3 + COL[0], y3 + ROW[0], { label: 'GPS Livreur' }));
  w = addSticky(w, createSticky(StickyType.Command,        x3 + COL[1], y3 + ROW[0], { label: 'Livrer commande' }));
  w = addSticky(w, createSticky(StickyType.DomainEvent,    x3 + COL[2], y3 + ROW[0], { label: 'Commande livrée' }));
  w = addSticky(w, createSticky(StickyType.Actor,          x3 + COL[0], y3 + ROW[1], { label: 'Livreur' }));
  w = addSticky(w, createSticky(StickyType.ReadModel,      x3 + COL[1], y3 + ROW[1], { label: 'Suivi livraisons' }));

  return w;
}
