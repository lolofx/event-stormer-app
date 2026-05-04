import { Component, computed, inject, input, output } from '@angular/core';
import { CdkDrag, CdkDragPreview, CdkDragPlaceholder, CdkDropList } from '@angular/cdk/drag-drop';
import { DockComponent } from '../../shared/ui/dock/dock.component';
import { StickyCardComponent } from '../../shared/ui/sticky-card/sticky-card.component';
import { PedagogyTooltipDirective } from '../../shared/ui/pedagogy-tooltip/pedagogy-tooltip.directive';
import { WorkshopStore } from '../workshop/workshop.store';
import { StickyType } from '../../domain/sticky-type';
import { availableTypes } from '../../domain/level-unlock-state';
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

@Component({
  selector: 'app-palette-dock',
  standalone: true,
  imports: [
    DockComponent,
    StickyCardComponent,
    PedagogyTooltipDirective,
    CdkDrag,
    CdkDragPreview,
    CdkDragPlaceholder,
    CdkDropList,
  ],
  styles: [`
    @keyframes fadeSlideIn {
      from { opacity: 0; transform: translateY(6px) scale(0.95); }
      to   { opacity: 1; transform: translateY(0)  scale(1); }
    }
    .item-enter { animation: fadeSlideIn 200ms cubic-bezier(0.2, 0.9, 0.3, 1) both; }
  `],
  template: `
    <app-dock [collapsed]="collapsed()" (toggleCollapsed)="toggleCollapsed.emit()">
      <!-- Connected to canvas-drop-list via id -->
      <div
        cdkDropList
        id="palette-drop-list"
        [cdkDropListConnectedTo]="['canvas-drop-list']"
        [cdkDropListSortingDisabled]="true"
        class="flex items-center gap-3"
      >
        @for (item of dockItems(); track item.type) {
          <div
            data-testid="palette-item"
            class="flex flex-col items-center gap-1.5 item-enter"
          >
            <div
              class="relative"
              [appPedagogyTooltip]="tooltips[item.type]"
              [tabindex]="0"
              [attr.aria-label]="tooltips[item.type].label"
            >
              <div
                cdkDrag
                [cdkDragData]="item.type"
                class="transition-transform duration-150 cursor-grab hover:scale-105 active:cursor-grabbing"
                style="touch-action: none;"
              >
                <app-sticky-card
                  [type]="item.type"
                  [label]="''"
                  [width]="48"
                  [height]="48"
                  [rotation]="0"
                />
                <!-- Full-size preview during drag -->
                <ng-template cdkDragPreview>
                  <app-sticky-card
                    [type]="item.type"
                    [label]="''"
                    [width]="160"
                    [height]="120"
                    [rotation]="0"
                  />
                </ng-template>
                <!-- Ghost stays in dock while dragging -->
                <ng-template cdkDragPlaceholder>
                  <div class="w-12 h-12 rounded opacity-30 border-2 border-dashed border-ui-border"></div>
                </ng-template>
              </div>
            </div>
            <span
              data-testid="palette-item-label"
              class="text-[10px] font-medium font-sans leading-none text-text-secondary"
            >
              {{ labels[item.type] }}
            </span>
          </div>
        }
      </div>
    </app-dock>
  `,
})
export class PaletteDockComponent {
  collapsed = input<boolean>(false);
  toggleCollapsed = output<void>();

  private readonly workshopStore = inject(WorkshopStore);

  protected readonly tooltips = STICKY_TOOLTIPS;
  protected readonly labels = DOCK_LABELS;

  protected readonly dockItems = computed(() =>
    availableTypes(this.workshopStore.levelUnlockState()).map((type) => ({ type }))
  );
}
