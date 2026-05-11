import { Injectable, inject } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { firstValueFrom } from 'rxjs';
import { exportJson } from '../../core/export/json-exporter';
import { WorkshopStore } from './workshop.store';
import { NewWorkshopDialogComponent } from './new-workshop-dialog.component';

@Injectable({ providedIn: 'root' })
export class NewWorkshopService {
  private readonly store = inject(WorkshopStore);
  private readonly dialog = inject(MatDialog);

  async requestNewWorkshop(): Promise<void> {
    const workshop = this.store.workshop();
    if (workshop.stickies.length === 0) {
      // Empty workshop — reset directly, no guard needed (RM09)
      this.store.resetWorkshop();
      return;
    }

    const { filename, content } = exportJson(workshop);
    const ref = this.dialog.open(NewWorkshopDialogComponent, {
      data: { filename, content },
      disableClose: true,
    });
    const confirmed = await firstValueFrom(ref.afterClosed());
    if (confirmed === true) {
      this.store.resetWorkshop();
    }
  }
}
