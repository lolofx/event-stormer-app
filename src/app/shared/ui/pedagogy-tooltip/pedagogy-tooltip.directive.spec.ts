import { Component } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { Overlay } from '@angular/cdk/overlay';
import { vi, describe, it, beforeEach, afterEach, expect } from 'vitest';
import { PedagogyTooltipDirective } from './pedagogy-tooltip.directive';
import { STICKY_TOOLTIPS } from '../../pedagogy/sticky-tooltips';
import { StickyType } from '../../../domain/sticky-type';

@Component({
  standalone: true,
  imports: [PedagogyTooltipDirective],
  template: `<div [appPedagogyTooltip]="data" tabindex="0" data-testid="host"></div>`,
})
class TestHostComponent {
  data = STICKY_TOOLTIPS[StickyType.DomainEvent];
}

describe('PedagogyTooltipDirective', () => {
  let mockOverlayRef: {
    hasAttached: ReturnType<typeof vi.fn>;
    attach: ReturnType<typeof vi.fn>;
    detach: ReturnType<typeof vi.fn>;
    dispose: ReturnType<typeof vi.fn>;
  };
  let mockOverlay: { create: ReturnType<typeof vi.fn>; position: ReturnType<typeof vi.fn>; scrollStrategies: { close: ReturnType<typeof vi.fn> } };

  beforeEach(() => {
    vi.useFakeTimers();

    mockOverlayRef = {
      hasAttached: vi.fn().mockReturnValue(false),
      attach: vi.fn(),
      detach: vi.fn(),
      dispose: vi.fn(),
    };

    const mockPositionBuilder = {
      flexibleConnectedTo: vi.fn().mockReturnThis(),
      withPositions: vi.fn().mockReturnThis(),
    };

    mockOverlay = {
      create: vi.fn().mockReturnValue(mockOverlayRef),
      position: vi.fn().mockReturnValue(mockPositionBuilder),
      scrollStrategies: { close: vi.fn().mockReturnValue({}) },
    };

    TestBed.configureTestingModule({
      imports: [TestHostComponent],
      providers: [{ provide: Overlay, useValue: mockOverlay }],
    });
  });

  afterEach(() => vi.useRealTimers());

  it('should show tooltip after 500 ms on mouseenter', () => {
    const fixture = TestBed.createComponent(TestHostComponent);
    fixture.detectChanges();
    const host = fixture.nativeElement.querySelector('[data-testid="host"]') as HTMLElement;

    host.dispatchEvent(new MouseEvent('mouseenter'));
    expect(mockOverlay.create).not.toHaveBeenCalled();

    vi.advanceTimersByTime(500);
    expect(mockOverlay.create).toHaveBeenCalledTimes(1);
    expect(mockOverlayRef.attach).toHaveBeenCalledTimes(1);
  });

  it('should not show tooltip if mouseleave fires before 500 ms', () => {
    const fixture = TestBed.createComponent(TestHostComponent);
    fixture.detectChanges();
    const host = fixture.nativeElement.querySelector('[data-testid="host"]') as HTMLElement;

    host.dispatchEvent(new MouseEvent('mouseenter'));
    vi.advanceTimersByTime(300);
    host.dispatchEvent(new MouseEvent('mouseleave'));
    vi.advanceTimersByTime(300);

    expect(mockOverlay.create).not.toHaveBeenCalled();
  });

  it('should show tooltip immediately on focus', () => {
    const fixture = TestBed.createComponent(TestHostComponent);
    fixture.detectChanges();
    const host = fixture.nativeElement.querySelector('[data-testid="host"]') as HTMLElement;

    host.dispatchEvent(new FocusEvent('focus'));
    expect(mockOverlay.create).toHaveBeenCalledTimes(1);
  });

  it('should hide tooltip on blur', () => {
    const fixture = TestBed.createComponent(TestHostComponent);
    fixture.detectChanges();
    const host = fixture.nativeElement.querySelector('[data-testid="host"]') as HTMLElement;

    host.dispatchEvent(new FocusEvent('focus'));
    host.dispatchEvent(new FocusEvent('blur'));
    expect(mockOverlayRef.detach).toHaveBeenCalledTimes(1);
  });
});
