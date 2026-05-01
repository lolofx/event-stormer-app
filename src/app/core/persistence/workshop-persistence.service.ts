import { Injectable, inject, signal } from '@angular/core';
import { MatSnackBar } from '@angular/material/snack-bar';
import { DexieWorkshopRepository } from './dexie-workshop.repository';
import { InMemoryWorkshopRepository } from './in-memory-workshop.repository';
import { WorkshopRepository } from './workshop-repository';

function isIndexedDbAvailable(): boolean {
  try {
    return typeof indexedDB !== 'undefined' && indexedDB !== null;
  } catch {
    // SecurityError in some private-browsing modes
    return false;
  }
}

@Injectable({ providedIn: 'root' })
export class WorkshopPersistenceService {
  private readonly snackBar = inject(MatSnackBar);

  readonly usingFallback = signal(false);
  readonly repository: WorkshopRepository;

  constructor() {
    if (isIndexedDbAvailable()) {
      this.repository = new DexieWorkshopRepository();
    } else {
      // Fallback for private/incognito browsing where IndexedDB is blocked
      this.repository = new InMemoryWorkshopRepository();
      this.usingFallback.set(true);
      this.snackBar.open(
        'Navigation privée détectée — les données ne seront pas conservées après fermeture.',
        'OK',
        { duration: 8000 },
      );
    }
  }
}
