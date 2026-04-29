import { Level } from './level';

describe('Level', () => {
  it('should have 3 distinct values', () => {
    const values = Object.values(Level);
    expect(values).toHaveLength(3);
    expect(new Set(values).size).toBe(3);
  });

  it('should include the 3 Event Storming levels', () => {
    expect(Level.BigPicture).toBeDefined();
    expect(Level.ProcessLevel).toBeDefined();
    expect(Level.DesignLevel).toBeDefined();
  });
});
