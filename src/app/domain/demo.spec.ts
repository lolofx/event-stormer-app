import { StickyType } from './sticky-type';
import { createWorkshop } from './workshop';
import { applyDemo } from './demo';
import { Level } from './level';

describe('applyDemo', () => {
  it('should add stickies to an empty workshop', () => {
    const w = applyDemo(createWorkshop('Test'));
    expect(w.stickies.length).toBeGreaterThan(0);
  });

  it('should include at least 2 BoundedContext stickies', () => {
    const w = applyDemo(createWorkshop('Test'));
    const bcs = w.stickies.filter((s) => s.type === StickyType.BoundedContext);
    expect(bcs.length).toBeGreaterThanOrEqual(2);
  });

  it('should include all sticky types', () => {
    const w = applyDemo(createWorkshop('Test'));
    const types = new Set(w.stickies.map((s) => s.type));
    expect(types.has(StickyType.DomainEvent)).toBe(true);
    expect(types.has(StickyType.Command)).toBe(true);
    expect(types.has(StickyType.Actor)).toBe(true);
    expect(types.has(StickyType.Policy)).toBe(true);
    expect(types.has(StickyType.ExternalSystem)).toBe(true);
    expect(types.has(StickyType.Aggregate)).toBe(true);
    expect(types.has(StickyType.ReadModel)).toBe(true);
    expect(types.has(StickyType.BoundedContext)).toBe(true);
  });

  it('should unlock Process and Design levels', () => {
    const w = applyDemo(createWorkshop('Test'));
    expect(w.levelUnlockState.processUnlocked).toBe(true);
    expect(w.levelUnlockState.designUnlocked).toBe(true);
    expect(w.activeLevel).toBe(Level.DesignLevel);
  });

  it('should rename the workshop', () => {
    const w = applyDemo(createWorkshop('Test'));
    expect(w.name).not.toBe('Test');
  });

  it('should not mutate the original workshop', () => {
    const original = createWorkshop('Test');
    applyDemo(original);
    expect(original.stickies).toHaveLength(0);
    expect(original.levelUnlockState.processUnlocked).toBe(false);
  });

  it('should position all stickies with valid canvas coordinates (RM04)', () => {
    const w = applyDemo(createWorkshop('Test'));
    for (const s of w.stickies) {
      expect(typeof s.x).toBe('number');
      expect(typeof s.y).toBe('number');
      expect(isFinite(s.x)).toBe(true);
      expect(isFinite(s.y)).toBe(true);
    }
  });
});
