import { Injectable, signal, inject, DestroyRef } from '@angular/core';

@Injectable({ providedIn: 'root' })
export class FullscreenService {
  private readonly destroyRef = inject(DestroyRef);

  readonly isFullscreen = signal(false);

  constructor() {
    const handler = (): void => this.isFullscreen.set(!!document.fullscreenElement);
    document.addEventListener('fullscreenchange', handler);
    this.destroyRef.onDestroy(() => document.removeEventListener('fullscreenchange', handler));
  }

  async toggle(): Promise<void> {
    try {
      if (document.fullscreenElement) {
        await document.exitFullscreen();
      } else {
        // Fullscreen API may be blocked in some embedded contexts (iframes, incognito on some browsers)
        await document.documentElement.requestFullscreen?.();
      }
    } catch {
      // Silently ignore — fullscreen is a non-critical enhancement
    }
  }
}
