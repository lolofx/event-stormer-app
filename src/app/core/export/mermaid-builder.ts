import { Sticky } from '../../domain/sticky';
import { StickyType } from '../../domain/sticky-type';
import { Workshop } from '../../domain/workshop';

const CLASS_DEFS = `    classDef event fill:#FF9900,stroke:#B36B00,color:#000
    classDef command fill:#4A90E2,stroke:#2E5C8A,color:#fff
    classDef actor fill:#FFEB3B,stroke:#B8A82A,color:#000
    classDef policy fill:#9C27B0,stroke:#6A1B9A,color:#fff
    classDef external fill:#EC407A,stroke:#AD1457,color:#fff
    classDef aggregate fill:#FFF59D,stroke:#BFA726,color:#000
    classDef readmodel fill:#66BB6A,stroke:#2E7D32,color:#fff
    classDef boundedcontext fill:none,stroke:#424242,stroke-dasharray:5 5`;

const TYPE_CSS_CLASS: Record<StickyType, string> = {
  [StickyType.DomainEvent]: 'event',
  [StickyType.Command]: 'command',
  [StickyType.Actor]: 'actor',
  [StickyType.Policy]: 'policy',
  [StickyType.ExternalSystem]: 'external',
  [StickyType.Aggregate]: 'aggregate',
  [StickyType.ReadModel]: 'readmodel',
  [StickyType.BoundedContext]: 'boundedcontext',
};

const TYPE_SUBGRAPH_NAME: Partial<Record<StickyType, string>> = {
  [StickyType.Command]: 'Commands',
  [StickyType.Actor]: 'Actors',
  [StickyType.Policy]: 'Policies',
  [StickyType.ExternalSystem]: 'ExternalSystems',
  [StickyType.Aggregate]: 'Aggregates',
  [StickyType.ReadModel]: 'ReadModels',
};

export function sanitizeMermaidLabel(label: string): string {
  const cleaned = label.replace(/\r?\n/g, ' ').replace(/"/g, "'").trim();
  return cleaned || '(sans libellé)';
}

/**
 * Returns true when sticky's center point falls inside bc's bounding rectangle.
 * O(1) per pair — O(n²) total across all stickies, acceptable for ≤150 stickies.
 */
function isContainedIn(sticky: Sticky, bc: Sticky): boolean {
  const cx = sticky.x + sticky.width / 2;
  const cy = sticky.y + sticky.height / 2;
  return cx >= bc.x && cx <= bc.x + bc.width && cy >= bc.y && cy <= bc.y + bc.height;
}

/** Stable sort: X ascending → Y ascending → id lexicographic (RM07). */
function sortEvents(events: readonly Sticky[]): Sticky[] {
  return [...events].sort((a, b) => a.x - b.x || a.y - b.y || a.id.localeCompare(b.id));
}

function renderNode(id: string, sticky: Sticky): string {
  const label = sanitizeMermaidLabel(sticky.label);
  return `${id}["${label}"]:::${TYPE_CSS_CLASS[sticky.type]}`;
}

function buildSubgraph(title: string, lines: string[]): string {
  const inner = lines.map(l => `        ${l}`).join('\n');
  return `    subgraph ${title}\n${inner}\n    end`;
}

function buildEventLine(events: Sticky[], idOf: (s: Sticky) => string): string {
  return sortEvents(events)
    .map(s => renderNode(idOf(s), s))
    .join(' --> ');
}

export function buildMermaid(workshop: Workshop): string {
  const bcs = workshop.stickies.filter(s => s.type === StickyType.BoundedContext);
  const nonBcs = workshop.stickies.filter(s => s.type !== StickyType.BoundedContext);

  // Map each non-BC sticky to its containing BC (first match wins).
  const stickyBcMap = new Map<string, Sticky>();
  for (const s of nonBcs) {
    for (const bc of bcs) {
      if (isContainedIn(s, bc)) {
        stickyBcMap.set(s.id, bc);
        break;
      }
    }
  }

  const subgraphs: string[] = [];

  // BC subgraphs — each BC groups the stickies geometrically inside it.
  bcs.forEach((bc, bcIdx) => {
    const contained = nonBcs.filter(s => stickyBcMap.get(s.id)?.id === bc.id);
    if (contained.length === 0) return;

    const idOf = (s: Sticky): string => `bc${bcIdx}_${TYPE_CSS_CLASS[s.type]}${contained.indexOf(s)}`;

    const events = contained.filter(s => s.type === StickyType.DomainEvent);
    const others = contained.filter(s => s.type !== StickyType.DomainEvent);

    const lines: string[] = [];
    if (events.length > 0) {
      lines.push(buildEventLine(events, idOf));
    }
    for (const s of others) {
      lines.push(renderNode(idOf(s), s));
    }

    const bcLabel = sanitizeMermaidLabel(bc.label);
    subgraphs.push(buildSubgraph(`bc${bcIdx}["${bcLabel}"]`, lines));
  });

  // Stickies not inside any BC.
  const orphans = nonBcs.filter(s => !stickyBcMap.has(s.id));

  // Assign stable IDs: sorted events get ev0, ev1…; other types by appearance order.
  const idMap = new Map<string, string>();
  const sortedOrphanEvents = sortEvents(orphans.filter(s => s.type === StickyType.DomainEvent));
  sortedOrphanEvents.forEach((s, i) => idMap.set(s.id, `ev${i}`));

  const counters: Partial<Record<StickyType, number>> = {};
  const prefixes: Partial<Record<StickyType, string>> = {
    [StickyType.Command]: 'cmd',
    [StickyType.Actor]: 'act',
    [StickyType.Policy]: 'pol',
    [StickyType.ExternalSystem]: 'ext',
    [StickyType.Aggregate]: 'agg',
    [StickyType.ReadModel]: 'rm',
  };
  for (const s of orphans.filter(t => t.type !== StickyType.DomainEvent)) {
    const prefix = prefixes[s.type];
    if (!prefix) continue;
    const idx = counters[s.type] ?? 0;
    idMap.set(s.id, `${prefix}${idx}`);
    counters[s.type] = idx + 1;
  }

  // Timeline subgraph for orphan DomainEvents.
  if (sortedOrphanEvents.length > 0) {
    const line = buildEventLine(sortedOrphanEvents, s => idMap.get(s.id) ?? `ev_${s.id}`);
    subgraphs.push(buildSubgraph('Timeline', [line]));
  }

  // Type subgraphs for remaining orphan non-event stickies.
  const typeOrder = [
    StickyType.Command,
    StickyType.Actor,
    StickyType.Policy,
    StickyType.ExternalSystem,
    StickyType.Aggregate,
    StickyType.ReadModel,
  ] as const;

  for (const type of typeOrder) {
    const group = orphans.filter(s => s.type === type);
    if (group.length === 0) continue;
    const name = TYPE_SUBGRAPH_NAME[type] ?? type;
    const lines = group.map(s => renderNode(idMap.get(s.id) ?? `n_${s.id}`, s));
    subgraphs.push(buildSubgraph(name, lines));
  }

  const parts: string[] = [`flowchart LR\n${CLASS_DEFS}`];
  parts.push(...subgraphs);
  return parts.join('\n\n');
}
