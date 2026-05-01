import { Injectable, signal, computed } from '@angular/core';
import { Viewport, createViewport, clampZoom } from '../../domain/viewport';

@Injectable({ providedIn: 'root' })
export class CanvasStore {
  private readonly _viewport = signal<Viewport>(createViewport());

  readonly viewport = this._viewport.asReadonly();

  readonly svgTransform = computed(() => {
    const { panX, panY, zoom } = this._viewport();
    return `translate(${panX},${panY}) scale(${zoom})`;
  });

  pan(dx: number, dy: number): void {
    const v = this._viewport();
    this._viewport.set({ ...v, panX: v.panX + dx, panY: v.panY + dy });
  }

  /**
   * Zoom centred on (originX, originY) in screen coordinates.
   * The formula keeps the canvas point under the cursor fixed:
   *   newPan = origin - (origin - pan) * (newZoom / oldZoom)
   */
  zoom(factor: number, originX: number, originY: number): void {
    const v = this._viewport();
    const newZoom = clampZoom(v.zoom * factor);
    const scale = newZoom / v.zoom;
    this._viewport.set({
      zoom: newZoom,
      panX: originX - (originX - v.panX) * scale,
      panY: originY - (originY - v.panY) * scale,
    });
  }

  updateViewport(patch: Partial<Viewport>): void {
    const v = this._viewport();
    this._viewport.set({
      ...v,
      ...patch,
      zoom: clampZoom(patch.zoom ?? v.zoom),
    });
  }
}
