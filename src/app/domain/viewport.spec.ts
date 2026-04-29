import { clampZoom, createViewport } from './viewport';

describe('Viewport', () => {
  describe('createViewport', () => {
    it('should create a viewport with default zoom 1 (100%)', () => {
      const vp = createViewport();
      expect(vp.zoom).toBe(1);
    });

    it('should create a viewport centered at origin', () => {
      const vp = createViewport();
      expect(vp.panX).toBe(0);
      expect(vp.panY).toBe(0);
    });

    it('should accept partial overrides', () => {
      const vp = createViewport({ zoom: 1.5, panX: 100 });
      expect(vp.zoom).toBe(1.5);
      expect(vp.panX).toBe(100);
      expect(vp.panY).toBe(0);
    });
  });

  describe('clampZoom', () => {
    it('should clamp zoom to minimum 25% (RM10)', () => {
      expect(clampZoom(0.1)).toBe(0.25);
      expect(clampZoom(0)).toBe(0.25);
    });

    it('should clamp zoom to maximum 300% (RM10)', () => {
      expect(clampZoom(5)).toBe(3);
      expect(clampZoom(100)).toBe(3);
    });

    it('should pass through valid zoom values unchanged (RM10)', () => {
      expect(clampZoom(1)).toBe(1);
      expect(clampZoom(0.25)).toBe(0.25);
      expect(clampZoom(3)).toBe(3);
      expect(clampZoom(1.5)).toBe(1.5);
    });
  });
});
