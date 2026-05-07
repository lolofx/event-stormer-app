import { Component, computed, inject, input, output } from '@angular/core';
import { CdkDrag, CdkDragPreview, CdkDragEnd } from '@angular/cdk/drag-drop';
import { DockComponent } from '../../shared/ui/dock/dock.component';
import { StickyCardComponent } from '../../shared/ui/sticky-card/sticky-card.component';
import { PedagogyTooltipDirective } from '../../shared/ui/pedagogy-tooltip/pedagogy-tooltip.directive';
import { LevelSelectorComponent } from '../workshop/level-selector.component';
import { WorkshopStore } from '../workshop/workshop.store';
import { LevelUnlockService } from '../workshop/level-unlock.service';
import { StickyType } from '../../domain/sticky-type';
import { Level } from '../../domain/level';
import { STICKY_TOOLTIPS } from '../../shared/pedagogy/sticky-tooltips';

const DOCK_LABELS: Readonly<Record<StickyType, string>> = {
  [StickyType.DomainEvent]: 'Event',
  [StickyType.Command]: 'Command',
  [StickyType.Actor]: 'Actor',
  [StickyType.Policy]: 'Policy',
  [StickyType.ExternalSystem]: 'External',
  [StickyType.Aggregate]: 'Aggregate',
  [StickyType.ReadModel]: 'Read Model',
  [StickyType.BoundedContext]: 'Context',
};

// All types in level order (RM03)
const ALL_STICKY_TYPES: readonly StickyType[] = [
  StickyType.DomainEvent,
  StickyType.Command,
  StickyType.Actor,
  StickyType.Policy,
  StickyType.ExternalSystem,
  StickyType.Aggregate,
  StickyType.ReadModel,
  StickyType.BoundedContext,
];

interface DockItem {
  type: StickyType;
  locked: boolean;
}

