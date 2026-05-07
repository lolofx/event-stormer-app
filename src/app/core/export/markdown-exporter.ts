import { Sticky } from '../../domain/sticky';
import { StickyType } from '../../domain/sticky-type';
import { Level } from '../../domain/level';
import { Workshop } from '../../domain/workshop';
import { buildMermaid } from './mermaid-builder';

const APP_VERSION = '0.0.0';

export function toKebabCase(name: string): string {
  return name
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

function formatDate(date: Date): string {
  const y = date.getUTCFullYear();
  const m = String(date.getUTCMonth() + 1).padStart(2, '0');
  const d = String(date.getUTCDate()).padStart(2, '0');
  return `${y}${m}${d}`;
}

function levelLabel(level: Level): string {
  const labels: Record<Level, string> = {
    [Level.BigPicture]: 'Big Picture',
    [Level.ProcessLevel]: 'Process Level',
    [Level.DesignLevel]: 'Design Level',
  };
  return labels[level];
}

function unlockedLevels(workshop: Workshop): string {
  const levels = ['Big Picture'];
  if (workshop.levelUnlockState.processUnlocked) levels.push('Process Level');
  if (workshop.levelUnlockState.designUnlocked) levels.push('Design Level');
  return levels.join(', ');
}

function sortEvents(stickies: readonly Sticky[]): Sticky[] {
  return [...stickies]
    .filter(s => s.type === StickyType.DomainEvent)
    .sort((a, b) => a.x - b.x || a.y - b.y || a.id.localeCompare(b.id));
}

function stickySection(title: string, stickies: readonly Sticky[], showPosition = false): string {
  const items = [...stickies]
    .sort((a, b) => a.label.localeCompare(b.label))
    .map(s => {
      const base = `- **${s.label || '(sans libellé)'}**`;
      return showPosition ? `${base} — position (${s.x}, ${s.y})` : base;
    });
  return `## ${title}\n${items.join('\n')}`;
}

function chronologySection(events: Sticky[]): string {
  const items = events.map(
    (s, i) => `${i + 1}. **${s.label || '(sans libellé)'}** — position (${s.x}, ${s.y})`,
  );
  return `## Chronologie des domain events\n${items.join('\n')}`;
}

export function exportMarkdown(
  workshop: Workshop,
  now = new Date(),
): { filename: string; content: string } {
  const dateStr = formatDate(now);
  const filename = `${toKebabCase(workshop.name)}-${dateStr}.md`;

  const stickies = workshop.stickies;
  const total = stickies.length;
  const isoDate = now.toISOString().slice(0, 10);

  const sections: string[] = [];

  sections.push(
    `# Workshop : ${workshop.name} — Export Event Storming`,
    `\n> Niveau : ${levelLabel(workshop.activeLevel)} | Exporté le ${isoDate} | ${total} stickies`,
    `\n## Vue d'ensemble\n\n\`\`\`mermaid\n${buildMermaid(workshop)}\n\`\`\``,
  );

  const events = sortEvents(stickies);
  if (events.length > 0) {
    sections.push(`\n${chronologySection(events)}`);
  }

  const typeSections: [StickyType, string][] = [
    [StickyType.Command, 'Commands'],
    [StickyType.Actor, 'Actors'],
    [StickyType.Policy, 'Policies'],
    [StickyType.ExternalSystem, 'External Systems'],
    [StickyType.Aggregate, 'Aggregates'],
    [StickyType.ReadModel, 'Read Models'],
    [StickyType.BoundedContext, 'Bounded Contexts'],
  ];

  for (const [type, title] of typeSections) {
    const group = stickies.filter(s => s.type === type);
    if (group.length > 0) {
      sections.push(`\n${stickySection(title, group)}`);
    }
  }

  sections.push(
    `\n## Métadonnées\n- Nom : ${workshop.name}\n- Niveau actif : ${levelLabel(workshop.activeLevel)}\n- Niveaux débloqués : ${unlockedLevels(workshop)}\n- Nombre de stickies : ${total}\n- Export généré par EventStormer v${APP_VERSION}`,
  );

  return { filename, content: sections.join('\n') };
}
