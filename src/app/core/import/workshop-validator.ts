import { Level } from '../../domain/level';
import { Sticky } from '../../domain/sticky';
import { StickyType } from '../../domain/sticky-type';
import { Workshop, WORKSHOP_SCHEMA_VERSION } from '../../domain/workshop';

export type ValidationResult = { workshop: Workshop } | { error: string };

export function parseWorkshopJson(raw: unknown): ValidationResult {
  if (typeof raw !== 'object' || raw === null) return { error: 'Format invalide' };
  const obj = raw as Record<string, unknown>;

  if (obj['schemaVersion'] !== WORKSHOP_SCHEMA_VERSION) {
    return { error: `Version de schéma non supportée : ${String(obj['schemaVersion'])}` };
  }
  if (typeof obj['id'] !== 'string' || !obj['id']) return { error: 'Champ id manquant' };
  if (typeof obj['name'] !== 'string') return { error: 'Champ name invalide' };
  if (!(Object.values(Level) as string[]).includes(obj['activeLevel'] as string)) {
    return { error: `Niveau invalide : ${String(obj['activeLevel'])}` };
  }

  const lusResult = parseLevelUnlockState(obj['levelUnlockState']);
  if ('error' in lusResult) return lusResult;

  const vpResult = parseViewport(obj['viewport']);
  if ('error' in vpResult) return vpResult;

  if (!Array.isArray(obj['stickies'])) return { error: 'stickies doit être un tableau' };
  const stickies: Sticky[] = [];
  for (const s of obj['stickies'] as unknown[]) {
    const sr = parseSticky(s);
    if ('error' in sr) return sr;
    stickies.push(sr.sticky);
  }

  const createdAt = new Date(obj['createdAt'] as string);
  const updatedAt = new Date(obj['updatedAt'] as string);
  if (isNaN(createdAt.getTime())) return { error: 'createdAt invalide' };
  if (isNaN(updatedAt.getTime())) return { error: 'updatedAt invalide' };

  return {
    workshop: {
      id: obj['id'],
      name: obj['name'],
      schemaVersion: WORKSHOP_SCHEMA_VERSION,
      activeLevel: obj['activeLevel'] as Level,
      levelUnlockState: lusResult.value,
      viewport: vpResult.value,
      stickies,
      createdAt,
      updatedAt,
    },
  };
}

function parseLevelUnlockState(
  raw: unknown,
): { value: { processUnlocked: boolean; designUnlocked: boolean } } | { error: string } {
  if (typeof raw !== 'object' || raw === null) return { error: 'levelUnlockState manquant' };
  const obj = raw as Record<string, unknown>;
  if (typeof obj['processUnlocked'] !== 'boolean') return { error: 'levelUnlockState.processUnlocked invalide' };
  if (typeof obj['designUnlocked'] !== 'boolean') return { error: 'levelUnlockState.designUnlocked invalide' };
  return { value: { processUnlocked: obj['processUnlocked'], designUnlocked: obj['designUnlocked'] } };
}

function parseViewport(
  raw: unknown,
): { value: { zoom: number; panX: number; panY: number } } | { error: string } {
  if (typeof raw !== 'object' || raw === null) return { error: 'viewport manquant' };
  const obj = raw as Record<string, unknown>;
  if (typeof obj['zoom'] !== 'number') return { error: 'viewport.zoom invalide' };
  if (typeof obj['panX'] !== 'number') return { error: 'viewport.panX invalide' };
  if (typeof obj['panY'] !== 'number') return { error: 'viewport.panY invalide' };
  return { value: { zoom: obj['zoom'], panX: obj['panX'], panY: obj['panY'] } };
}

function parseSticky(raw: unknown): { sticky: Sticky } | { error: string } {
  if (typeof raw !== 'object' || raw === null) return { error: 'Sticky invalide' };
  const s = raw as Record<string, unknown>;
  if (typeof s['id'] !== 'string' || !s['id']) return { error: 'Sticky.id manquant' };
  if (!(Object.values(StickyType) as string[]).includes(s['type'] as string)) {
    return { error: `Type de sticky invalide : ${String(s['type'])}` };
  }
  if (typeof s['label'] !== 'string') return { error: 'Sticky.label invalide' };
  if (typeof s['x'] !== 'number') return { error: 'Sticky.x invalide' };
  if (typeof s['y'] !== 'number') return { error: 'Sticky.y invalide' };
  if (typeof s['width'] !== 'number') return { error: 'Sticky.width invalide' };
  if (typeof s['height'] !== 'number') return { error: 'Sticky.height invalide' };
  if (typeof s['rotation'] !== 'number') return { error: 'Sticky.rotation invalide' };
  return {
    sticky: {
      id: s['id'],
      type: s['type'] as StickyType,
      label: s['label'],
      x: s['x'],
      y: s['y'],
      width: s['width'],
      height: s['height'],
      rotation: s['rotation'],
    },
  };
}