@Component({
  selector: 'app-palette-dock',
  standalone: true,
  imports: [
    DockComponent,
    StickyCardComponent,
    PedagogyTooltipDirective,
    LevelSelectorComponent,
    CdkDrag,
    CdkDragPreview,
  ],
  styles: [`
    @keyframes fadeSlideIn {
      from { opacity: 0; transform: translateY(6px) scale(0.95); }
      to   { opacity: 1; transform: translateY(0)  scale(1); }
    }
    .item-enter { animation: fadeSlideIn 200ms cubic-bezier(0.2, 0.9, 0.3, 1) both; }
    /* CDK applique immédiatement un translate au démarrage du drag — désactiver la transition CSS
       à ce moment évite le retard "lent au début puis rattrape la souris", conserver uniquement au repos. */
    [cdkDrag]:not(.cdk-drag-dragging) { transition: transform 150ms cubic-bezier(0.2, 0.9, 0.3, 1); }

    @keyframes unlockPulse {
      0%, 100% { box-shadow: 0 0 0 0 rgba(10,10,10,0); }
      50% { box-shadow: 0 0 0 4px rgba(10,10,10,0.12); }
    }
    .unlock-pulse { animation: unlockPulse 1.8s ease-in-out infinite; }
  `],
  template: `
    <app-dock [collapsed]="collapsed()" (toggleCollapsed)="toggleCollapsed.emit()">
      <!-- Sticky items — all 8 types, locked ones greyed (RM03) -->
      <div class="flex items-center gap-3">
        @for (item of dockItems(); track item.type) {
          <div
            data-testid="palette-item"
            class="flex flex-col items-center gap-1.5 item-enter"
          >
            @if (!item.locked) {
              <div
                class="relative"
                [appPedagogyTooltip]="tooltips[item.type]"
                [tabindex]="0"
                [attr.aria-label]="tooltips[item.type].label"
              >
                <div
                  cdkDrag
                  [cdkDragData]="item.type"
                  class="cursor-grab hover:scale-105 active:cursor-grabbing"
                  style="touch-action: none;"
                  (cdkDragEnded)="onDragEnded($event, item.type)"
                >
                  <app-sticky-card
                    [type]="item.type"
                    [label]="''"
                    [width]="48"
                    [height]="48"
                    [rotation]="0"
                  />
                  <ng-template cdkDragPreview>
                    <app-sticky-card
                      [type]="item.type"
                      [label]="''"
                      [width]="160"
                      [height]="120"
                      [rotation]="0"
                    />
                  </ng-template>
                </div>
              </div>
            } @else {
              <div
                class="relative opacity-35 cursor-not-allowed"
                [attr.aria-label]="tooltips[item.type].label + ' (verrouillé)'"
                aria-disabled="true"
              >
                <app-sticky-card
                  [type]="item.type"
                  [label]="''"
                  [width]="48"
                  [height]="48"
                  [rotation]="0"
                />
                <div
                  data-testid="lock-icon"
                  class="absolute inset-0 flex items-end justify-end p-1 pointer-events-none"
                >
                  <svg class="w-3 h-3 text-[#6B6B6B]" viewBox="0 0 10 12" fill="currentColor" aria-hidden="true">
                    <path d="M8 5H7V3.5a2 2 0 0 0-4 0V5H2a1 1 0 0 0-1 1v4a1 1 0 0 0 1 1h6a1 1 0 0 0 1-1V6a1 1 0 0 0-1-1zM4 3.5a1 1 0 0 1 2 0V5H4V3.5zM5 9a1 1 0 1 1 0-2 1 1 0 0 1 0 2z"/>
                  </svg>
                </div>
              </div>
            }
            <span
              data-testid="palette-item-label"
              class="text-[10px] font-medium font-sans leading-none"
              [class.text-text-secondary]="!item.locked"
              [class.text-[#C4C4BE]]="item.locked"
            >
              {{ labels[item.type] }}
            </span>
          </div>
        }
      </div>

      <!-- Separator -->
      <div class="w-px h-10 bg-ui-border self-center mx-1 shrink-0"></div>

      <!-- Level controls -->
      <div class="flex flex-col items-center gap-2 shrink-0">
        <app-level-selector
          [activeLevel]="store.activeLevel()"
          [levelUnlockState]="store.levelUnlockState()"
          (levelChange)="onLevelChange($event)"
        />
        @if (!store.levelUnlockState().processUnlocked) {
          <button
            data-testid="unlock-process-btn"
            class="flex items-center gap-1 px-2.5 py-1 text-[10px] font-medium text-[#6B6B6B] rounded-lg border border-dashed border-[#E8E8E3] hover:border-[#0A0A0A] hover:text-[#0A0A0A] transition-all duration-150 unlock-pulse"
            aria-label="Débloquer le Process Level"
            (click)="onUnlockProcess()"
          >
            <svg class="w-2.5 h-2.5" viewBox="0 0 10 10" fill="currentColor" aria-hidden="true">
              <path d="M5 1a4 4 0 1 0 0 8A4 4 0 0 0 5 1zm.5 5.5h-1v-3h1v3zm0-4h-1v-1h1v1z"/>
            </svg>
            Process
          </button>
        } @else if (!store.levelUnlockState().designUnlocked) {
          <button
            data-testid="unlock-design-btn"
            class="flex items-center gap-1 px-2.5 py-1 text-[10px] font-medium text-[#6B6B6B] rounded-lg border border-dashed border-[#E8E8E3] hover:border-[#0A0A0A] hover:text-[#0A0A0A] transition-all duration-150 unlock-pulse"
            aria-label="Débloquer le Design Level"
            (click)="onUnlockDesign()"
          >
            <svg class="w-2.5 h-2.5" viewBox="0 0 10 10" fill="currentColor" aria-hidden="true">
              <path d="M5 1a4 4 0 1 0 0 8A4 4 0 0 0 5 1zm.5 5.5h-1v-3h1v3zm0-4h-1v-1h1v1z"/>
            </svg>
            Design
          </button>
        }
      </div>
    </app-dock>
  `,
})
export class PaletteDockComponent {
  collapsed = input<boolean>(false);
  toggleCollapsed = output<void>();
  readonly stickyDragEnded = output<{ type: StickyType; screenX: number; screenY: number }>();

  protected readonly store = inject(WorkshopStore);
  private readonly levelUnlockService = inject(LevelUnlockService);

  protected readonly tooltips = STICKY_TOOLTIPS;
  protected readonly labels = DOCK_LABELS;

  protected readonly dockItems = computed<DockItem[]>(() => {
    const state = this.store.levelUnlockState();
    return ALL_STICKY_TYPES.map((type) => ({
      type,
      locked:
        (type === StickyType.Command ||
          type === StickyType.Actor ||
          type === StickyType.Policy ||
          type === StickyType.ExternalSystem) &&
          !state.processUnlocked
          ? true
          : (type === StickyType.Aggregate ||
            type === StickyType.ReadModel ||
            type === StickyType.BoundedContext) &&
            !state.designUnlocked
            ? true
            : false,
    }));
  });

  protected onLevelChange(level: Level): void {
    this.store.setActiveLevel(level);
  }

  protected onUnlockProcess(): void {
    void this.levelUnlockService.requestUnlockProcess();
  }

  protected onUnlockDesign(): void {
    void this.levelUnlockService.requestUnlockDesign();
  }

  protected onDragEnded(event: CdkDragEnd, type: StickyType): void {
    // Reset position — CDK keeps the transform offset when there is no cdkDropList target
    event.source.reset();
    // Ignore clicks (distance < 5px) — only emit for real drags
    if (Math.abs(event.distance.x) < 5 && Math.abs(event.distance.y) < 5) return;
    this.stickyDragEnded.emit({ type, screenX: event.dropPoint.x, screenY: event.dropPoint.y });
  }
}
