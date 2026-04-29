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
 * Label defaults to empty string — placeholder shown in UI (RM05).
 */
export function createSticky(
  type: StickyType,
  x: number,
  y: number,
  options: CreateStickyOptions = {}
): Sticky {
  return {
    id: crypto.randomUUID(),
    type,
    label: options.label ?? '',
    x,
    y,
    width: options.width ?? STICKY_DEFAULT_WIDTH,
    height: options.height ?? STICKY_DEFAULT_HEIGHT,
    rotation: options.rotation ?? (Math.random() * 2 - 1) * ROTATION_RANGE,
  };
}
