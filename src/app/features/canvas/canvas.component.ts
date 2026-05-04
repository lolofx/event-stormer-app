import {
  Component,
  ElementRef,
  HostListener,
  computed,
  inject,
  signal,
} from '@angular/core';
import { CdkDragDrop, CdkDropList } from '@angular/cdk/drag-drop';
import { CanvasStore } from './canvas.store';
import { FullscreenService } from '../../core/fullscreen/fullscreen.service';
import { BackgroundGridComponent } from './background-grid.component';
import { StickyCardComponent } from '../../shared/ui/sticky-card/sticky-card.component';
import { ActionBarComponent } from '../../shared/ui/action-bar/action-bar.component';
import { EditableTitleComponent } from '../../shared/ui/editable-title/editable-title.component';
import { PaletteDockComponent } from '../palette/palette-dock.component';
import { WorkshopStore } from '../workshop/workshop.store';
import { StickyType } from '../../domain/sticky-type';
import { screenToCanvas } from './coordinate-translator';
import type { Sticky } from '../../domain/sticky';

@Component({
  selector: 'app-canvas',
  standalone: true,
  imports: [
    BackgroundGridComponent,
    StickyCardComponent,
    ActionBarComponent,
    EditableTitleComponent,
    PaletteDockComponent,
    CdkDropList,
  ],
  template: `
    <!-- Canvas host — drop target for palette items -->
    <div
      class="canvas-host"
      [class.cursor-grabbing]="isPanning()"
      [class.cursor-grab]="isSpaceHeld() && !isPanning()"
      tabindex="0"
      cdkDropList
      id="canvas-drop-list"
      [cdkDropListSortingDisabled]="true"
      [cdkDropListConnectedTo]="['palette-drop-list']"
      (cdkDropListDropped)="onDrop($event)"
      (mousedown)="onMouseDown($event)"
      (wheel)="onWheel($event)"
    >
      <app-background-grid [viewport]="store.viewport()" />

      <!-- SVG canvas: stickies follow pan/zoom transform -->
      <svg class="canvas-svg" aria-label="Canvas Event Storming">
        <!--
          CDK DragDrop + CSS scale trap:
          The SVG content group uses scale(zoom). CDK computes positions in screen
          coordinates, so we use screenToCanvas() at drop time to get canvas coords.
          Moving stickies ON the canvas (future step) will need the same treatment.
        -->
        <g [attr.transform]="store.svgTransform()">
          @for (s of stickies(); track s.id) {
            <foreignObject
              [attr.x]="s.x"
              [attr.y]="s.y"
              width="200"
              height="160"
              overflow="visible"
            >
              <app-sticky-card
                [type]="s.type"
                [label]="s.label"
                [rotation]="s.rotation"
                [selected]="selectedId() === s.id"
                (click)="onStickyClick(s)"
              />
            </foreignObject>
          }
        </g>
      </svg>
    </div>

    <!-- Inline label editor — shown above selected sticky -->
    @if (editingSticky(); as editing) {
      <input
        class="sticky-editor font-sans font-medium text-base bg-transparent border-none outline-none text-center w-36"
        [value]="editing.label"
        [attr.aria-label]="'Libellé du sticky ' + editing.type"
        [style.left.px]="editingScreenX()"
        [style.top.px]="editingScreenY()"
        (input)="onLabelInput($event, editing.id)"
        (blur)="onLabelBlur(editing.id, $event)"
        (keydown.enter)="clearEditing()"
        (keydown.escape)="clearEditing()"
        #editorInput
      />
    }

    <!-- Titre éditable — haut-gauche -->
    <app-editable-title
      [title]="workshopStore.name()"
      (titleChange)="workshopStore.rename($event)"
    />

    <!-- Palette dock pédagogique — bas-centre -->
    <app-palette-dock
      [collapsed]="dockCollapsed()"
      (toggleCollapsed)="dockCollapsed.set(!dockCollapsed())"
    />

    <!-- Barre d'actions — bas-droite -->
    <app-action-bar>
      <button
        class="flex items-center justify-center w-10 h-10 text-text-secondary hover:text-text-primary hover:bg-gray-50 transition-colors"
        title="Export Markdown (Ctrl+E)"
        aria-label="Exporter en Markdown"
        (click)="onExport()"
      >
        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="w-5 h-5">
          <path stroke-linecap="round" stroke-linejoin="round" d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5M16.5 12L12 16.5m0 0L7.5 12m4.5 4.5V3" />
        </svg>
      </button>

      <div class="w-8 mx-auto border-t border-ui-border"></div>

      <button
        class="flex items-center justify-center w-10 h-10 text-text-secondary hover:text-text-primary hover:bg-gray-50 transition-colors"
        title="Nouveau workshop (Ctrl+N)"
        aria-label="Nouveau workshop"
      >
        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="w-5 h-5">
          <path stroke-linecap="round" stroke-linejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
        </svg>
      </button>

      <button
        class="flex items-center justify-center w-10 h-10 text-text-secondary hover:text-text-primary hover:bg-gray-50 transition-colors"
        title="Importer un workshop"
        aria-label="Importer un workshop"
      >
        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="w-5 h-5">
          <path stroke-linecap="round" stroke-linejoin="round" d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5m-13.5-9L12 3m0 0l4.5 4.5M12 3v13.5" />
        </svg>
      </button>

      <div class="w-8 mx-auto border-t border-ui-border"></div>

      <button
        class="flex items-center justify-center w-10 h-10 text-text-secondary hover:text-text-primary hover:bg-gray-50 transition-colors"
        title="Plein écran (F)"
        aria-label="Basculer le plein écran"
        (click)="toggleFullscreen()"
      >
        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="w-5 h-5">
          <path stroke-linecap="round" stroke-linejoin="round" d="M3.75 3.75v4.5m0-4.5h4.5m-4.5 0L9 9M3.75 20.25v-4.5m0 4.5h4.5m-4.5 0L9 15M20.25 3.75h-4.5m4.5 0v4.5m0-4.5L15 9m5.25 11.25h-4.5m4.5 0v-4.5m0 4.5L15 15" />
        </svg>
      </button>
    </app-action-bar>
  `,
  styles: [
    '.canvas-host { position: fixed; inset: 0; overflow: hidden; background: var(--canvas-bg); outline: none; }',
    '.canvas-svg { position: absolute; inset: 0; width: 100%; height: 100%; }',
    '.cursor-grab { cursor: grab; }',
    '.cursor-grabbing { cursor: grabbing; }',
    '.sticky-editor { position: fixed; z-index: 60; transform: translate(-50%, -50%); padding: 4px 8px; }',
  ],
})
export class CanvasComponent {
  protected readonly store = inject(CanvasStore);
  protected readonly workshopStore = inject(WorkshopStore);
  private readonly fullscreen = inject(FullscreenService);
  private readonly el = inject(ElementRef<HTMLElement>);

