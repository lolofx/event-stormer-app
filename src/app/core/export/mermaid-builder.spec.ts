import { describe, expect, it } from 'vitest';
import { addSticky, createWorkshop } from '../../domain/workshop';
import { createSticky } from '../../domain/sticky';
import { StickyType } from '../../domain/sticky-type';
import { buildMermaid, sanitizeMermaidLabel } from './mermaid-builder';

describe('sanitizeMermaidLabel', () => {
  it('should replace double quotes with single quotes', () => {
    expect(sanitizeMermaidLabel('say "hello"')).toBe("say 'hello'");
  });

  it('should replace newlines with a space', () => {
    expect(sanitizeMermaidLabel('line1\nline2')).toBe('line1 line2');
  });

  it('should trim surrounding whitespace', () => {
    expect(sanitizeMermaidLabel('  hello  ')).toBe('hello');
  });

  it('should return placeholder for empty string', () => {
    expect(sanitizeMermaidLabel('')).toBe('(sans libellé)');
  });

  it('should return placeholder for whitespace-only string', () => {
    expect(sanitizeMermaidLabel('   ')).toBe('(sans libellé)');
  });
});

describe('buildMermaid', () => {
  it('should start with flowchart LR', () => {
    expect(buildMermaid(createWorkshop('test'))).toMatch(/^flowchart LR/);
  });

  it('should always include all classDef declarations', () => {
    const result = buildMermaid(createWorkshop('test'));
    expect(result).toContain('classDef event fill:#FF9900,stroke:#B36B00,color:#000');
    expect(result).toContain('classDef command fill:#4A90E2,stroke:#2E5C8A,color:#fff');
    expect(result).toContain('classDef actor fill:#FFEB3B,stroke:#B8A82A,color:#000');
    expect(result).toContain('classDef policy fill:#9C27B0,stroke:#6A1B9A,color:#fff');
    expect(result).toContain('classDef external fill:#EC407A,stroke:#AD1457,color:#fff');
    expect(result).toContain('classDef aggregate fill:#FFF59D,stroke:#BFA726,color:#000');
    expect(result).toContain('classDef readmodel fill:#66BB6A,stroke:#2E7D32,color:#fff');
    expect(result).toContain('classDef boundedcontext fill:none,stroke:#424242,stroke-dasharray:5 5');
  });

  it('should produce no subgraphs for an empty workshop', () => {
    expect(buildMermaid(createWorkshop('test'))).not.toContain('subgraph');
  });

  it('should produce Timeline subgraph for a single DomainEvent', () => {
    const w = addSticky(
      createWorkshop('test'),
      createSticky(StickyType.DomainEvent, 100, 50, { label: 'Commande passée', rotation: 0 }),
    );
    const result = buildMermaid(w);
    expect(result).toContain('subgraph Timeline');
    expect(result).toContain('["Commande passée"]:::event');
  });

  it('should sort DomainEvents by X ascending', () => {
    let w = createWorkshop('test');
    w = addSticky(w, createSticky(StickyType.DomainEvent, 200, 50, { label: 'Second', rotation: 0 }));
    w = addSticky(w, createSticky(StickyType.DomainEvent, 100, 50, { label: 'First', rotation: 0 }));
    const result = buildMermaid(w);
    expect(result.indexOf('["First"]')).toBeLessThan(result.indexOf('["Second"]'));
  });

  it('should use Y as tiebreaker when X values are equal', () => {
    let w = createWorkshop('test');
    w = addSticky(w, createSticky(StickyType.DomainEvent, 100, 200, { label: 'Lower', rotation: 0 }));
    w = addSticky(w, createSticky(StickyType.DomainEvent, 100, 100, { label: 'Upper', rotation: 0 }));
    const result = buildMermaid(w);
    expect(result.indexOf('["Upper"]')).toBeLessThan(result.indexOf('["Lower"]'));
  });

  it('should connect DomainEvents with arrows in sorted order', () => {
    let w = createWorkshop('test');
    w = addSticky(w, createSticky(StickyType.DomainEvent, 100, 50, { label: 'First', rotation: 0 }));
    w = addSticky(w, createSticky(StickyType.DomainEvent, 200, 50, { label: 'Second', rotation: 0 }));
    const result = buildMermaid(w);
    expect(result).toContain('-->');
    const firstIdx = result.indexOf('["First"]');
    const arrowIdx = result.indexOf('-->');
    const secondIdx = result.indexOf('["Second"]');
    expect(firstIdx).toBeLessThan(arrowIdx);
    expect(arrowIdx).toBeLessThan(secondIdx);
  });

  it('should produce a Commands subgraph without arrows', () => {
    let w = createWorkshop('test');
    w = addSticky(w, createSticky(StickyType.Command, 100, 50, { label: 'Passer la commande', rotation: 0 }));
    const result = buildMermaid(w);
    expect(result).toContain('subgraph Commands');
    expect(result).toContain('["Passer la commande"]:::command');
    expect(result).not.toContain('-->');
  });

  it('should omit subgraphs for types not present', () => {
    const w = addSticky(
      createWorkshop('test'),
      createSticky(StickyType.DomainEvent, 100, 50, { label: 'Ev', rotation: 0 }),
    );
    const result = buildMermaid(w);
    expect(result).not.toContain('subgraph Commands');
    expect(result).not.toContain('subgraph Actors');
  });

  it('should use placeholder label for an empty-label sticky', () => {
    const w = addSticky(
      createWorkshop('test'),
      createSticky(StickyType.DomainEvent, 100, 50, { label: '', rotation: 0 }),
    );
    expect(buildMermaid(w)).toContain('["(sans libellé)"]:::event');
  });

  it('should sanitize double quotes in sticky labels', () => {
    const w = addSticky(
      createWorkshop('test'),
      createSticky(StickyType.DomainEvent, 100, 50, { label: 'say "hello"', rotation: 0 }),
    );
    expect(buildMermaid(w)).toContain(`["say 'hello'"]:::event`);
  });

  it('should create a BC subgraph containing geometrically contained stickies', () => {
    let w = createWorkshop('test');
    // BC covers (0,0)→(400,280); event center at (100, 80) — inside
    const bc = createSticky(StickyType.BoundedContext, 0, 0, { label: 'Livraison', width: 400, height: 280, rotation: 0 });
    const ev = createSticky(StickyType.DomainEvent, 20, 20, { label: 'Livré', width: 160, height: 120, rotation: 0 });
    w = addSticky(w, bc);
    w = addSticky(w, ev);
    const result = buildMermaid(w);
    expect(result).toContain('"Livraison"');
    expect(result).toContain('["Livré"]:::event');
    // Event is inside BC so no standalone Timeline subgraph
    expect(result).not.toContain('subgraph Timeline');
  });

  it('should put stickies outside all BCs in standard type subgraphs', () => {
    let w = createWorkshop('test');
    const bc = createSticky(StickyType.BoundedContext, 0, 0, { label: 'BC', width: 100, height: 100, rotation: 0 });
    // Event far outside BC
    const ev = createSticky(StickyType.DomainEvent, 500, 500, { label: 'Outside', width: 160, height: 120, rotation: 0 });
    w = addSticky(w, bc);
    w = addSticky(w, ev);
    const result = buildMermaid(w);
    expect(result).toContain('subgraph Timeline');
    expect(result).toContain('["Outside"]:::event');
  });

  it('should render all non-event types in their respective subgraphs', () => {
    let w = createWorkshop('test');
    const types: [StickyType, string, string][] = [
      [StickyType.Actor, 'Alice', 'Actors'],
      [StickyType.Policy, 'Auto-confirm', 'Policies'],
      [StickyType.ExternalSystem, 'Stripe', 'ExternalSystems'],
      [StickyType.Aggregate, 'Order', 'Aggregates'],
      [StickyType.ReadModel, 'Dashboard', 'ReadModels'],
    ];
    for (const [type, label] of types) {
      w = addSticky(w, createSticky(type, 100, 50, { label, rotation: 0 }));
    }
    const result = buildMermaid(w);
    for (const [, label, subgraph] of types) {
      expect(result).toContain(`subgraph ${subgraph}`);
      expect(result).toContain(`["${label}"]`);
    }
  });
});
