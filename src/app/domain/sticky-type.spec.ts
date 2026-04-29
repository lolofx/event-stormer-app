import { StickyType } from './sticky-type';

describe('StickyType', () => {
  it('should have 8 distinct values (RM02)', () => {
    const values = Object.values(StickyType);
    expect(values).toHaveLength(8);
    expect(new Set(values).size).toBe(8);
  });

  it('should include all Event Storming building blocks (RM02)', () => {
    expect(StickyType.DomainEvent).toBeDefined();
    expect(StickyType.Command).toBeDefined();
    expect(StickyType.Actor).toBeDefined();
    expect(StickyType.Policy).toBeDefined();
    expect(StickyType.ExternalSystem).toBeDefined();
    expect(StickyType.Aggregate).toBeDefined();
    expect(StickyType.ReadModel).toBeDefined();
    expect(StickyType.BoundedContext).toBeDefined();
  });
});
