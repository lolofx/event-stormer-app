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
import { StickyType } from '../../domain/sticky-type';
import { StickyCardComponent } from '../../shared/ui/sticky-card/sticky-card.component';
import { DockComponent } from '../../shared/ui/dock/dock.component';
import { ActionBarComponent } from '../../shared/ui/action-bar/action-bar.component';
import { EditableTitleComponent } from '../../shared/ui/editable-title/editable-title.component';

interface DockItem {
  readonly type: StickyType;
  readonly label: string;
  readonly locked: boolean;
}

interface PreviewSticky {
  readonly type: StickyType;
  readonly label: string;
  readonly x: number;
  readonly y: number;
  readonly rotation: number;
}

const DOCK_ITEMS: DockItem[] = [
  { type: StickyType.DomainEvent, label: 'Event', locked: false },
  { type: StickyType.Command, label: 'Command', locked: true },
  { type: StickyType.Actor, label: 'Actor', locked: true },
  { type: StickyType.Policy, label: 'Policy', locked: true },
  { type: StickyType.ExternalSystem, label: 'External', locked: true },
];

// Alpha preview — remplacé par WorkshopStore en étape 8
const PREVIEW_STICKIES: PreviewSticky[] = [
  { type: StickyType.DomainEvent, label: 'Commande passée',  x: 120, y: 150, rotation: -1.2 },
  { type: StickyType.DomainEvent, label: 'Paiement validé',  x: 360, y: 120, rotation:  0.8 },
  { type: StickyType.DomainEvent, label: 'Colis expédié',    x: 600, y: 155, rotation: -0.5 },
  { type: StickyType.Command,     label: 'Passer commande',  x:  70, y: 340, rotation:  1.1 },
  { type: StickyType.Actor,       label: 'Client',           x: 490, y: 340, rotation: -0.7 },
];

@Component({
  selector: 'app-canvas',
  standalone: true,
  imports: [
    BackgroundGridComponent,
    StickyCardComponent,
    DockComponent,
    ActionBarComponent,
    EditableTitleComponent,
  ],
  template: `
    <!-- Canvas host -->
    <div
      class="canvas-host"
      [class.cursor-grabbing]="isPanning()"
      [class.cursor-grab]="isSpaceHeld() && !isPanning()"
      tabindex="0"
      (mousedown)="onMouseDown($event)"
      (wheel)="onWheel($event)"
    >
      <app-background-grid [viewport]="store.viewport()" />

      <!-- SVG canvas: stickies follow pan/zoom transform -->
      <svg class="canvas-svg" [attr.aria-label]="'Canvas Event Storming'">
        <!--
          IMPORTANT — CDK DragDrop + CSS scale:
          When this SVG is scaled via a CSS transform on the host, CDK DragDrop
          computes incorrect drop positions unless the current zoom is passed as
          input to the cdkDrag directive. Wired in étape 8 (palette dock).
        -->
        <g [attr.transform]="store.svgTransform()">
          @for (s of previewStickies; track s.label) {
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
              />
            </foreignObject>
          }
        </g>
      </svg>
    </div>

    <!-- Titre éditable — haut-gauche -->
    <app-editable-title
      [title]="workshopTitle()"
      (titleChange)="workshopTitle.set($event)"
    />

    <!-- Dock palette — bas-centre -->
    <app-dock
      [collapsed]="dockCollapsed()"
      (toggleCollapsed)="dockCollapsed.set(!dockCollapsed())"
    >
      @for (item of dockItems; track item.type) {
        <div class="flex flex-col items-center gap-1.5">
          <div
            class="relative transition-transform duration-150"
            [class]="item.locked
              ? 'opacity-40 cursor-not-allowed'
              : 'cursor-pointer hover:scale-105'"
          >
            <app-sticky-card
              [type]="item.type"
              [label]="''"
              [width]="48"
              [height]="48"
              [rotation]="0"
            />
            @if (item.locked) {
              <div class="absolute inset-0 flex items-center justify-center pointer-events-none">
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" class="w-3.5 h-3.5 text-text-primary">
                  <path fill-rule="evenodd" d="M10 1a4.5 4.5 0 00-4.5 4.5V9H5a2 2 0 00-2 2v6a2 2 0 002 2h10a2 2 0 002-2v-6a2 2 0 00-2-2h-.5V5.5A4.5 4.5 0 0010 1zm3 8V5.5a3 3 0 10-6 0V9h6z" clip-rule="evenodd" />
                </svg>
              </div>
            }
          </div>
          <span class="text-[10px] font-medium text-text-secondary font-sans leading-none">
            {{ item.label }}
          </span>
        </div>
      }
    </app-dock>

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
  ],
})
export class CanvasComponent {
  protected readonly store = inject(CanvasStore);
  private readonly fullscreen = inject(FullscreenService);
  private readonly el = inject(ElementRef);

  protected readonly isSpaceHeld = signal(false);
  protected readonly isPanning = signal(false);
  protected readonly dockCollapsed = signal(false);
  protected readonly workshopTitle = signal('Mon atelier DDD');

  protected readonly dockItems = DOCK_ITEMS;
  protected readonly previewStickies = PREVIEW_STICKIES;

  private lastMouseX = 0;
  private lastMouseY = 0;

  protected readonly hostElement = computed(() => this.el.nativeElement as HTMLElement);

  @HostListener('document:keydown', ['$event'])
  onKeyDown(e: KeyboardEvent): void {
    if (e.code === 'Space' && !e.repeat) {
      e.preventDefault();
      this.isSpaceHeld.set(true);
    }
    if (e.code === 'KeyF') void this.fullscreen.toggle();
    if (e.code === 'KeyD') this.dockCollapsed.set(!this.dockCollapsed());
    if (e.ctrlKey && e.code === 'KeyE') { e.preventDefault(); this.onExport(); }
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

  protected toggleFullscreen(): void {
    void this.fullscreen.toggle();
  }

  protected onExport(): void {
    // Branché en étape 10
    console.log('Export Markdown — étape 10');
  }
}
