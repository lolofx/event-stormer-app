import {
  Component,
  inject,
  signal,
  computed,
  HostListener,
  ElementRef,
} from '@angular/core';
import { CanvasStore } from './canvas.store';
import { FullscreenService } from '../../core/fullscreen/fullscreen.service';
import { BackgroundGridComponent } from './background-grid.component';

@Component({
  selector: 'app-canvas',
  standalone: true,
  imports: [BackgroundGridComponent],
  template: `
    <div
      class="canvas-host"
      [class.cursor-grabbing]="isPanning()"
      [class.cursor-grab]="isSpaceHeld() && !isPanning()"
      tabindex="0"
      (mousedown)="onMouseDown($event)"
      (wheel)="onWheel($event)"
    >
      <app-background-grid [viewport]="store.viewport()" />

      <svg
        class="canvas-svg"
        [attr.aria-label]="'Canvas Event Storming'"
      >
        <!--
          IMPORTANT — CDK DragDrop + CSS scale:
          When this SVG is scaled via a CSS transform on the host, CDK DragDrop
          computes incorrect drop positions unless you pass the current zoom as
          [cdkDragConstrainPosition] or by providing a custom cdkDropList with
          the 'scale' input. This will be wired in étape 8 (palette dock).
        -->
        <g [attr.transform]="store.svgTransform()">
          <!-- stickies rendered here in étape 8 -->
        </g>
      </svg>
    </div>
  `,
  styles: [
    '.canvas-host { position: fixed; inset: 0; overflow: hidden; background: var(--canvas-bg); outline: none; }',
    '.canvas-svg { position: absolute; inset: 0; width: 100%; height: 100%; }',
    '.cursor-grab { cursor: grab; }',
    '.cursor-grabbing { cursor: grabbing; }',
  ],
})
export class CanvasComponent {
  protected readonly store = inject(CanvasStore);
  private readonly fullscreen = inject(FullscreenService);
  private readonly el = inject(ElementRef);

  protected readonly isSpaceHeld = signal(false);
  protected readonly isPanning = signal(false);

  private lastMouseX = 0;
  private lastMouseY = 0;

  protected readonly hostElement = computed(() => this.el.nativeElement as HTMLElement);

  @HostListener('document:keydown', ['$event'])
  onKeyDown(e: KeyboardEvent): void {
    if (e.code === 'Space' && !e.repeat) {
      e.preventDefault();
      this.isSpaceHeld.set(true);
    }
    if (e.code === 'KeyF') {
      void this.fullscreen.toggle();
    }
  }

  @HostListener('document:keyup', ['$event'])
  onKeyUp(e: KeyboardEvent): void {
    if (e.code === 'Space') {
      this.isSpaceHeld.set(false);
      this.isPanning.set(false);
    }
  }

  @HostListener('document:mousemove', ['$event'])
  onMouseMove(e: MouseEvent): void {
    if (!this.isPanning()) return;
    this.store.pan(e.clientX - this.lastMouseX, e.clientY - this.lastMouseY);
    this.lastMouseX = e.clientX;
    this.lastMouseY = e.clientY;
  }

  @HostListener('document:mouseup')
  onMouseUp(): void {
    this.isPanning.set(false);
  }

  protected onMouseDown(e: MouseEvent): void {
    if (this.isSpaceHeld()) {
      e.preventDefault();
      this.isPanning.set(true);
      this.lastMouseX = e.clientX;
      this.lastMouseY = e.clientY;
    }
  }

  protected onWheel(e: WheelEvent): void {
    e.preventDefault();
    const factor = e.deltaY < 0 ? 1.1 : 1 / 1.1;
    const rect = (this.el.nativeElement as HTMLElement).getBoundingClientRect();
    this.store.zoom(factor, e.clientX - rect.left, e.clientY - rect.top);
  }
}
