import { ComponentFixture, TestBed } from '@angular/core/testing';
import { vi, describe, it, beforeEach, expect } from 'vitest';
import { LevelSelectorComponent } from './level-selector.component';
import { Level } from '../../domain/level';
import { LevelUnlockState } from '../../domain/level-unlock-state';

const UNLOCKED_PROCESS: LevelUnlockState = { processUnlocked: true, designUnlocked: false };
const UNLOCKED_ALL: LevelUnlockState = { processUnlocked: true, designUnlocked: true };
const LOCKED_ALL: LevelUnlockState = { processUnlocked: false, designUnlocked: false };

describe('LevelSelectorComponent', () => {
  let fixture: ComponentFixture<LevelSelectorComponent>;

  function setup(activeLevel: Level, unlockState: LevelUnlockState) {
    TestBed.configureTestingModule({ imports: [LevelSelectorComponent] });
    fixture = TestBed.createComponent(LevelSelectorComponent);
    fixture.componentRef.setInput('activeLevel', activeLevel);
    fixture.componentRef.setInput('levelUnlockState', unlockState);
    fixture.detectChanges();
  }

  describe('rendering', () => {
    it('should render 3 pills', () => {
      setup(Level.BigPicture, LOCKED_ALL);
      const pills = fixture.nativeElement.querySelectorAll('[data-pill]');
      expect(pills.length).toBe(3);
    });

    it('should mark the active pill with aria-pressed', () => {
      setup(Level.ProcessLevel, UNLOCKED_PROCESS);
      const pills: NodeListOf<HTMLButtonElement> = fixture.nativeElement.querySelectorAll('[data-pill]');
      expect(pills[0]?.getAttribute('aria-pressed')).toBe('false');
      expect(pills[1]?.getAttribute('aria-pressed')).toBe('true');
      expect(pills[2]?.getAttribute('aria-pressed')).toBe('false');
    });

    it('should disable locked pills', () => {
      setup(Level.BigPicture, LOCKED_ALL);
      const pills: NodeListOf<HTMLButtonElement> = fixture.nativeElement.querySelectorAll('[data-pill]');
      expect(pills[0]?.disabled).toBe(false);
      expect(pills[1]?.disabled).toBe(true);
      expect(pills[2]?.disabled).toBe(true);
    });

    it('should show lock icon on locked pills', () => {
      setup(Level.BigPicture, LOCKED_ALL);
      const locks = fixture.nativeElement.querySelectorAll('[data-lock-icon]');
      expect(locks.length).toBe(2);
    });

    it('should not show lock icon on unlocked pills', () => {
      setup(Level.BigPicture, UNLOCKED_ALL);
      const locks = fixture.nativeElement.querySelectorAll('[data-lock-icon]');
      expect(locks.length).toBe(0);
    });
  });

  describe('interaction', () => {
    it('should emit levelChange when clicking an unlocked non-active pill', () => {
      setup(Level.BigPicture, UNLOCKED_PROCESS);
      const emitted: Level[] = [];
      fixture.componentInstance.levelChange.subscribe((l: Level) => emitted.push(l));

      const pills: NodeListOf<HTMLButtonElement> = fixture.nativeElement.querySelectorAll('[data-pill]');
      pills[1]?.click();

      expect(emitted).toEqual([Level.ProcessLevel]);
    });

    it('should not emit when clicking the already active pill', () => {
      setup(Level.BigPicture, UNLOCKED_PROCESS);
      const emitted: Level[] = [];
      fixture.componentInstance.levelChange.subscribe((l: Level) => emitted.push(l));

      const pills: NodeListOf<HTMLButtonElement> = fixture.nativeElement.querySelectorAll('[data-pill]');
      pills[0]?.click();

      expect(emitted).toEqual([]);
    });

    it('should not emit when clicking a locked pill', () => {
      setup(Level.BigPicture, LOCKED_ALL);
      const emitted: Level[] = [];
      fixture.componentInstance.levelChange.subscribe((l: Level) => emitted.push(l));

      const pills: NodeListOf<HTMLButtonElement> = fixture.nativeElement.querySelectorAll('[data-pill]');
      pills[1]?.click();

      expect(emitted).toEqual([]);
    });
  });

  describe('active index', () => {
    it('should compute index 0 for BigPicture', () => {
      setup(Level.BigPicture, LOCKED_ALL);
      expect(fixture.componentInstance.activeIndex()).toBe(0);
    });

    it('should compute index 1 for ProcessLevel', () => {
      setup(Level.ProcessLevel, UNLOCKED_PROCESS);
      expect(fixture.componentInstance.activeIndex()).toBe(1);
    });

    it('should compute index 2 for DesignLevel', () => {
      setup(Level.DesignLevel, UNLOCKED_ALL);
      expect(fixture.componentInstance.activeIndex()).toBe(2);
    });
  });
});
