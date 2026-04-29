import { StickyType } from './sticky-type';
import { createSticky, STICKY_DEFAULT_HEIGHT, STICKY_DEFAULT_WIDTH } from './sticky';

describe('Sticky', () => {
  describe('createSticky', () => {
    it('should create a sticky with the given type and position (RM04)', () => {
      const sticky = createSticky(StickyType.DomainEvent, 100, 200);
      expect(sticky.type).toBe(StickyType.DomainEvent);
      expect(sticky.x).toBe(100);
      expect(sticky.y).toBe(200);
    });

    it('should create a sticky with an empty label by default (RM05)', () => {
      const sticky = createSticky(StickyType.Command, 0, 0);
      expect(sticky.label).toBe('');
    });

    it('should create a sticky with a unique id', () => {
      const a = createSticky(StickyType.Actor, 0, 0);
      const b = createSticky(StickyType.Actor, 0, 0);
      expect(a.id).not.toBe(b.id);
      expect(typeof a.id).toBe('string');
      expect(a.id.length).toBeGreaterThan(0);
    });

    it('should apply default dimensions', () => {
      const sticky = createSticky(StickyType.Policy, 0, 0);
      expect(sticky.width).toBe(STICKY_DEFAULT_WIDTH);
      expect(sticky.height).toBe(STICKY_DEFAULT_HEIGHT);
    });

    it('should assign a rotation within ±2° at creation (RM16)', () => {
      for (let i = 0; i < 20; i++) {
        const sticky = createSticky(StickyType.DomainEvent, 0, 0);
        expect(Math.abs(sticky.rotation)).toBeLessThanOrEqual(2);
      }
    });

    it('should generate varied rotations — not always zero (RM16)', () => {
      const rotations = Array.from({ length: 30 }, () =>
        createSticky(StickyType.DomainEvent, 0, 0).rotation
      );
      const unique = new Set(rotations.map((r) => r.toFixed(6)));
      expect(unique.size).toBeGreaterThan(1);
    });

    it('should accept a custom label via options', () => {
      const sticky = createSticky(StickyType.Aggregate, 0, 0, { label: 'Commande' });
      expect(sticky.label).toBe('Commande');
    });

    it('should accept custom dimensions via options', () => {
      const sticky = createSticky(StickyType.ReadModel, 0, 0, { width: 200, height: 150 });
      expect(sticky.width).toBe(200);
      expect(sticky.height).toBe(150);
    });

    it('should accept an explicit rotation via options (for testing and restore) (RM16)', () => {
      const sticky = createSticky(StickyType.ExternalSystem, 0, 0, { rotation: 1.5 });
      expect(sticky.rotation).toBe(1.5);
    });
  });
});
