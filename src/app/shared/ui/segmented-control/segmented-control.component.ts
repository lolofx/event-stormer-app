import { Component, input, output, computed } from '@angular/core';

export interface SegmentItem {
  readonly label: string;
  readonly value: string;
  readonly disabled?: boolean;
}

@Component({
  selector: 'app-segmented-control',
  standalone: true,
  styles: [`
    .segment-pill {
      transition: transform 220ms cubic-bezier(0.4, 0, 0.2, 1);
    }
  `],
  template: `
    <div
      role="group"
      [attr.aria-label]="ariaLabel()"
      class="relative flex items-stretch bg-[#EFEFED] rounded-full p-1"
    >
      <!-- Sliding indicator (GPU-accelerated via transform) -->
      <div
        class="segment-pill absolute top-1 bottom-1 rounded-full bg-accent shadow-sm"
        [style.width]="pillWidth()"
        [style.left.px]="4"
        [style.transform]="pillTransform()"
        [attr.aria-hidden]="true"
      ></div>

      @for (item of items(); track item.value) {
        <button
          type="button"
          class="relative z-10 flex-1 px-4 py-1.5 text-sm font-medium font-sans rounded-full transition-colors duration-150 whitespace-nowrap"
          [class.text-white]="item.value === selectedValue()"
          [class.text-text-secondary]="item.value !== selectedValue() && !item.disabled"
          [class.opacity-40]="item.disabled"
          [class.cursor-not-allowed]="item.disabled ?? false"
          [attr.aria-pressed]="item.value === selectedValue()"
          [attr.aria-disabled]="item.disabled ?? false"
          [disabled]="item.disabled ?? false"
          (click)="select(item)"
        >
          {{ item.label }}
        </button>
      }
    </div>
  `,
})
export class SegmentedControlComponent {
  items = input.required<SegmentItem[]>();
  selectedValue = input<string>('');
  ariaLabel = input<string>('Sélecteur de niveau');

  selectedChange = output<string>();

  protected selectedIndex = computed(() =>
    this.items().findIndex(i => i.value === this.selectedValue())
  );

  protected pillWidth = computed(
    () => `calc((100% - 8px) / ${this.items().length})`
  );

  protected pillTransform = computed(() => {
    const idx = Math.max(0, this.selectedIndex());
    return `translateX(calc(${idx} * 100%))`;
  });

  protected select(item: SegmentItem): void {
    if (item.disabled || item.value === this.selectedValue()) return;
    this.selectedChange.emit(item.value);
  }
}
