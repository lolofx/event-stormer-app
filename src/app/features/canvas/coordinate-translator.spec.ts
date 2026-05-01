import { describe, it, expect } from 'vitest';
import { screenToCanvas, canvasToScreen } from './coordinate-translator';
import { createViewport } from '../../domain/viewport';

describe('screenToCanvas', () => {
  it('should return canvas coordinates at identity viewport', () => {
    const vp = createViewport();
    expect(screenToCanvas(100, 200, 0, 0, vp)).toEqual({ x: 100, y: 200 });
  });

  it('should account for SVG offset', () => {
    const vp = createViewport();
    expect(screenToCanvas(150, 250, 50, 50, vp)).toEqual({ x: 100, y: 200 });
  });

  it('should account for pan', () => {
    const vp = createViewport({ panX: 40, panY: 20 });
    expect(screenToCanvas(140, 120, 0, 0, vp)).toEqual({ x: 100, y: 100 });
  });

  it('should account for zoom', () => {
    const vp = createViewport({ zoom: 2 });
    expect(screenToCanvas(200, 400, 0, 0, vp)).toEqual({ x: 100, y: 200 });
  });

  it('should handle zoom and pan combined', () => {
    const vp = createViewport({ zoom: 2, panX: 100, panY: 50 });
    // canvasX = (screenX - offsetX - panX) / zoom = (300 - 0 - 100) / 2 = 100
    expect(screenToCanvas(300, 250, 0, 0, vp)).toEqual({ x: 100, y: 100 });
  });

  it('should handle minimum zoom (0.25)', () => {
    const vp = createViewport({ zoom: 0.25 });
    expect(screenToCanvas(25, 50, 0, 0, vp)).toEqual({ x: 100, y: 200 });
  });
});

describe('canvasToScreen', () => {
  it('should return screen coordinates at identity viewport', () => {
    const vp = createViewport();
    expect(canvasToScreen(100, 200, 0, 0, vp)).toEqual({ x: 100, y: 200 });
  });

  it('should account for SVG offset', () => {
    const vp = createViewport();
    expect(canvasToScreen(100, 200, 50, 50, vp)).toEqual({ x: 150, y: 250 });
  });

  it('should account for pan', () => {
    const vp = createViewport({ panX: 40, panY: 20 });
    expect(canvasToScreen(100, 100, 0, 0, vp)).toEqual({ x: 140, y: 120 });
  });

  it('should account for zoom', () => {
    const vp = createViewport({ zoom: 2 });
    expect(canvasToScreen(100, 200, 0, 0, vp)).toEqual({ x: 200, y: 400 });
  });

  it('should be the inverse of screenToCanvas', () => {
    const vp = createViewport({ zoom: 1.5, panX: 30, panY: -10 });
    const canvas = screenToCanvas(200, 300, 10, 20, vp);
    const back = canvasToScreen(canvas.x, canvas.y, 10, 20, vp);
    expect(back.x).toBeCloseTo(200);
    expect(back.y).toBeCloseTo(300);
  });
});
