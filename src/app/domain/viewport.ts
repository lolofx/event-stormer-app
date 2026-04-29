export interface Viewport {
  readonly zoom: number;
  readonly panX: number;
  readonly panY: number;
}

const ZOOM_MIN = 0.25;
const ZOOM_MAX = 3;

export function createViewport(overrides?: Partial<Viewport>): Viewport {
  return { zoom: 1, panX: 0, panY: 0, ...overrides };
}

/** Clamps zoom to the allowed range [25%, 300%] (RM10). */
export function clampZoom(zoom: number): number {
  return Math.min(Math.max(zoom, ZOOM_MIN), ZOOM_MAX);
}
