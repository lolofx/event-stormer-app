import { ComponentFixture, TestBed } from '@angular/core/testing';
import { WritableSignal, signal } from '@angular/core';
import { vi, describe, it, expect, beforeEach } from 'vitest';
import { By } from '@angular/platform-browser';
import { CanvasComponent } from './canvas.component';
import { CanvasStore } from './canvas.store';
import { WorkshopStore } from '../workshop/workshop.store';
import { FullscreenService } from '../../core/fullscreen/fullscreen.service';
import { WorkshopPersistenceService } from '../../core/persistence';
import { StickyType } from '../../domain/sticky-type';
import { createViewport } from '../../domain/viewport';
import { Level } from '../../domain/level';
import type { Sticky } from '../../domain/sticky';

const BASE_STICKY: Sticky = {
  id: 's1',
  type: StickyType.DomainEvent,
  label: 'Event',
  x: 100,
  y: 100,
  width: 160,
  height: 120,
  rotation: 0,
};

function keydown(code: string, extra: Partial<KeyboardEventInit> = {}): void {
  document.dispatchEvent(new KeyboardEvent('keydown', { code, bubbles: true, ...extra }));
}

describe('CanvasComponent', () => {
  let fixture: ComponentFixture<CanvasComponent>;
  let component: CanvasComponent;
  let stickies: WritableSignal<readonly Sticky[]>;
  let addSticky: ReturnType<typeof vi.fn>;
  let removeSticky: ReturnType<typeof vi.fn>;
  let fullscreen: { toggle: ReturnType<typeof vi.fn> };

  beforeEach(() => {
    stickies = signal<readonly Sticky[]>([]);
    addSticky = vi.fn().mockImplementation((type: StickyType, x: number, y: number) => {
      stickies.update((s) => [...s, { ...BASE_STICKY, id: 'dropped', type, x, y }]);
    });
    removeSticky = vi.fn();
    fullscreen = { toggle: vi.fn().mockResolvedValue(undefined) };

    TestBed.configureTestingModule({
      imports: [CanvasComponent],
      providers: [
        {
          provide: WorkshopStore,
          useValue: {
            stickies,
            name: signal('Test'),
            activeLevel: signal(Level.BigPicture),
            levelUnlockState: signal({ processUnlocked: false, designUnlocked: false }),
            addSticky,
            removeSticky,
            moveSticky: vi.fn(),
            updateLabel: vi.fn(),
            rename: vi.fn(),
            initialize: vi.fn().mockResolvedValue(undefined),
          },
        },
        {
          provide: CanvasStore,
          useValue: {
            viewport: signal(createViewport()),
            svgTransform: signal('translate(0,0) scale(1)'),
            pan: vi.fn(),
            zoom: vi.fn(),
            updateViewport: vi.fn(),
          },
        },
        { provide: FullscreenService, useValue: fullscreen },
        {
          provide: WorkshopPersistenceService,
          useValue: {
            repository: { load: vi.fn().mockResolvedValue(null), save: vi.fn(), clear: vi.fn() },
            usingFallback: signal(false),
          },
        },
      ],
    });
    fixture = TestBed.createComponent(CanvasComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  describe('keyboard shortcuts', () => {
    it('should call fullscreen.toggle when F is pressed', () => {
      keydown('KeyF');
      expect(fullscreen.toggle).toHaveBeenCalledOnce();
    });

    it('should not call fullscreen.toggle when F is pressed while inline editing', () => {
      component['editingId'].set('s1');
      keydown('KeyF');
      expect(fullscreen.toggle).not.toHaveBeenCalled();
    });

    it('should call removeSticky when Delete is pressed with a selected sticky', () => {
      component['selectedId'].set('s1');
      keydown('Delete');
      expect(removeSticky).toHaveBeenCalledWith('s1');
    });

    it('should not call removeSticky when Delete is pressed while inline editing', () => {
      component['selectedId'].set('s1');
      component['editingId'].set('s1');
      keydown('Delete');
      expect(removeSticky).not.toHaveBeenCalled();
    });

    it('should clear selectedId when Escape is pressed without active editing', () => {
      // When not editing (editingId null), Escape deselects.
      // When editing, the sticky-card textarea handles Escape internally and emits editingDone.
      component['selectedId'].set('s1');
      keydown('Escape');
      expect(component['selectedId']()).toBeNull();
    });

    it('should set isSpaceHeld on Space keydown', () => {
      keydown('Space');
      expect(component['isSpaceHeld']()).toBe(true);
    });

    it('should release isSpaceHeld on Space keyup', () => {
      keydown('Space');
      document.dispatchEvent(new KeyboardEvent('keyup', { code: 'Space', bubbles: true }));
      expect(component['isSpaceHeld']()).toBe(false);
    });
  });

  describe('onPaletteDrop', () => {
    let canvasHost: HTMLElement;

    beforeEach(() => {
      canvasHost = fixture.nativeElement.querySelector('.canvas-host') as HTMLElement;
      // JSDOM has no layout engine — mock non-zero bounds so drop-in-bounds checks pass
      vi.spyOn(canvasHost, 'getBoundingClientRect').mockReturnValue({
        left: 0, top: 0, right: 1920, bottom: 1080,
        width: 1920, height: 1080, x: 0, y: 0,
        toJSON: () => ({}),
      } as DOMRect);
    });

    it('should call addSticky when dropped inside canvas', () => {
      component['onPaletteDrop']({ type: StickyType.DomainEvent, screenX: 500, screenY: 300 });
      expect(addSticky).toHaveBeenCalledWith(StickyType.DomainEvent, 500, 300);
    });

    it('should ignore drop when screenX is outside canvas bounds', () => {
      component['onPaletteDrop']({ type: StickyType.DomainEvent, screenX: -10, screenY: 300 });
      expect(addSticky).not.toHaveBeenCalled();
    });

    it('should select and start editing the newly dropped sticky', () => {
      component['onPaletteDrop']({ type: StickyType.DomainEvent, screenX: 500, screenY: 300 });
      expect(component['selectedId']()).toBe('dropped');
      expect(component['editingId']()).toBe('dropped');
    });

    it('should not start editing when no sticky was added', () => {
      addSticky.mockImplementation(() => { /* do not update stickies */ });
      component['onPaletteDrop']({ type: StickyType.DomainEvent, screenX: 500, screenY: 300 });
      expect(component['editingId']()).toBeNull();
    });
  });

  describe('sticky mouse interaction', () => {
    beforeEach(() => {
      stickies.set([BASE_STICKY]);
      fixture.detectChanges();
    });

    it('should select sticky on mousedown', () => {
      const card = fixture.debugElement.query(By.css('app-sticky-card'));
      card.triggerEventHandler('mousedown', new MouseEvent('mousedown', { clientX: 100, clientY: 100 }));
      expect(component['selectedId']()).toBe('s1');
    });

    it('should enter edit mode when mouseup follows without movement beyond 3px threshold', () => {
      const card = fixture.debugElement.query(By.css('app-sticky-card'));
      card.triggerEventHandler('mousedown', new MouseEvent('mousedown', { clientX: 100, clientY: 100 }));
      document.dispatchEvent(new MouseEvent('mouseup', { bubbles: true }));
      expect(component['editingId']()).toBe('s1');
    });

    it('should not enter edit mode when drag exceeds 3px threshold before mouseup', () => {
      const card = fixture.debugElement.query(By.css('app-sticky-card'));
      card.triggerEventHandler('mousedown', new MouseEvent('mousedown', { clientX: 100, clientY: 100 }));
      document.dispatchEvent(new MouseEvent('mousemove', { clientX: 110, clientY: 100, bubbles: true }));
      document.dispatchEvent(new MouseEvent('mouseup', { bubbles: true }));
      expect(component['editingId']()).toBeNull();
    });
  });

  describe('panning', () => {
    it('should set isPanning on canvas mousedown when Space is held', () => {
      keydown('Space');
      const canvasHost = fixture.debugElement.query(By.css('.canvas-host'));
      canvasHost.triggerEventHandler('mousedown', new MouseEvent('mousedown', { clientX: 200, clientY: 200 }));
      expect(component['isPanning']()).toBe(true);
    });

    it('should not set isPanning when Space is not held', () => {
      const canvasHost = fixture.debugElement.query(By.css('.canvas-host'));
      canvasHost.triggerEventHandler('mousedown', new MouseEvent('mousedown', { clientX: 200, clientY: 200 }));
      expect(component['isPanning']()).toBe(false);
    });

    it('should stop panning on mouseup', () => {
      keydown('Space');
      const canvasHost = fixture.debugElement.query(By.css('.canvas-host'));
      canvasHost.triggerEventHandler('mousedown', new MouseEvent('mousedown', { clientX: 200, clientY: 200 }));
      document.dispatchEvent(new MouseEvent('mouseup', { bubbles: true }));
      expect(component['isPanning']()).toBe(false);
    });
  });
});
