import { Level } from './level';
import { StickyType } from './sticky-type';
import {
  availableTypes,
  canSwitchToLevel,
  createLevelUnlockState,
  unlockDesign,
  unlockProcess,
} from './level-unlock-state';

describe('LevelUnlockState', () => {
  describe('createLevelUnlockState', () => {
    it('should start with BigPicture only — Process and Design locked (RM13)', () => {
      const state = createLevelUnlockState();
      expect(state.processUnlocked).toBe(false);
      expect(state.designUnlocked).toBe(false);
    });
  });

  describe('unlockProcess', () => {
    it('should unlock process level (RM13)', () => {
      const state = unlockProcess(createLevelUnlockState());
      expect(state.processUnlocked).toBe(true);
    });

    it('should not affect design unlock state (RM13)', () => {
      const state = unlockProcess(createLevelUnlockState());
      expect(state.designUnlocked).toBe(false);
    });

    it('should be idempotent — unlocking twice keeps process unlocked (RM14)', () => {
      const state = unlockProcess(unlockProcess(createLevelUnlockState()));
      expect(state.processUnlocked).toBe(true);
    });
  });

  describe('unlockDesign', () => {
    it('should unlock design level when process is already unlocked (RM13)', () => {
      const state = unlockDesign(unlockProcess(createLevelUnlockState()));
      expect(state.designUnlocked).toBe(true);
    });

    it('should throw when process is not yet unlocked (RM13)', () => {
      expect(() => unlockDesign(createLevelUnlockState())).toThrow();
    });

    it('should preserve process unlock when unlocking design (RM14)', () => {
      const state = unlockDesign(unlockProcess(createLevelUnlockState()));
      expect(state.processUnlocked).toBe(true);
    });
  });

  describe('canSwitchToLevel', () => {
    it('should always allow switching to BigPicture', () => {
      const state = createLevelUnlockState();
      expect(canSwitchToLevel(Level.BigPicture, state)).toBe(true);
    });

    it('should deny ProcessLevel when locked (RM13)', () => {
      expect(canSwitchToLevel(Level.ProcessLevel, createLevelUnlockState())).toBe(false);
    });

    it('should allow ProcessLevel when unlocked (RM14)', () => {
      const state = unlockProcess(createLevelUnlockState());
      expect(canSwitchToLevel(Level.ProcessLevel, state)).toBe(true);
    });

    it('should deny DesignLevel when locked (RM13)', () => {
      const state = unlockProcess(createLevelUnlockState());
      expect(canSwitchToLevel(Level.DesignLevel, state)).toBe(false);
    });

    it('should allow DesignLevel when unlocked (RM14)', () => {
      const state = unlockDesign(unlockProcess(createLevelUnlockState()));
      expect(canSwitchToLevel(Level.DesignLevel, state)).toBe(true);
    });
  });

  describe('availableTypes', () => {
    it('should return only DomainEvent at BigPicture (RM03, RM13)', () => {
      const types = availableTypes(createLevelUnlockState());
      expect(types).toEqual([StickyType.DomainEvent]);
    });

    it('should include Process types when process is unlocked (RM03)', () => {
      const types = availableTypes(unlockProcess(createLevelUnlockState()));
      expect(types).toContain(StickyType.Command);
      expect(types).toContain(StickyType.Actor);
      expect(types).toContain(StickyType.Policy);
      expect(types).toContain(StickyType.ExternalSystem);
    });

    it('should include Design types when design is unlocked (RM03)', () => {
      const types = availableTypes(unlockDesign(unlockProcess(createLevelUnlockState())));
      expect(types).toContain(StickyType.Aggregate);
      expect(types).toContain(StickyType.ReadModel);
      expect(types).toContain(StickyType.BoundedContext);
    });

    it('should always include DomainEvent regardless of unlocked levels (RM03)', () => {
      const fullyUnlocked = unlockDesign(unlockProcess(createLevelUnlockState()));
      expect(availableTypes(fullyUnlocked)).toContain(StickyType.DomainEvent);
    });
  });
});
