import { ComponentFixture, TestBed } from '@angular/core/testing';
import { Signal, signal } from '@angular/core';
import { vi, describe, it, expect } from 'vitest';
import { By } from '@angular/platform-browser';
import { PaletteDockComponent } from './palette-dock.component';
import { WorkshopStore } from '../workshop/workshop.store';
import { Level } from '../../domain/level';
import { WorkshopPersistenceService } from '../../core/persistence';
import type { Sticky } from '../../domain/sticky';

interface MockWorkshopStore {
  levelUnlockState: Signal<{ processUnlocked: boolean; designUnlocked: boolean }>;
  activeLevel: Signal<Level>;
  stickies: Signal<readonly Sticky[]>;
  name: Signal<string>;
  addSticky: ReturnType<typeof vi.fn>;
  removeSticky: ReturnType<typeof vi.fn>;
  moveSticky: ReturnType<typeof vi.fn>;
  updateLabel: ReturnType<typeof vi.fn>;
  rename: ReturnType<typeof vi.fn>;
  initialize: ReturnType<typeof vi.fn>;
}

function makeStore(
  overrides: { processUnlocked?: boolean; designUnlocked?: boolean } = {},
): MockWorkshopStore {
  return {
    levelUnlockState: signal({
      processUnlocked: overrides.processUnlocked ?? false,
      designUnlocked: overrides.designUnlocked ?? false,
    }),
    activeLevel: signal(Level.BigPicture),
    stickies: signal([]),
    name: signal('Test'),
    addSticky: vi.fn(),
    removeSticky: vi.fn(),
    moveSticky: vi.fn(),
    updateLabel: vi.fn(),
    rename: vi.fn(),
    initialize: vi.fn().mockResolvedValue(undefined),
  };
}

let store: MockWorkshopStore;

function createComponent(
  storeOverrides?: { processUnlocked?: boolean; designUnlocked?: boolean },
): ComponentFixture<PaletteDockComponent> {
  store = makeStore(storeOverrides);
  TestBed.configureTestingModule({
    imports: [PaletteDockComponent],
    providers: [
      { provide: WorkshopStore, useValue: store },
      {
        provide: WorkshopPersistenceService,
        useValue: {
          repository: { load: vi.fn().mockResolvedValue(null), save: vi.fn(), clear: vi.fn() },
          usingFallback: signal(false),
        },
      },
    ],
  });
  const fixture = TestBed.createComponent(PaletteDockComponent);
  fixture.detectChanges();
  return fixture;
}

describe('PaletteDockComponent', () => {
  describe('item visibility based on level (RM03)', () => {
    it('should show only DomainEvent in Big Picture mode', () => {
      const fixture = createComponent();
      const items = fixture.debugElement.queryAll(By.css('[data-testid="palette-item"]'));
      expect(items.length).toBe(1);
    });

    it('should show 5 items when Process Level is unlocked', () => {
      const fixture = createComponent({ processUnlocked: true });
      const items = fixture.debugElement.queryAll(By.css('[data-testid="palette-item"]'));
      expect(items.length).toBe(5);
    });

    it('should show all 8 items when Design Level is unlocked', () => {
      const fixture = createComponent({ processUnlocked: true, designUnlocked: true });
      const items = fixture.debugElement.queryAll(By.css('[data-testid="palette-item"]'));
      expect(items.length).toBe(8);
    });
  });

  describe('locked items', () => {
    it('should show no lock icons since only available items are rendered', () => {
      const fixture = createComponent();
      const lockIcons = fixture.debugElement.queryAll(By.css('[data-testid="lock-icon"]'));
      expect(lockIcons.length).toBe(0);
    });

    it('should show no lock icons on any visible item', () => {
      const fixture = createComponent();
      const items = fixture.debugElement.queryAll(By.css('[data-testid="palette-item"]'));
      items.forEach((item) => {
        const lock = item.query(By.css('[data-testid="lock-icon"]'));
        expect(lock).toBeNull();
      });
    });
  });

  describe('item labels', () => {
    it('should display correct label for DomainEvent', () => {
      const fixture = createComponent();
      const label = fixture.debugElement.query(By.css('[data-testid="palette-item-label"]'));
      expect(label?.nativeElement.textContent.trim()).toBe('Event');
    });
  });
});
