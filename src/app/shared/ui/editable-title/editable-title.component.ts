import { Component, effect, input, output, signal } from '@angular/core';

@Component({
  selector: 'app-editable-title',
  standalone: true,
  styles: [`
    input {
      /* Remove browser default focus ring — replaced by border-b */
      outline: none;
    }
  `],
  template: `
    <input
      type="text"
      class="bg-transparent border-0 border-b-2 border-transparent font-sans font-semibold text-xl text-text-primary placeholder:text-text-secondary cursor-text w-full transition-colors duration-200 px-1 py-0.5 hover:border-ui-border focus:border-accent min-w-[180px] max-w-[360px]"
      [value]="draft()"
      [placeholder]="placeholder()"
      [attr.aria-label]="'Nom du workshop : ' + (title() || placeholder())"
      (input)="onInput($event)"
      (blur)="onBlur()"
      (keydown)="onKeydown($event)"
    />
  `,
  host: {
    class: 'fixed top-4 left-4 z-50',
  },
})
export class EditableTitleComponent {
  title = input<string>('');
  placeholder = input<string>('Nom du workshop');

  titleChange = output<string>();

  protected draft = signal('');

  constructor() {
    // Keep draft in sync when title is updated externally
    effect(() => { this.draft.set(this.title()); });
  }

  protected onInput(event: Event): void {
    this.draft.set((event.target as HTMLInputElement).value);
  }

  protected onBlur(): void {
    const trimmed = this.draft().trim();
    if (!trimmed) {
      // Revert to original — don't persist empty names
      this.draft.set(this.title());
      return;
    }
    if (trimmed !== this.title()) {
      this.titleChange.emit(trimmed);
    }
  }

  protected onKeydown(event: KeyboardEvent): void {
    if (event.key === 'Escape') {
      this.draft.set(this.title());
      (event.target as HTMLInputElement).blur();
    }
  }
}
