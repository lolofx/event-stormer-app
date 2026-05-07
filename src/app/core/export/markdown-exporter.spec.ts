import { describe, expect, it } from 'vitest';
import { addSticky, createWorkshop, unlockProcessLevel } from '../../domain/workshop';
import { createSticky } from '../../domain/sticky';
import { StickyType } from '../../domain/sticky-type';
import { exportMarkdown } from './markdown-exporter';

const FIXED_DATE = new Date('2026-05-07T10:00:00Z');

describe('exportMarkdown', () => {
  describe('filename', () => {
    it('should generate a kebab-case filename with YYYYMMDD date', () => {
      const { filename } = exportMarkdown(createWorkshop('Mon Atelier'), FIXED_DATE);
      expect(filename).toBe('mon-atelier-20260507.md');
    });

    it('should strip accents from workshop name', () => {
      const { filename } = exportMarkdown(createWorkshop('Atelier Événement'), FIXED_DATE);
      expect(filename).toBe('atelier-evenement-20260507.md');
    });

    it('should collapse multiple spaces and special chars to single hyphens', () => {
      const { filename } = exportMarkdown(createWorkshop('My  Workshop!'), FIXED_DATE);
      expect(filename).toBe('my-workshop-20260507.md');
    });
  });

  describe('content header', () => {
    it('should include the workshop name in the H1', () => {
      const { content } = exportMarkdown(createWorkshop('Mon Atelier'), FIXED_DATE);
      expect(content).toContain('# Workshop : Mon Atelier — Export Event Storming');
    });

    it('should include sticky count in the summary line', () => {
      let w = createWorkshop('test');
      w = addSticky(w, createSticky(StickyType.DomainEvent, 100, 50, { label: 'Ev', rotation: 0 }));
      const { content } = exportMarkdown(w, FIXED_DATE);
      expect(content).toContain('1 stickies');
    });

    it('should include the active level name', () => {
      const { content } = exportMarkdown(createWorkshop('test'), FIXED_DATE);
      expect(content).toContain('Niveau : Big Picture');
    });
  });

  describe('Mermaid block', () => {
    it('should contain a fenced mermaid code block', () => {
      const { content } = exportMarkdown(createWorkshop('test'), FIXED_DATE);
      expect(content).toContain('```mermaid');
      expect(content).toContain('flowchart LR');
    });
  });

  describe('Chronologie section', () => {
    it('should include chronology section when DomainEvents are present', () => {
      const w = addSticky(
        createWorkshop('test'),
        createSticky(StickyType.DomainEvent, 100, 50, { label: 'Ev', rotation: 0 }),
      );
      const { content } = exportMarkdown(w, FIXED_DATE);
      expect(content).toContain('## Chronologie des domain events');
    });

    it('should sort DomainEvents by X in the chronology', () => {
      let w = createWorkshop('test');
      w = addSticky(w, createSticky(StickyType.DomainEvent, 200, 50, { label: 'Second', rotation: 0 }));
      w = addSticky(w, createSticky(StickyType.DomainEvent, 100, 50, { label: 'First', rotation: 0 }));
      const { content } = exportMarkdown(w, FIXED_DATE);
      expect(content.indexOf('**First**')).toBeLessThan(content.indexOf('**Second**'));
    });

    it('should include position for each DomainEvent', () => {
      const w = addSticky(
        createWorkshop('test'),
        createSticky(StickyType.DomainEvent, 100, 50, { label: 'Ev', rotation: 0 }),
      );
      const { content } = exportMarkdown(w, FIXED_DATE);
      expect(content).toContain('position (100, 50)');
    });

    it('should omit chronology section when no DomainEvents', () => {
      const w = addSticky(
        createWorkshop('test'),
        createSticky(StickyType.Command, 100, 50, { label: 'Cmd', rotation: 0 }),
      );
      const { content } = exportMarkdown(w, FIXED_DATE);
      expect(content).not.toContain('## Chronologie des domain events');
    });
  });

  describe('type sections', () => {
    it('should include Commands section only when commands are present', () => {
      const wWithout = addSticky(
        createWorkshop('test'),
        createSticky(StickyType.DomainEvent, 100, 50, { label: 'Ev', rotation: 0 }),
      );
      expect(exportMarkdown(wWithout, FIXED_DATE).content).not.toContain('## Commands');

      const wWith = addSticky(
        createWorkshop('test'),
        createSticky(StickyType.Command, 100, 50, { label: 'Cmd', rotation: 0 }),
      );
      const result = exportMarkdown(wWith, FIXED_DATE).content;
      expect(result).toContain('## Commands');
      expect(result).toContain('**Cmd**');
    });

    it('should include all relevant type sections', () => {
      let w = createWorkshop('test');
      w = addSticky(w, createSticky(StickyType.Actor, 100, 50, { label: 'Alice', rotation: 0 }));
      w = addSticky(w, createSticky(StickyType.Policy, 100, 50, { label: 'AutoPolicy', rotation: 0 }));
      w = addSticky(w, createSticky(StickyType.ExternalSystem, 100, 50, { label: 'Stripe', rotation: 0 }));
      w = addSticky(w, createSticky(StickyType.Aggregate, 100, 50, { label: 'Order', rotation: 0 }));
      w = addSticky(w, createSticky(StickyType.ReadModel, 100, 50, { label: 'Dashboard', rotation: 0 }));
      w = addSticky(w, createSticky(StickyType.BoundedContext, 100, 50, { label: 'Livraison', rotation: 0 }));
      const { content } = exportMarkdown(w, FIXED_DATE);
      expect(content).toContain('## Actors');
      expect(content).toContain('## Policies');
      expect(content).toContain('## External Systems');
      expect(content).toContain('## Aggregates');
      expect(content).toContain('## Read Models');
      expect(content).toContain('## Bounded Contexts');
    });
  });

  describe('Métadonnées section', () => {
    it('should include metadata section', () => {
      const { content } = exportMarkdown(createWorkshop('Mon Atelier'), FIXED_DATE);
      expect(content).toContain('## Métadonnées');
    });

    it('should include workshop name in metadata', () => {
      const { content } = exportMarkdown(createWorkshop('Mon Atelier'), FIXED_DATE);
      expect(content).toContain('Nom : Mon Atelier');
    });

    it('should list unlocked levels in metadata', () => {
      const w = unlockProcessLevel(createWorkshop('test'));
      const { content } = exportMarkdown(w, FIXED_DATE);
      expect(content).toContain('Big Picture, Process Level');
    });
  });
});
