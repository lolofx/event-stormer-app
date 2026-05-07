import { describe, expect, it } from 'vitest';
import { addSticky, createWorkshop } from '../../domain/workshop';
import { createSticky } from '../../domain/sticky';
import { StickyType } from '../../domain/sticky-type';
import { exportJson } from './json-exporter';

const FIXED_DATE = new Date('2026-05-07T10:00:00Z');

describe('exportJson', () => {
  it('should generate a kebab-case filename with YYYYMMDD date', () => {
    const { filename } = exportJson(createWorkshop('Mon Atelier'), FIXED_DATE);
    expect(filename).toBe('mon-atelier-20260507.json');
  });

  it('should produce valid JSON', () => {
    const { content } = exportJson(createWorkshop('test'), FIXED_DATE);
    expect(() => JSON.parse(content)).not.toThrow();
  });

  it('should include schemaVersion', () => {
    const { content } = exportJson(createWorkshop('test'), FIXED_DATE);
    const parsed = JSON.parse(content) as { schemaVersion: number };
    expect(parsed.schemaVersion).toBe(1);
  });

  it('should include levelUnlockState', () => {
    const { content } = exportJson(createWorkshop('test'), FIXED_DATE);
    const parsed = JSON.parse(content) as {
      levelUnlockState: { processUnlocked: boolean; designUnlocked: boolean };
    };
    expect(parsed.levelUnlockState.processUnlocked).toBe(false);
    expect(parsed.levelUnlockState.designUnlocked).toBe(false);
  });

  it('should serialize all stickies', () => {
    let w = createWorkshop('test');
    w = addSticky(w, createSticky(StickyType.DomainEvent, 100, 50, { label: 'Ev', rotation: 0 }));
    w = addSticky(w, createSticky(StickyType.Command, 200, 50, { label: 'Cmd', rotation: 0 }));
    const { content } = exportJson(w, FIXED_DATE);
    const parsed = JSON.parse(content) as { stickies: unknown[] };
    expect(parsed.stickies).toHaveLength(2);
  });

  it('should include workshop name', () => {
    const { content } = exportJson(createWorkshop('Mon Atelier'), FIXED_DATE);
    const parsed = JSON.parse(content) as { name: string };
    expect(parsed.name).toBe('Mon Atelier');
  });

  it('should produce pretty-printed JSON', () => {
    const { content } = exportJson(createWorkshop('test'), FIXED_DATE);
    expect(content).toContain('\n');
  });
});
