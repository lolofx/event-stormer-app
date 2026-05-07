import { ComponentFixture, TestBed } from '@angular/core/testing';
import { Signal, signal } from '@angular/core';
import { vi, describe, it, expect } from 'vitest';
import { By } from '@angular/platform-browser';
import { PaletteDockComponent } from './palette-dock.component';
import { WorkshopStore } from '../workshop/workshop.store';
import { LevelUnlockService } from '../workshop/level-unlock.service';
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
  unlockProcess: ReturnType<typeof vi.fn>;
  unlockDesign: ReturnType<typeof vi.fn>;
  setActiveLevel: ReturnType<typeof vi.fn>;
}

function makeStore(
  overrides: { processUnlocked?: boolean; designUnlocked?: boolean; activeLevel?: Level } = {},
): MockWorkshopStore {
  return {
    levelUnlockState: signal({
      processUnlocked: overrides.processUnlocked ?? false,
      designUnlocked: overrides.designUnlocked ?? false,
    }),
    activeLevel: signal(overrides.activeLevel ?? Level.BigPicture),
    stickies: signal([]),
    name: signal('Test'),
    addSticky: vi.fn(),
    removeSticky: vi.fn(),
    moveSticky: vi.fn(),
    updateLabel: vi.fn(),
    rename: vi.fn(),
    initialize: vi.fn().mockResolvedValue(undefined),
    unlockProcess: vi.fn(),
    unlockDesign: vi.fn(),
    setActiveLevel: vi.fn(),
  };
}

function makeLevelUnlockService() {
  return {
    requestUnlockProcess: vi.fn().mockResolvedValue(undefined),
    requestUnlockDesign: vi.fn().mockResolvedValue(undefined),
  };
}

let store: MockWorkshopStore;
let levelUnlockService: ReturnType<typeof makeLevelUnlockService>;

function createComponent(
  storeOverrides?: { processUnlocked?: boolean; designUnlocked?: boolean; activeLevel?: Level },
): ComponentFixture<PaletteDockComponent> {
  store = makeStore(storeOverrides);
  levelUnlockService = makeLevelUnlockService();
  TestBed.configureTestingModule({
    imports: [PaletteDockComponent],
    providers: [
      { provide: WorkshopStore, useValue: store },
      { provide: LevelUnlockService, useValue: levelUnlockService },
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
  describe('item visibility (RM03 — tous les types affichés, verrouillés grisés)', () => {
    it('should show all 8 types in Big Picture mode, 7 with lock icon', () => {
      const fixture = createComponent();
      const items = fixture.debugElement.queryAll(By.css('[data-testid="palette-item"]'));
      expect(items.length).toBe(8);
      const locked = fixture.debugElement.queryAll(By.css('[data-testid="lock-icon"]'));
      expect(locked.length).toBe(7);
    });

    it('should show 3 locked items when Process Level is unlocked', () => {
      const fixture = createComponent({ processUnlocked: true });
      const items = fixture.debugElement.queryAll(By.css('[data-testid="palette-item"]'));
      expect(items.length).toBe(8);
      const locked = fixture.debugElement.queryAll(By.css('[data-testid="lock-icon"]'));
      expect(locked.length).toBe(3);
    });

    it('should show 0 locked items when Design Level is unlocked', () => {
      const fixture = createComponent({ processUnlocked: true, designUnlocked: true });
      const locked = fixture.debugElement.queryAll(By.css('[data-testid="lock-icon"]'));
      expect(locked.length).toBe(0);
    });
  });

  describe('item labels', () => {
    it('should display correct label for DomainEvent', () => {
      const fixture = createComponent();
      const label = fixture.debugElement.query(By.css('[data-testid="palette-item-label"]'));
      expect(label?.nativeElement.textContent.trim()).toBe('Event');
    });
  });

  describe('level selector', () => {
    it('should render LevelSelectorComponent', () => {
      const fixture = createComponent();
      const selector = fixture.debugElement.query(By.css('app-level-selector'));
      expect(selector).not.toBeNull();
    });

    it('should call store.setActiveLevel when level selector emits levelChange', () => {
      const fixture = createComponent({ processUnlocked: true });
      const selector = fixture.debugElement.query(By.css('app-level-selector'));
      selector?.componentInstance.levelChange.emit(Level.ProcessLevel);
      expect(store.setActiveLevel).toHaveBeenCalledWith(Level.ProcessLevel);
    });
  });

  describe('unlock buttons', () => {
    it('should show unlock process button when process not unlocked', () => {
      const fixture = createComponent();
      const btn = fixture.debugElement.query(By.css('[data-testid="unlock-process-btn"]'));
      expect(btn).not.toBeNull();
    });

    it('should not show unlock process button when process is unlocked', () => {
      const fixture = createComponent({ processUnlocked: true });
      const btn = fixture.debugElement.query(By.css('[data-testid="unlock-process-btn"]'));
      expect(btn).toBeNull();
    });

    it('should show unlock design button when process unlocked but design locked', () => {
      const fixture = createComponent({ processUnlocked: true });
      const btn = fixture.debugElement.query(By.css('[data-testid="unlock-design-btn"]'));
      expect(btn).not.toBeNull();
    });

    it('should not show any unlock button when all levels unlocked', () => {
      const fixture = createComponent({ processUnlocked: true, designUnlocked: true });
      expect(fixture.debugElement.query(By.css('[data-testid="unlock-process-btn"]'))).toBeNull();
      expect(fixture.debugElement.query(By.css('[data-testid="unlock-design-btn"]'))).toBeNull();
    });

    it('should call requestUnlockProcess when process button clicked', () => {
      const fixture = createComponent();
      const btn: HTMLButtonElement = fixture.debugElement.query(
        By.css('[data-testid="unlock-process-btn"]'),
      )?.nativeElement;
      btn?.click();
      expect(levelUnlockService.requestUnlockProcess).toHaveBeenCalledTimes(1);
    });

    it('should call requestUnlockDesign when design button clicked', () => {
      const fixture = createComponent({ processUnlocked: true });
      const btn: HTMLButtonElement = fixture.debugElement.query(
        By.css('[data-testid="unlock-design-btn"]'),
      )?.nativeElement;
      btn?.click();
      expect(levelUnlockService.requestUnlockDesign).toHaveBeenCalledTimes(1);
    });
  });
});
