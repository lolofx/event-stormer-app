import { Component, input, computed } from '@angular/core';
import type { Viewport } from '../../domain/viewport';

@Component({
  selector: 'app-background-grid',
  standalone: true,
  template: `<div class="grid-layer" [style]="gridStyle()"></div>`,
  styles: ['.grid-layer { position: absolute; inset: 0; pointer-events: none; }'],
})
export class BackgroundGridComponent {
  readonly viewport = input.required<Viewport>();

  readonly gridStyle = computed(() => {
    const { zoom, panX, panY } = this.viewport();
    const size = 24 * zoom;

    if (zoom < 0.5) {
      return { background: 'var(--canvas-bg)' };
    }

    return {
      background: 'var(--canvas-bg)',
      'background-image': 'radial-gradient(circle, var(--canvas-grid) 1px, transparent 1px)',
      'background-size': `${size}px ${size}px`,
      'background-position': `${panX % size}px ${panY % size}px`,
    };
  });
}
