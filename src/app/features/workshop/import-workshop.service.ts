import { Injectable, inject } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { MatSnackBar } from '@angular/material/snack-bar';
import { firstValueFrom } from 'rxjs';
import { parseWorkshopJson } from '../../core/import/workshop-validator';
import { ConfirmDialogComponent } from '../../shared/ui/confirm-dialog/confirm-dialog.component';
import { WorkshopStore } from './workshop.store';
import { CanvasStore } from '../canvas/canvas.store';
import { createViewport } from '../../domain/viewport';

@Injectable({ providedIn: 'root' })
export class ImportWorkshopService {
  private readonly store = inject(WorkshopStore);
  private readonly canvasStore = inject(CanvasStore);
  private readonly dialog = inject(MatDialog);
  private readonly snackBar = inject(MatSnackBar);

  triggerImport(): void {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = '.json,application/json';
    input.onchange = () => {
      const file = input.files?.[0];
      if (file) void this.handleFile(file);
    };
    input.click();
  }

  private async handleFile(file: File): Promise<void> {
    let raw: unknown;
    try {
      const text = await file.text();
      raw = JSON.parse(text) as unknown;
    } catch {
      this.snackBar.open('Fichier JSON invalide.', 'OK', { duration: 4000 });
      return;
    }

    const result = parseWorkshopJson(raw);
    if ('error' in result) {
      this.snackBar.open(`Import impossible : ${result.error}`, 'OK', { duration: 5000 });
      return;
    }

    const confirmed = await this.openConfirmDialog();
    if (!confirmed) return;

    const { workshop } = result;
    this.store.loadWorkshop(workshop);
    // Restore viewport from imported workshop (RM08)
    this.canvasStore.updateViewport(workshop.viewport ?? createViewport());
    this.snackBar.open(`Workshop « ${workshop.name} » importé.`, '', { duration: 3000 });
  }

  private async openConfirmDialog(): Promise<boolean> {
    const ref = this.dialog.open(ConfirmDialogComponent, {
      data: {
        title: 'Importer un workshop',
        description: 'Le workshop actuel sera remplacé par le fichier importé. Cette action est irréversible.',
        confirmLabel: 'Importer',
      },
      width: '420px',
    });
    const result = await firstValueFrom(ref.afterClosed());
    return result === true;
  }
}
