import {
  Directive,
  ElementRef,
  HostListener,
  Injector,
  OnDestroy,
  inject,
  input,
} from '@angular/core';
import { Overlay, OverlayRef } from '@angular/cdk/overlay';
import { ComponentPortal } from '@angular/cdk/portal';
import { PedagogyTooltipComponent } from './pedagogy-tooltip.component';
import { PEDAGOGY_TOOLTIP_DATA } from './pedagogy-tooltip.token';
import type { StickyTooltipData } from '../../pedagogy/sticky-tooltips';

@Directive({
  selector: '[appPedagogyTooltip]',
  standalone: true,
})
export class PedagogyTooltipDirective implements OnDestroy {
  readonly appPedagogyTooltip = input.required<StickyTooltipData>();

  private readonly overlay = inject(Overlay);
  private readonly el = inject(ElementRef<HTMLElement>);
  private readonly parentInjector = inject(Injector);

  private overlayRef: OverlayRef | null = null;
  private showTimer: ReturnType<typeof setTimeout> | null = null;

  @HostListener('mouseenter')
  onMouseEnter(): void {
    this.showTimer = setTimeout(() => this.show(), 500);
  }

  @HostListener('mouseleave')
  onMouseLeave(): void {
    this.hide();
  }

  @HostListener('focus')
  onFocus(): void {
    this.show();
  }

  @HostListener('blur')
  onBlur(): void {
    this.hide();
  }

  private show(): void {
    if (this.overlayRef?.hasAttached()) return;

    const positionStrategy = this.overlay
      .position()
      .flexibleConnectedTo(this.el)
      .withPositions([
        // Prefer above — arrow points down toward the dock item
        { originX: 'center', originY: 'top', overlayX: 'center', overlayY: 'bottom', offsetY: -10 },
        // Fallback below
        { originX: 'center', originY: 'bottom', overlayX: 'center', overlayY: 'top', offsetY: 10 },
      ]);

    this.overlayRef = this.overlay.create({
      positionStrategy,
      scrollStrategy: this.overlay.scrollStrategies.close(),
      hasBackdrop: false,
    });

    const injector = Injector.create({
      parent: this.parentInjector,
      providers: [{ provide: PEDAGOGY_TOOLTIP_DATA, useValue: this.appPedagogyTooltip() }],
    });

    this.overlayRef.attach(new ComponentPortal(PedagogyTooltipComponent, null, injector));
  }

  private hide(): void {
    if (this.showTimer !== null) {
      clearTimeout(this.showTimer);
      this.showTimer = null;
    }
    this.overlayRef?.detach();
  }

  ngOnDestroy(): void {
    this.hide();
    this.overlayRef?.dispose();
  }
}
