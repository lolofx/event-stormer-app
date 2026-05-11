import { ChangeDetectionStrategy, Component, inject, signal } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogModule, MatDialogRef } from '@angular/material/dialog';

export interface NewWorkshopDialogData {
  /** Pre-built JSON content ready to download. */
  filename: string;
  content: string;
}

@Component({
  selector: 'app-new-workshop-dialog',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [MatDialogModule],
  template: `
    <div class="p-6 w-[420px]">
      <h2 class="text-lg font-semibold text-[#1A1A1A] mb-2">Nouveau workshop</h2>
      <p class="text-sm text-[#6B6B6B] mb-1">
        Le workshop actuel sera effacé de manière irréversible.
      </p>
      <p class="text-sm text-[#6B6B6B] mb-6">
        Exportez-le en JSON pour pouvoir le réimporter plus tard.
      </p>

      @if (exported()) {
        <p class="text-sm font-medium mb-4" style="color:#10B981">
          ✓ Workshop exporté — vous pouvez réinitialiser.
        </p>
      }

      <div class="flex justify-end gap-3">
        <button
          class="px-4 py-2 text-sm text-[#6B6B6B] hover:text-[#1A1A1A] transition-colors"
          (click)="cancel()"
        >
          Annuler
        </button>
        @if (!exported()) {
          <button
            class="px-4 py-2 text-sm font-medium bg-[#0A0A0A] text-white rounded-lg hover:bg-[#1A1A1A] transition-colors"
            (click)="downloadAndMarkExported()"
          >
            Exporter en JSON…
          </button>
        } @else {
          <button
            class="px-4 py-2 text-sm font-medium bg-[#EF4444] text-white rounded-lg hover:bg-[#DC2626] transition-colors"
            (click)="confirm()"
          >
            Réinitialiser
          </button>
        }
      </div>
    </div>
  `,
})
export class NewWorkshopDialogComponent {
  private readonly ref = inject(MatDialogRef<NewWorkshopDialogComponent, boolean>);
  protected readonly data = inject<NewWorkshopDialogData>(MAT_DIALOG_DATA);
  protected readonly exported = signal(false);

  protected downloadAndMarkExported(): void {
    const blob = new Blob([this.data.content], { type: 'application/json;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = this.data.filename;
    a.click();
    URL.revokeObjectURL(url);
    this.exported.set(true);
  }

  protected confirm(): void {
    this.ref.close(true);
  }

  protected cancel(): void {
    this.ref.close(false);
  }
}
