import { Workshop } from '../../domain/workshop';
import { toKebabCase } from './markdown-exporter';

function formatDate(date: Date): string {
  const y = date.getUTCFullYear();
  const m = String(date.getUTCMonth() + 1).padStart(2, '0');
  const d = String(date.getUTCDate()).padStart(2, '0');
  return `${y}${m}${d}`;
}

export function exportJson(
  workshop: Workshop,
  now = new Date(),
): { filename: string; content: string } {
  const dateStr = formatDate(now);
  const filename = `${toKebabCase(workshop.name)}-${dateStr}.json`;
  const content = JSON.stringify(workshop, null, 2);
  return { filename, content };
}
