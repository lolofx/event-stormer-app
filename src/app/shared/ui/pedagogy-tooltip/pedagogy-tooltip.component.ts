import { Component, inject } from '@angular/core';
import { PEDAGOGY_TOOLTIP_DATA } from './pedagogy-tooltip.token';
import type { StickyTooltipData } from '../../pedagogy/sticky-tooltips';

@Component({
  selector: 'app-pedagogy-tooltip',
  standalone: true,
  host: { class: 'block pointer-events-none' },
  styles: [`
    :host { animation: tooltipIn 140ms cubic-bezier(0.2, 0.9, 0.3, 1) both; }
    @keyframes tooltipIn {
      from { opacity: 0; transform: translateY(4px); }
      to   { opacity: 1; transform: translateY(0); }
    }
  `],
  template: `
    <div
      class="w-72 bg-white rounded-xl border border-ui-border overflow-hidden"
      style="box-shadow: 0 8px 32px rgba(0,0,0,0.12), 0 2px 8px rgba(0,0,0,0.06);"
      role="tooltip"
    >
      <!-- Colored accent strip matching sticky type -->
      <div class="h-1 w-full" [style.background-color]="data.color"></div>

      <div class="p-4 space-y-3">
        <h3 class="font-sans font-semibold text-sm" [style.color]="data.color">
          {{ data.label }}
        </h3>

        <p class="text-sm text-text-primary leading-relaxed">
          {{ data.definition }}
        </p>

        <div class="border-t border-ui-border pt-3 space-y-2.5">
          <div>
            <span class="block mb-1 text-[10px] font-semibold uppercase tracking-wider text-text-secondary">
              Exemple
            </span>
            <p class="text-sm text-text-secondary italic leading-relaxed">{{ data.example }}</p>
          </div>
          <div>
            <span class="block mb-1 text-[10px] font-semibold uppercase tracking-wider text-text-secondary">
              Astuce
            </span>
            <p class="text-sm text-text-secondary leading-relaxed">{{ data.tip }}</p>
          </div>
        </div>
      </div>
    </div>
  `,
})
export class PedagogyTooltipComponent {
  protected readonly data = inject<StickyTooltipData>(PEDAGOGY_TOOLTIP_DATA);
}
