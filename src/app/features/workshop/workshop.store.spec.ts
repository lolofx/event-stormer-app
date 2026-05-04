import { TestBed } from '@angular/core/testing';
import { signal } from '@angular/core';
import { vi, describe, it, beforeEach, afterEach, expect } from 'vitest';
import { WorkshopStore } from './workshop.store';
import { WorkshopPersistenceService } from '../../core/persistence';
import { StickyType } from '../../domain/sticky-type';
import type { WorkshopRepository } from '../../core/persistence';

function makeRepo(): WorkshopRepository & {
  save: ReturnType<typeof vi.fn>;
  load: ReturnType<typeof vi.fn>;
  clear: ReturnType<typeof vi.fn>;
} {
  return {
    save: vi.fn().mockResolvedValue(undefined),
    load: vi.fn().mockResolvedValue(null),
    clear: vi.fn().mockResolvedValue(undefined),
  };
}

describe('WorkshopStore', () => {
  let store: WorkshopStore;
  let repo: ReturnType<typeof makeRepo>;

  beforeEach(() => {
    repo = makeRepo();
    TestBed.configureTestingModule({
      providers: [
        WorkshopStore,
        {
          provide: WorkshopPersistenceService,
          useValue: { repository: repo, usingFallback: signal(false) },
        },
      ],
    });
    store = TestBed.inject(WorkshopStore);
  });

  afterEach(() => vi.clearAllTimers());

  describe('addSticky', () => {
    it('should add a sticky with correct type and position', () => {
      store.addSticky(StickyType.DomainEvent, 100, 200);
      const sticky = store.stickies()[0];
      expect(sticky?.type).toBe(StickyType.DomainEvent);
      expect(sticky?.x).toBe(100);
      expect(sticky?.y).toBe(200);
    });

    it('should assign a random rotation within ±2° (RM16)', () => {
      for (let i = 0; i < 20; i++) {
        store.addSticky(StickyType.Command, 0, 0);
      }
      const rotations = store.stickies().map((s) => s.rotation);
      expect(rotations.every((r) => r >= -2 && r <= 2)).toBe(true);
    });

    it('should accumulate multiple stickies', () => {
      store.addSticky(StickyType.DomainEvent, 10, 20);
      store.addSticky(StickyType.Command, 30, 40);
      expect(store.stickies().length).toBe(2);
    });
  });

  describe('removeSticky', () => {
    it('should remove sticky by id', () => {
      store.addSticky(StickyType.DomainEvent, 0, 0);
      const first = store.stickies()[0];
      if (first) store.removeSticky(first.id);
      expect(store.stickies().length).toBe(0);
    });

    it('should not affect other stickies when removing', () => {
      store.addSticky(StickyType.DomainEvent, 0, 0);
      store.addSticky(StickyType.Command, 100, 100);
      const first = store.stickies()[0];
      if (first) store.removeSticky(first.id);
      expect(store.stickies().length).toBe(1);
      expect(store.stickies()[0]?.type).toBe(StickyType.Command);
    });
  });

  describe('moveSticky', () => {
    it('should update position while preserving rotation (RM16)', () => {
      store.addSticky(StickyType.DomainEvent, 10, 20);
      const original = store.stickies()[0];
      if (!original) return;
      store.moveSticky(original.id, 300, 400);
      const moved = store.stickies()[0];
      expect(moved?.x).toBe(300);
      expect(moved?.y).toBe(400);
      expect(moved?.rotation).toBe(original.rotation);
    });
  });

  describe('updateLabel', () => {
    it('should update only the label of the target sticky', () => {
      store.addSticky(StickyType.DomainEvent, 0, 0);
      store.addSticky(StickyType.Command, 0, 0);
      const first = store.stickies()[0];
      if (first) store.updateLabel(first.id, 'Commande passée');
      expect(store.stickies()[0]?.label).toBe('Commande passée');
      expect(store.stickies()[1]?.label).toBe('');
    });
  });

  describe('rename', () => {
    it('should update workshop name', () => {
      store.rename('Atelier livraison');
      expect(store.name()).toBe('Atelier livraison');
    });
  });

  describe('initialize', () => {
    it('should load saved workshop from persistence', async () => {
      const saved = {
        id: 'w1',
        name: 'Saved workshop',
        stickies: [],
        activeLevel: 'BigPicture' as const,
        levelUnlockState: { processUnlocked: false, designUnlocked: false },
        viewport: { zoom: 1, panX: 0, panY: 0 },
        schemaVersion: 1,
        createdAt: new Date(),
        updatedAt: new Date(),
      };
      repo.load.mockResolvedValue(saved);
      await store.initialize();
      expect(store.name()).toBe('Saved workshop');
    });

    it('should keep default workshop when persistence returns null', async () => {
      await store.initialize();
      expect(store.stickies().length).toBe(0);
    });
  });

  describe('auto-save (RM08)', () => {
    beforeEach(() => vi.useFakeTimers());
    afterEach(() => vi.useRealTimers());

    it('should debounce save 500 ms after mutation', () => {
      store.addSticky(StickyType.DomainEvent, 0, 0);
      expect(repo.save).not.toHaveBeenCalled();
      vi.advanceTimersByTime(500);
      expect(repo.save).toHaveBeenCalledTimes(1);
    });

    it('should batch rapid mutations into one save', () => {
      store.addSticky(StickyType.DomainEvent, 0, 0);
      store.addSticky(StickyType.Command, 10, 10);
      store.rename('Test');
      vi.advanceTimersByTime(500);
      expect(repo.save).toHaveBeenCalledTimes(1);
    });
  });
});
