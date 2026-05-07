import {
  ChangeDetectionStrategy,
  Component,
  computed,
  input,
  output,
} from '@angular/core';
import { Level } from '../../domain/level';
import { LevelUnlockState } from '../../domain/level-unlock-state';

interface Pill {
  level: Level;
  label: string;
  locked: boolean;
  index: number;
}

@Component({
  selector: 'app-level-selector',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div
      class="relative flex items-center bg-[#F0F0EC] rounded-xl p-[3px] gap-0"
      role="group"
      aria-label="Niveau actif"
    >
      <!-- Sliding indicator -->
      <div
        class="absolute top-[3px] left-[3px] h-[calc(100%-6px)] rounded-[10px] bg-[#0A0A0A] pointer-events-none"
        [style.width]="'calc((100% - 6px) / 3)'"
        [style.transform]="'translateX(calc(' + activeIndex() + ' * 100%))'"
        [style.transition]="'transform 220ms cubic-bezier(0.2, 0.9, 0.3, 1)'"
      ></div>

      @for (pill of pills(); track pill.level) {
        <button
          data-pill
          class="relative z-10 flex-1 flex items-center justify-center gap-1.5 py-1.5 px-3 rounded-[10px] text-xs font-medium select-none transition-colors duration-150 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#0A0A0A] focus-visible:ring-offset-1"
          [class.text-white]="activeIndex() === pill.index"
          [class.text-[#6B6B6B]]="activeIndex() !== pill.index && !pill.locked"
          [class.text-[#C4C4BE]]="pill.locked"
          [class.cursor-not-allowed]="pill.locked"
          [attr.aria-pressed]="activeIndex() === pill.index"
          [attr.aria-label]="pill.label + (pill.locked ? ' (verrouillé)' : '')"
          [disabled]="pill.locked"
          (click)="select(pill)"
        >
          @if (pill.locked) {
            <svg
              data-lock-icon
              class="w-2.5 h-2.5 shrink-0"
              viewBox="0 0 10 12"
              fill="currentColor"
              aria-hidden="true"
            >
              <path d="M8 5H7V3.5a2 2 0 0 0-4 0V5H2a1 1 0 0 0-1 1v4a1 1 0 0 0 1 1h6a1 1 0 0 0 1-1V6a1 1 0 0 0-1-1zM4 3.5a1 1 0 0 1 2 0V5H4V3.5zM5 9a1 1 0 1 1 0-2 1 1 0 0 1 0 2z"/>
            </svg>
          }
          <span>{{ pill.label }}</span>
        </button>
      }
    </div>
  `,
})
export class LevelSelectorComponent {
  readonly activeLevel = input.required<Level>();
  readonly levelUnlockState = input.required<LevelUnlockState>();
  readonly levelChange = output<Level>();

  readonly activeIndex = computed(() => {
    switch (this.activeLevel()) {
      case Level.BigPicture: return 0;
      case Level.ProcessLevel: return 1;
      case Level.DesignLevel: return 2;
    }
  });

  readonly pills = computed<Pill[]>(() => {
    const state = this.levelUnlockState();
    return [
      { level: Level.BigPicture, label: 'Big Picture', locked: false, index: 0 },
      { level: Level.ProcessLevel, label: 'Process', locked: !state.processUnlocked, index: 1 },
      { level: Level.DesignLevel, label: 'Design', locked: !state.designUnlocked, index: 2 },
    ];
  });

  protected select(pill: Pill): void {
    if (pill.locked || pill.index === this.activeIndex()) return;
    this.levelChange.emit(pill.level);
  }
}
