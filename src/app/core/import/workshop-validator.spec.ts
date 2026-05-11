import { describe, expect, it } from 'vitest';
import { parseWorkshopJson } from './workshop-validator';
import { exportJson } from '../export/json-exporter';
import { addSticky, createWorkshop } from '../../domain/workshop';
import { createSticky } from '../../domain/sticky';
import { StickyType } from '../../domain/sticky-type';

const base = createWorkshop('Test');
const { content: baseJson } = exportJson(base);

function parsed(): Record<string, unknown> {
  return JSON.parse(baseJson) as Record<string, unknown>;
}

describe('parseWorkshopJson', () => {
  it('should accept a valid exported workshop', () => {
    const result = parseWorkshopJson(parsed());
    expect('workshop' in result).toBe(true);
  });

  it('should restore workshop name and id', () => {
    const result = parseWorkshopJson(parsed());
    if (!('workshop' in result)) throw new Error('expected workshop');
    expect(result.workshop.name).toBe('Test');
    expect(typeof result.workshop.id).toBe('string');
  });

  it('should restore stickies', () => {
    let w = createWorkshop('Test');
    w = addSticky(w, createSticky(StickyType.DomainEvent, 100, 50, { label: 'Cmd', rotation: 0 }));
    const { content } = exportJson(w);
    const result = parseWorkshopJson(JSON.parse(content));
    if (!('workshop' in result)) throw new Error('expected workshop');
    expect(result.workshop.stickies).toHaveLength(1);
    expect(result.workshop.stickies[0]?.type).toBe(StickyType.DomainEvent);
  });

  it('should convert createdAt / updatedAt strings to Date', () => {
    const result = parseWorkshopJson(parsed());
    if (!('workshop' in result)) throw new Error('expected workshop');
    expect(result.workshop.createdAt).toBeInstanceOf(Date);
    expect(result.workshop.updatedAt).toBeInstanceOf(Date);
  });

  it('should reject null', () => {
    expect('error' in parseWorkshopJson(null)).toBe(true);
  });

  it('should reject unknown schemaVersion', () => {
    const data = { ...parsed(), schemaVersion: 99 };
    expect('error' in parseWorkshopJson(data)).toBe(true);
  });

  it('should reject missing id', () => {
    const data = { ...parsed(), id: '' };
    expect('error' in parseWorkshopJson(data)).toBe(true);
  });

  it('should reject invalid activeLevel', () => {
    const data = { ...parsed(), activeLevel: 'QuantumLevel' };
    expect('error' in parseWorkshopJson(data)).toBe(true);
  });

  it('should reject missing levelUnlockState', () => {
    const data = { ...parsed(), levelUnlockState: null };
    expect('error' in parseWorkshopJson(data)).toBe(true);
  });

  it('should reject invalid viewport', () => {
    const data = { ...parsed(), viewport: { zoom: 'fast', panX: 0, panY: 0 } };
    expect('error' in parseWorkshopJson(data)).toBe(true);
  });

  it('should reject invalid sticky type', () => {
    let w = createWorkshop('Test');
    w = addSticky(w, createSticky(StickyType.Command, 0, 0, { rotation: 0 }));
    const { content } = exportJson(w);
    const data = JSON.parse(content) as { stickies: { type: string }[] };
    const first = data.stickies[0];
    if (!first) throw new Error('expected at least one sticky');
    first.type = 'InvalidType';
    expect('error' in parseWorkshopJson(data)).toBe(true);
  });

  it('should reject non-array stickies', () => {
    const data = { ...parsed(), stickies: 'nope' };
    expect('error' in parseWorkshopJson(data)).toBe(true);
  });
});
