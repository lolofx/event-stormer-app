import { TestBed } from '@angular/core/testing';
import { vi, describe, it, beforeEach, expect } from 'vitest';
import { signal } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { of } from 'rxjs';
import { LevelUnlockService } from './level-unlock.service';
import { WorkshopStore } from './workshop.store';
import { Level } from '../../domain/level';

function makeStore() {
  return {
    levelUnlockState: signal({ processUnlocked: false, designUnlocked: false }),
    activeLevel: signal(Level.BigPicture),
    unlockProcess: vi.fn(),
    unlockDesign: vi.fn(),
  };
}

function makeDialog(result: boolean) {
  return {
    open: vi.fn().mockReturnValue({ afterClosed: () => of(result) }),
  };
}

describe('LevelUnlockService', () => {
  let service: LevelUnlockService;
  let store: ReturnType<typeof makeStore>;
  let dialog: ReturnType<typeof makeDialog>;

  function setup(dialogResult: boolean) {
    store = makeStore();
    dialog = makeDialog(dialogResult);
    TestBed.configureTestingModule({
      providers: [
        LevelUnlockService,
        { provide: WorkshopStore, useValue: store },
        { provide: MatDialog, useValue: dialog },
      ],
    });
    service = TestBed.inject(LevelUnlockService);
  }

  describe('requestUnlockProcess', () => {
    it('should call unlockProcess when user confirms', async () => {
      setup(true);
      await service.requestUnlockProcess();
      expect(store.unlockProcess).toHaveBeenCalledTimes(1);
    });

    it('should not call unlockProcess when user cancels', async () => {
      setup(false);
      await service.requestUnlockProcess();
      expect(store.unlockProcess).not.toHaveBeenCalled();
    });

    it('should open a dialog', async () => {
      setup(true);
      await service.requestUnlockProcess();
      expect(dialog.open).toHaveBeenCalledTimes(1);
    });
  });

  describe('requestUnlockDesign', () => {
    it('should call unlockDesign when user confirms', async () => {
      setup(true);
      store.levelUnlockState.set({ processUnlocked: true, designUnlocked: false });
      await service.requestUnlockDesign();
      expect(store.unlockDesign).toHaveBeenCalledTimes(1);
    });

    it('should not call unlockDesign when user cancels', async () => {
      setup(false);
      store.levelUnlockState.set({ processUnlocked: true, designUnlocked: false });
      await service.requestUnlockDesign();
      expect(store.unlockDesign).not.toHaveBeenCalled();
    });

    it('should not open dialog when process is not unlocked', async () => {
      setup(true);
      await service.requestUnlockDesign();
      expect(dialog.open).not.toHaveBeenCalled();
      expect(store.unlockDesign).not.toHaveBeenCalled();
    });
  });
});
