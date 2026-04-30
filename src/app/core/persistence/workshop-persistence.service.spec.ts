import { describe, it, expect, vi, beforeEach } from 'vitest';
import { TestBed } from '@angular/core/testing';
import { MatSnackBar } from '@angular/material/snack-bar';
import { WorkshopPersistenceService } from './workshop-persistence.service';

describe('WorkshopPersistenceService', () => {
  let snackBarSpy: { open: ReturnType<typeof vi.fn> };

  beforeEach(() => {
    snackBarSpy = { open: vi.fn() };
    TestBed.configureTestingModule({
      providers: [
        WorkshopPersistenceService,
        { provide: MatSnackBar, useValue: snackBarSpy },
      ],
    });
  });

  it('should be created', () => {
    const service = TestBed.inject(WorkshopPersistenceService);
    expect(service).toBeTruthy();
  });

  it('should expose a repository', () => {
    const service = TestBed.inject(WorkshopPersistenceService);
    expect(service.repository).toBeDefined();
    expect(typeof service.repository.save).toBe('function');
    expect(typeof service.repository.load).toBe('function');
    expect(typeof service.repository.clear).toBe('function');
  });

  it('should expose usingFallback as a boolean signal', () => {
    const service = TestBed.inject(WorkshopPersistenceService);
    expect(typeof service.usingFallback()).toBe('boolean');
  });
});
