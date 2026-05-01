import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { TestBed } from '@angular/core/testing';
import { FullscreenService } from './fullscreen.service';

describe('FullscreenService', () => {
  let service: FullscreenService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(FullscreenService);
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('should expose isFullscreen signal defaulting to false', () => {
    expect(service.isFullscreen()).toBe(false);
  });

  it('should call requestFullscreen when not in fullscreen', async () => {
    const mockRequest = vi.fn().mockResolvedValue(undefined);
    Object.defineProperty(document, 'fullscreenElement', { value: null, configurable: true });
    Object.defineProperty(document.documentElement, 'requestFullscreen', {
      value: mockRequest,
      configurable: true,
    });

    await service.toggle();

    expect(mockRequest).toHaveBeenCalled();
  });

  it('should call exitFullscreen when already in fullscreen', async () => {
    const mockExit = vi.fn().mockResolvedValue(undefined);
    Object.defineProperty(document, 'fullscreenElement', {
      value: document.documentElement,
      configurable: true,
    });
    Object.defineProperty(document, 'exitFullscreen', {
      value: mockExit,
      configurable: true,
    });

    await service.toggle();

    expect(mockExit).toHaveBeenCalled();
  });

  it('should not throw when fullscreen API is unavailable', async () => {
    Object.defineProperty(document, 'fullscreenElement', { value: null, configurable: true });
    Object.defineProperty(document.documentElement, 'requestFullscreen', {
      value: undefined,
      configurable: true,
    });

    await expect(service.toggle()).resolves.not.toThrow();
  });
});
