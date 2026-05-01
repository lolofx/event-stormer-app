import { Component, input, output } from '@angular/core';

@Component({
  selector: 'app-dock',
  standalone: true,
  styles: [`
    .dock-content-grid {
      display: grid;
      grid-template-rows: 1fr;
      transition: grid-template-rows 280ms cubic-bezier(0.4, 0, 0.2, 1);
    }
    .dock-content-grid.dock-collapsed {
      grid-template-rows: 0fr;
    }
    .dock-content-grid > div {
      overflow: hidden;
    }
  `],
  template: `
    <!-- Collapse handle — always visible, anchors the dock position -->
    <button
      data-testid="dock-handle"
      class="flex items-center justify-center w-12 h-5 mb-1 mx-auto group cursor-pointer"
      [attr.aria-label]="collapsed() ? 'Déplier le dock' : 'Replier le dock'"
      [attr.aria-expanded]="!collapsed()"
      (click)="toggleCollapsed.emit()"
    >
      <span
        class="block w-8 h-1 rounded-full bg-ui-border transition-colors duration-200 group-hover:bg-text-secondary"
      ></span>
    </button>

    <!-- Content wrapper: grid-template-rows transition for smooth collapse -->
    <div
      data-testid="dock-content"
      class="dock-content-grid"
      [class.dock-collapsed]="collapsed()"
    >
      <div>
        <div
          class="flex items-center gap-3 px-4 py-3 bg-white/95 backdrop-blur-md rounded-2xl border border-ui-border shadow-dock"
        >
          <ng-content />
        </div>
      </div>
    </div>
  `,
  host: {
    class: 'fixed bottom-6 left-1/2 -translate-x-1/2 z-50 flex flex-col items-center',
  },
})
export class DockComponent {
  collapsed = input<boolean>(false);
  toggleCollapsed = output<void>();
}
