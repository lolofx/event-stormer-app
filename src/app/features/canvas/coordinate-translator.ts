import type { Viewport } from '../../domain/viewport';

/**
 * Converts screen coordinates to canvas coordinates.
 *
 * The SVG applies transform="translate(panX, panY) scale(zoom)" on its content group,
 * so the inverse is: canvasX = (screenX - svgOffsetX - panX) / zoom
 */
export function screenToCanvas(
  screenX: number,
  screenY: number,
  svgOffsetX: number,
  svgOffsetY: number,
  viewport: Viewport,
): { x: number; y: number } {
  return {
    x: (screenX - svgOffsetX - viewport.panX) / viewport.zoom,
    y: (screenY - svgOffsetY - viewport.panY) / viewport.zoom,
  };
}

/**
 * Converts canvas coordinates to screen coordinates (inverse of screenToCanvas).
 */
export function canvasToScreen(
  canvasX: number,
  canvasY: number,
  svgOffsetX: number,
  svgOffsetY: number,
  viewport: Viewport,
): { x: number; y: number } {
  return {
    x: canvasX * viewport.zoom + viewport.panX + svgOffsetX,
    y: canvasY * viewport.zoom + viewport.panY + svgOffsetY,
  };
}