  protected readonly isSpaceHeld = signal(false);
  protected readonly isPanning = signal(false);
  protected readonly dockCollapsed = signal(false);
  protected readonly selectedId = signal<string | null>(null);
  protected readonly editingId = signal<string | null>(null);

  protected readonly stickies = this.workshopStore.stickies;

  protected readonly editingSticky = computed<Sticky | null>(() => {
    const id = this.editingId();
    if (!id) return null;
    return this.stickies().find((s) => s.id === id) ?? null;
  });

  protected readonly editingScreenX = computed(() => {
    const s = this.editingSticky();
    if (!s) return 0;
    const { panX, zoom } = this.store.viewport();
    const rect = this.el.nativeElement.getBoundingClientRect();
    return s.x * zoom + panX + rect.left + (s.width * zoom) / 2;
  });

  protected readonly editingScreenY = computed(() => {
    const s = this.editingSticky();
    if (!s) return 0;
    const { panY, zoom } = this.store.viewport();
    const rect = this.el.nativeElement.getBoundingClientRect();
    return s.y * zoom + panY + rect.top + (s.height * zoom) / 2;
  });

  private lastMouseX = 0;
  private lastMouseY = 0;

  @HostListener('document:keydown', ['$event'])
  onKeyDown(e: KeyboardEvent): void {
    if (e.code === 'Space' && !e.repeat) {
      e.preventDefault();
      this.isSpaceHeld.set(true);
    }
    if (e.code === 'KeyF') void this.fullscreen.toggle();
    if (e.code === 'KeyD') this.dockCollapsed.set(!this.dockCollapsed());
    if (e.ctrlKey && e.code === 'KeyE') { e.preventDefault(); this.onExport(); }
    if (e.code === 'Delete' || e.code === 'Backspace') {
      const id = this.selectedId();
      if (id) { this.workshopStore.removeSticky(id); this.selectedId.set(null); }
    }
    if (e.code === 'Escape') this.clearEditing();
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
    const rect = this.el.nativeElement.getBoundingClientRect();
    this.store.zoom(factor, e.clientX - rect.left, e.clientY - rect.top);
  }

  protected onDrop(event: CdkDragDrop<StickyType[]>): void {
    const type = event.item.data as StickyType;
    const rect = this.el.nativeElement.getBoundingClientRect();
    const { x, y } = screenToCanvas(
      event.dropPoint.x, event.dropPoint.y,
      rect.left, rect.top,
      this.store.viewport(),
    );
    this.workshopStore.addSticky(type, x, y);
    // Immediately enter edit mode on the newly created sticky
    const newSticky = this.stickies()[this.stickies().length - 1];
    if (newSticky) {
      this.selectedId.set(newSticky.id);
      this.editingId.set(newSticky.id);
    }
  }

  protected onStickyClick(s: Sticky): void {
    this.selectedId.set(s.id);
    this.editingId.set(s.id);
  }

  protected onLabelInput(e: Event, id: string): void {
    const value = (e.target as HTMLInputElement).value;
    this.workshopStore.updateLabel(id, value);
  }

  protected onLabelBlur(id: string, e: FocusEvent): void {
    const value = (e.target as HTMLInputElement).value;
    this.workshopStore.updateLabel(id, value);
    this.clearEditing();
  }

  protected clearEditing(): void {
    this.editingId.set(null);
    this.selectedId.set(null);
  }

  protected toggleFullscreen(): void {
    void this.fullscreen.toggle();
  }

  protected onExport(): void {
    // Wired in étape 10
    console.log('Export Markdown — étape 10');
  }
}
