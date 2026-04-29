import { Level } from './level';
import { createSticky } from './sticky';
import { StickyType } from './sticky-type';
import {
  addSticky,
  createWorkshop,
  moveSticky,
  removeSticky,
  renameWorkshop,
  setActiveLevel,
  unlockDesignLevel,
  unlockProcessLevel,
  updateStickyLabel,
  updateViewport,
} from './workshop';

describe('Workshop', () => {
  describe('createWorkshop', () => {
    it('should create a workshop with the given name', () => {
      const w = createWorkshop('Mon atelier');
      expect(w.name).toBe('Mon atelier');
    });

    it('should start with no stickies (RM01)', () => {
      const w = createWorkshop('Test');
      expect(w.stickies).toHaveLength(0);
    });

    it('should start with BigPicture as active level (RM13)', () => {
      const w = createWorkshop('Test');
      expect(w.activeLevel).toBe(Level.BigPicture);
    });

    it('should start with Process and Design locked (RM13)', () => {
      const w = createWorkshop('Test');
      expect(w.levelUnlockState.processUnlocked).toBe(false);
      expect(w.levelUnlockState.designUnlocked).toBe(false);
    });

    it('should have a unique id', () => {
      const a = createWorkshop('A');
      const b = createWorkshop('B');
      expect(a.id).not.toBe(b.id);
    });

    it('should set a schemaVersion for serialization (RM11)', () => {
      const w = createWorkshop('Test');
      expect(typeof w.schemaVersion).toBe('number');
      expect(w.schemaVersion).toBeGreaterThan(0);
    });
  });

  describe('addSticky', () => {
    it('should add a sticky to the workshop (RM01)', () => {
      const w = createWorkshop('Test');
      const sticky = createSticky(StickyType.DomainEvent, 100, 200);
      const updated = addSticky(w, sticky);
      expect(updated.stickies).toHaveLength(1);
      expect(updated.stickies[0]).toBe(sticky);
    });

    it('should not mutate the original workshop', () => {
      const w = createWorkshop('Test');
      addSticky(w, createSticky(StickyType.DomainEvent, 0, 0));
      expect(w.stickies).toHaveLength(0);
    });

    it('should update updatedAt on mutation (RM08)', () => {
      const w = createWorkshop('Test');
      const before = w.updatedAt;
      // Small delay to ensure date difference
      const updated = addSticky(w, createSticky(StickyType.DomainEvent, 0, 0));
      expect(updated.updatedAt).toBeInstanceOf(Date);
      expect(updated.updatedAt >= before).toBe(true);
    });
  });

  describe('removeSticky', () => {
    it('should remove a sticky by id', () => {
      const sticky = createSticky(StickyType.DomainEvent, 100, 200);
      const w = addSticky(createWorkshop('Test'), sticky);
      const updated = removeSticky(w, sticky.id);
      expect(updated.stickies).toHaveLength(0);
    });

    it('should not affect other stickies when removing one', () => {
      const s1 = createSticky(StickyType.DomainEvent, 0, 0);
      const s2 = createSticky(StickyType.Command, 100, 100);
      const w = addSticky(addSticky(createWorkshop('Test'), s1), s2);
      const updated = removeSticky(w, s1.id);
      expect(updated.stickies).toHaveLength(1);
      expect(updated.stickies[0]?.id).toBe(s2.id);
    });

    it('should be a no-op for unknown ids', () => {
      const sticky = createSticky(StickyType.DomainEvent, 0, 0);
      const w = addSticky(createWorkshop('Test'), sticky);
      const updated = removeSticky(w, 'non-existent-id');
      expect(updated.stickies).toHaveLength(1);
    });
  });

  describe('updateStickyLabel', () => {
    it('should update the label of a sticky', () => {
      const sticky = createSticky(StickyType.DomainEvent, 0, 0);
      const w = addSticky(createWorkshop('Test'), sticky);
      const updated = updateStickyLabel(w, sticky.id, 'Commande passée');
      expect(updated.stickies[0]?.label).toBe('Commande passée');
    });

    it('should preserve the rotation when updating label (RM16)', () => {
      const sticky = createSticky(StickyType.DomainEvent, 0, 0, { rotation: 1.23 });
      const w = addSticky(createWorkshop('Test'), sticky);
      const updated = updateStickyLabel(w, sticky.id, 'New label');
      expect(updated.stickies[0]?.rotation).toBe(1.23);
    });

    it('should not affect other stickies when updating label', () => {
      const s1 = createSticky(StickyType.DomainEvent, 0, 0);
      const s2 = createSticky(StickyType.Command, 100, 100, { label: 'Unchanged' });
      const w = addSticky(addSticky(createWorkshop('Test'), s1), s2);
      const updated = updateStickyLabel(w, s1.id, 'Changed');
      expect(updated.stickies[1]?.label).toBe('Unchanged');
    });
  });

  describe('moveSticky', () => {
    it('should update position of a sticky (RM04)', () => {
      const sticky = createSticky(StickyType.DomainEvent, 0, 0);
      const w = addSticky(createWorkshop('Test'), sticky);
      const updated = moveSticky(w, sticky.id, 300, 400);
      expect(updated.stickies[0]?.x).toBe(300);
      expect(updated.stickies[0]?.y).toBe(400);
    });

    it('should preserve the rotation when moving a sticky (RM16)', () => {
      const sticky = createSticky(StickyType.DomainEvent, 0, 0, { rotation: -1.5 });
      const w = addSticky(createWorkshop('Test'), sticky);
      const updated = moveSticky(w, sticky.id, 100, 100);
      expect(updated.stickies[0]?.rotation).toBe(-1.5);
    });

    it('should not affect other stickies when moving one (RM04)', () => {
      const s1 = createSticky(StickyType.DomainEvent, 0, 0);
      const s2 = createSticky(StickyType.Command, 50, 60);
      const w = addSticky(addSticky(createWorkshop('Test'), s1), s2);
      const updated = moveSticky(w, s1.id, 300, 400);
      expect(updated.stickies[1]?.x).toBe(50);
      expect(updated.stickies[1]?.y).toBe(60);
    });
  });

  describe('unlockProcessLevel', () => {
    it('should unlock the process level (RM13)', () => {
      const w = unlockProcessLevel(createWorkshop('Test'));
      expect(w.levelUnlockState.processUnlocked).toBe(true);
    });

    it('should set active level to ProcessLevel (RM13)', () => {
      const w = unlockProcessLevel(createWorkshop('Test'));
      expect(w.activeLevel).toBe(Level.ProcessLevel);
    });

    it('should preserve existing stickies — no destructive effect (RM03)', () => {
      const sticky = createSticky(StickyType.DomainEvent, 0, 0);
      const w = addSticky(createWorkshop('Test'), sticky);
      const unlocked = unlockProcessLevel(w);
      expect(unlocked.stickies).toHaveLength(1);
    });
  });

  describe('unlockDesignLevel', () => {
    it('should unlock design level when process is already unlocked (RM13)', () => {
      const w = unlockDesignLevel(unlockProcessLevel(createWorkshop('Test')));
      expect(w.levelUnlockState.designUnlocked).toBe(true);
    });

    it('should throw when trying to unlock design before process (RM13)', () => {
      expect(() => unlockDesignLevel(createWorkshop('Test'))).toThrow();
    });
  });

  describe('setActiveLevel', () => {
    it('should switch to an unlocked level (RM14)', () => {
      const w = setActiveLevel(unlockProcessLevel(createWorkshop('Test')), Level.BigPicture);
      expect(w.activeLevel).toBe(Level.BigPicture);
    });

    it('should throw when switching to a locked level (RM14)', () => {
      expect(() => setActiveLevel(createWorkshop('Test'), Level.ProcessLevel)).toThrow();
    });

    it('should not lose stickies when switching levels (RM03)', () => {
      const sticky = createSticky(StickyType.DomainEvent, 0, 0);
      const w = addSticky(unlockProcessLevel(createWorkshop('Test')), sticky);
      const switched = setActiveLevel(w, Level.BigPicture);
      expect(switched.stickies).toHaveLength(1);
    });
  });

  describe('updateViewport', () => {
    it('should update viewport pan', () => {
      const w = updateViewport(createWorkshop('Test'), { panX: 50, panY: -30 });
      expect(w.viewport.panX).toBe(50);
      expect(w.viewport.panY).toBe(-30);
    });

    it('should update viewport zoom', () => {
      const w = updateViewport(createWorkshop('Test'), { zoom: 2 });
      expect(w.viewport.zoom).toBe(2);
    });
  });

  describe('renameWorkshop', () => {
    it('should update the workshop name', () => {
      const w = renameWorkshop(createWorkshop('Ancien'), 'Nouveau');
      expect(w.name).toBe('Nouveau');
    });
  });
});
