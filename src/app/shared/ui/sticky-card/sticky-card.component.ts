import { Component, ElementRef, computed, effect, input, output, viewChild } from '@angular/core';
import { StickyType } from '../../../domain/sticky-type';

export interface StickyColors {
  readonly bg: string;
  readonly border: string;
  readonly text: string;
}

export const STICKY_COLORS: Record<StickyType, StickyColors> = {
  [StickyType.DomainEvent]: { bg: '#ff9900', border: '#b36b00', text: '#000' },
  [StickyType.Command]: { bg: '#4a90e2', border: '#2e5c8a', text: '#fff' },
  [StickyType.Actor]: { bg: '#ffeb3b', border: '#b8a82a', text: '#000' },
  [StickyType.Policy]: { bg: '#9c27b0', border: '#6a1b9a', text: '#fff' },
  [StickyType.ExternalSystem]: { bg: '#ec407a', border: '#ad1457', text: '#fff' },
  [StickyType.Aggregate]: { bg: '#fff59d', border: '#bfa726', text: '#000' },
  [StickyType.ReadModel]: { bg: '#66bb6a', border: '#2e7d32', text: '#fff' },
  [StickyType.BoundedContext]: { bg: 'transparent', border: '#424242', text: '#1a1a1a' },
};

@Component({
  selector: 'app-sticky-card',
  standalone: true,
  styles: [`
    textarea {
      field-sizing: content;
      min-height: 0;
    }
  `],
  template: `
    <div
      data-testid="sticky-card"
      class="relative flex items-center justify-center p-3 select-none transition-[box-shadow,transform] duration-150"
      [class]="shadowClass()"
      [class.border-dashed]="isBoundedContext()"
      [class.border-2]="isBoundedContext()"
      [class.border]="!isBoundedContext()"
      [class.cursor-pointer]="!isEditing()"
      [style.width.px]="width()"
      [style.height.px]="height()"
      [style.border-radius.px]="4"
      [style.background-color]="colors().bg"
      [style.border-color]="colors().border"
      [style.color]="colors().text"
      [style.transform]="transform()"
      [style.outline]="selected() ? '2px solid #0a0a0a' : 'none'"
      [style.outline-offset.px]="4"
    >
      @if (isEditing()) {
        <textarea
          #editor
          class="bg-transparent border-none outline-none resize-none text-center font-sans font-medium text-lg leading-snug w-full overflow-hidden"
          [style.color]="colors().text"
          [value]="label()"
          rows="3"
          (input)="labelChange.emit($any($event.target).value)"
          (blur)="editingDone.emit()"
          (keydown.enter)="$event.preventDefault(); editingDone.emit()"
          (keydown.escape)="editingDone.emit()"
          (keydown)="$event.stopPropagation()"
          (click)="$event.stopPropagation()"
        ></textarea>
      } @else {
        <span class="text-center font-sans font-medium text-lg leading-snug break-words line-clamp-3 w-full pointer-events-none">
          @if (label()) {
            {{ label() }}
          } @else if (showEmptyPlaceholder()) {
            <span class="opacity-40 text-sm italic">sans libellé</span>
          }
        </span>
      }
    </div>
  `,
})
export class StickyCardComponent {
  type = input.required<StickyType>();
  label = input<string>('');
  rotation = input<number>(0);
  selected = input<boolean>(false);
  isDragging = input<boolean>(false);
  isEditing = input<boolean>(false);
  showEmptyPlaceholder = input<boolean>(false);
  width = input<number>(160);
  height = input<number>(120);

  readonly labelChange = output<string>();
  readonly editingDone = output<void>();

  private readonly editorRef = viewChild<ElementRef<HTMLTextAreaElement>>('editor');

  constructor() {
    effect(() => {
      if (this.isEditing()) {
        queueMicrotask(() => this.editorRef()?.nativeElement.focus());
      }
    });
  }

  protected colors = computed(() => STICKY_COLORS[this.type()]);
  protected transform = computed(() => `rotate(${this.rotation()}deg)`);
  protected isBoundedContext = computed(() => this.type() === StickyType.BoundedContext);
  protected shadowClass = computed(() =>
    this.isDragging() ? 'shadow-sticky-hover' : 'shadow-sticky-rest'
  );

  focus(): void {
    this.editorRef()?.nativeElement.focus();
  }
}
