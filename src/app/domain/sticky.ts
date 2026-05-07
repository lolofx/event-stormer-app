import { StickyType } from './sticky-type';

export interface Sticky {
  readonly id: string;
  readonly type: StickyType;
  readonly label: string;
  readonly x: number;
  readonly y: number;
  readonly width: number;
  readonly height: number;
  /** Random rotation in degrees, fixed at creation (RM16). */
  readonly rotation: number;
}

export const STICKY_DEFAULT_WIDTH = 160;
export const STICKY_DEFAULT_HEIGHT = 120;
/** BoundedContext must be large enough to visually contain other stickies (RM06). */
export const BC_DEFAULT_WIDTH = 400;
export const BC_DEFAULT_HEIGHT = 280;

export const STICKY_MIN_WIDTH = 80;
export const STICKY_MIN_HEIGHT = 60;
export const BC_MIN_WIDTH = 200;
export const BC_MIN_HEIGHT = 140;

export function minStickyDimensions(type: StickyType): { width: number; height: number } {
  return type === StickyType.BoundedContext
    ? { width: BC_MIN_WIDTH, height: BC_MIN_HEIGHT }
    : { width: STICKY_MIN_WIDTH, height: STICKY_MIN_HEIGHT };
}

const ROTATION_RANGE = 2;

export interface CreateStickyOptions {
  readonly label?: string;
  readonly width?: number;
  readonly height?: number;
  /** Override random rotation — used for restoring from persistence (RM16). */
  readonly rotation?: number;
}

/**
 * Creates a new sticky at (x, y) with a random rotation fixed for its lifetime (RM16).
 * BoundedContext gets larger defaults so it can visually contain other stickies (RM06).
 */
export function createSticky(
  type: StickyType,
  x: number,
  y: number,
  options: CreateStickyOptions = {}
): Sticky {
  const defaultWidth = type === StickyType.BoundedContext ? BC_DEFAULT_WIDTH : STICKY_DEFAULT_WIDTH;
  const defaultHeight = type === StickyType.BoundedContext ? BC_DEFAULT_HEIGHT : STICKY_DEFAULT_HEIGHT;
  return {
    id: crypto.randomUUID(),
    type,
    label: options.label ?? '',
    x,
    y,
    width: options.width ?? defaultWidth,
    height: options.height ?? defaultHeight,
    rotation: options.rotation ?? (type === StickyType.BoundedContext ? 0 : (Math.random() * 2 - 1) * ROTATION_RANGE),
  };
}
