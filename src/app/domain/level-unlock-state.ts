import { Level } from './level';
import { StickyType } from './sticky-type';

export interface LevelUnlockState {
  readonly processUnlocked: boolean;
  readonly designUnlocked: boolean;
}

export function createLevelUnlockState(): LevelUnlockState {
  return { processUnlocked: false, designUnlocked: false };
}

export function unlockProcess(state: LevelUnlockState): LevelUnlockState {
  return { ...state, processUnlocked: true };
}

/** Design level requires process to be unlocked first (RM13). */
export function unlockDesign(state: LevelUnlockState): LevelUnlockState {
  if (!state.processUnlocked) {
    throw new Error('Process level must be unlocked before Design level (RM13)');
  }
  return { ...state, designUnlocked: true };
}

export function canSwitchToLevel(level: Level, state: LevelUnlockState): boolean {
  switch (level) {
    case Level.BigPicture:
      return true;
    case Level.ProcessLevel:
      return state.processUnlocked;
    case Level.DesignLevel:
      return state.designUnlocked;
  }
}

/** Returns sticky types available in the dock based on unlocked levels (RM03). */
export function availableTypes(state: LevelUnlockState): readonly StickyType[] {
  const types: StickyType[] = [StickyType.DomainEvent];
  if (state.processUnlocked) {
    types.push(StickyType.Command, StickyType.Actor, StickyType.Policy, StickyType.ExternalSystem);
  }
  if (state.designUnlocked) {
    types.push(StickyType.Aggregate, StickyType.ReadModel, StickyType.BoundedContext);
  }
  return types;
}
