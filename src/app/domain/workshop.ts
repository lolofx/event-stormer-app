import { Level } from './level';
import {
  canSwitchToLevel,
  createLevelUnlockState,
  LevelUnlockState,
  unlockDesign,
  unlockProcess,
} from './level-unlock-state';
import { Sticky } from './sticky';
import { Viewport, createViewport } from './viewport';

export const WORKSHOP_SCHEMA_VERSION = 1;

export interface Workshop {
  readonly id: string;
  readonly name: string;
  readonly activeLevel: Level;
  readonly levelUnlockState: LevelUnlockState;
  readonly viewport: Viewport;
  readonly stickies: ReadonlyArray<Sticky>;
  readonly schemaVersion: number;
  readonly createdAt: Date;
  readonly updatedAt: Date;
}

export function createWorkshop(name: string): Workshop {
  const now = new Date();
  return {
    id: crypto.randomUUID(),
    name,
    activeLevel: Level.BigPicture,
    levelUnlockState: createLevelUnlockState(),
    viewport: createViewport(),
    stickies: [],
    schemaVersion: WORKSHOP_SCHEMA_VERSION,
    createdAt: now,
    updatedAt: now,
  };
}

export function addSticky(workshop: Workshop, sticky: Sticky): Workshop {
  return { ...workshop, stickies: [...workshop.stickies, sticky], updatedAt: new Date() };
}

export function removeSticky(workshop: Workshop, stickyId: string): Workshop {
  return {
    ...workshop,
    stickies: workshop.stickies.filter((s) => s.id !== stickyId),
    updatedAt: new Date(),
  };
}

export function updateStickyLabel(workshop: Workshop, stickyId: string, label: string): Workshop {
  return {
    ...workshop,
    stickies: workshop.stickies.map((s) => (s.id === stickyId ? { ...s, label } : s)),
    updatedAt: new Date(),
  };
}

/** Moves a sticky to a new canvas position. Rotation is preserved (RM16). */
export function moveSticky(workshop: Workshop, stickyId: string, x: number, y: number): Workshop {
  return {
    ...workshop,
    stickies: workshop.stickies.map((s) => (s.id === stickyId ? { ...s, x, y } : s)),
    updatedAt: new Date(),
  };
}

export function unlockProcessLevel(workshop: Workshop): Workshop {
  return {
    ...workshop,
    levelUnlockState: unlockProcess(workshop.levelUnlockState),
    activeLevel: Level.ProcessLevel,
    updatedAt: new Date(),
  };
}

/** Requires process level to be unlocked first (RM13). */
export function unlockDesignLevel(workshop: Workshop): Workshop {
  return {
    ...workshop,
    levelUnlockState: unlockDesign(workshop.levelUnlockState),
    activeLevel: Level.DesignLevel,
    updatedAt: new Date(),
  };
}

/** Switches between unlocked levels. Stickies are never removed (RM03, RM14). */
export function setActiveLevel(workshop: Workshop, level: Level): Workshop {
  if (!canSwitchToLevel(level, workshop.levelUnlockState)) {
    throw new Error(`Level ${level} is not unlocked`);
  }
  return { ...workshop, activeLevel: level, updatedAt: new Date() };
}

export function updateViewport(workshop: Workshop, patch: Partial<Viewport>): Workshop {
  return { ...workshop, viewport: { ...workshop.viewport, ...patch }, updatedAt: new Date() };
}

export function renameWorkshop(workshop: Workshop, name: string): Workshop {
  return { ...workshop, name, updatedAt: new Date() };
}
