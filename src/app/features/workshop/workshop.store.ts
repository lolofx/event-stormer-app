import { Injectable, computed, inject, signal } from '@angular/core';
import { WorkshopPersistenceService } from '../../core/persistence';
import {
  addSticky,
  createWorkshop,
  moveSticky,
  removeSticky,
  renameWorkshop,
  updateStickyLabel,
} from '../../domain/workshop';
import { createSticky } from '../../domain/sticky';
import { StickyType } from '../../domain/sticky-type';

@Injectable({ providedIn: 'root' })
export class WorkshopStore {
  private readonly persistence = inject(WorkshopPersistenceService);
  private readonly _workshop = signal(createWorkshop('Mon atelier DDD'));
  private saveTimer: ReturnType<typeof setTimeout> | null = null;

  readonly workshop = this._workshop.asReadonly();
  readonly stickies = computed(() => this._workshop().stickies);
  readonly name = computed(() => this._workshop().name);
  readonly activeLevel = computed(() => this._workshop().activeLevel);
  readonly levelUnlockState = computed(() => this._workshop().levelUnlockState);

  async initialize(): Promise<void> {
    const saved = await this.persistence.repository.load();
    if (saved) this._workshop.set(saved);
  }

  addSticky(type: StickyType, x: number, y: number): void {
    this._workshop.update((w) => addSticky(w, createSticky(type, x, y)));
    this.scheduleSave();
  }

  removeSticky(id: string): void {
    this._workshop.update((w) => removeSticky(w, id));
    this.scheduleSave();
  }

  moveSticky(id: string, x: number, y: number): void {
    this._workshop.update((w) => moveSticky(w, id, x, y));
    this.scheduleSave();
  }

  updateLabel(id: string, label: string): void {
    this._workshop.update((w) => updateStickyLabel(w, id, label));
    this.scheduleSave();
  }

  rename(name: string): void {
    this._workshop.update((w) => renameWorkshop(w, name));
    this.scheduleSave();
  }

  private scheduleSave(): void {
    if (this.saveTimer !== null) clearTimeout(this.saveTimer);
    // RM08 — debounce 500 ms
    this.saveTimer = setTimeout(() => {
      void this.persistence.repository.save(this._workshop());
      this.saveTimer = null;
    }, 500);
  }
}
