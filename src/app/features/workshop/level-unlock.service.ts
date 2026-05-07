import { Injectable, inject } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { firstValueFrom } from 'rxjs';
import { WorkshopStore } from './workshop.store';
import { LevelUnlockDialogComponent, LevelUnlockDialogData } from './level-unlock-dialog.component';

@Injectable({ providedIn: 'root' })
export class LevelUnlockService {
  private readonly store = inject(WorkshopStore);
  private readonly dialog = inject(MatDialog);

  async requestUnlockProcess(): Promise<void> {
    const confirmed = await this.openConfirmDialog({
      level: 'Process',
      description:
        'Débloque Commands, Actors, Policies et External Systems pour modéliser les flux de votre domaine.',
    });
    if (confirmed) this.store.unlockProcess();
  }

  async requestUnlockDesign(): Promise<void> {
    if (!this.store.levelUnlockState().processUnlocked) return;
    const confirmed = await this.openConfirmDialog({
      level: 'Design',
      description:
        'Débloque Aggregates, Read Models et Bounded Contexts pour affiner la modélisation tactique.',
    });
    if (confirmed) this.store.unlockDesign();
  }

  private async openConfirmDialog(data: LevelUnlockDialogData): Promise<boolean> {
    const ref = this.dialog.open(LevelUnlockDialogComponent, { data, width: '420px' });
    const result = await firstValueFrom(ref.afterClosed());
    return result === true;
  }
}
