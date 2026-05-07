import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogModule, MatDialogRef } from '@angular/material/dialog';

export interface LevelUnlockDialogData {
  level: 'Process' | 'Design';
  description: string;
}

@Component({
  selector: 'app-level-unlock-dialog',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [MatDialogModule],
  template: `
    <div class="p-6">
      <h2 class="text-lg font-semibold text-[#1A1A1A] mb-2">
        Débloquer le {{ data.level }} Level
      </h2>
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
          Débloquer
        </button>
      </div>
    </div>
  `,
})
export class LevelUnlockDialogComponent {
  protected readonly data = inject<LevelUnlockDialogData>(MAT_DIALOG_DATA);
  private readonly ref = inject(MatDialogRef<LevelUnlockDialogComponent>);

  protected close(confirmed: boolean): void {
    this.ref.close(confirmed);
  }
}
