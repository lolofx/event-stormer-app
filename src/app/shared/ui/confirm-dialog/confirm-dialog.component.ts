import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogModule, MatDialogRef } from '@angular/material/dialog';

export interface ConfirmDialogData {
  title: string;
  description: string;
  confirmLabel?: string;
}

@Component({
  selector: 'app-confirm-dialog',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [MatDialogModule],
  template: `
    <div class="p-6">
      <h2 class="text-lg font-semibold text-[#1A1A1A] mb-2">{{ data.title }}</h2>
      <p class="text-sm text-[#6B6B6B] mb-6">{{ data.description }}</p>
      <div class="flex justify-end gap-3">
        <button
          class="px-4 py-2 text-sm text-[#6B6B6B] hover:text-[#1A1A1A] transition-colors"
          (click)="close(false)"
        >
          Annuler
        </button>
        <button
          class="px-4 py-2 text-sm font-medium bg-[#0A0A0A] text-white rounded-lg hover:bg-[#1A1A1A] transition-colors"
          (click)="close(true)"
        >
          {{ data.confirmLabel ?? 'Confirmer' }}
        </button>
      </div>
    </div>
  `,
})
export class ConfirmDialogComponent {
  protected readonly data = inject<ConfirmDialogData>(MAT_DIALOG_DATA);
  private readonly ref = inject(MatDialogRef<ConfirmDialogComponent, boolean>);

  protected close(confirmed: boolean): void {
    this.ref.close(confirmed);
  }
}
