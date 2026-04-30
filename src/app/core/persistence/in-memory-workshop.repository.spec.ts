import { describe, it, expect, beforeEach } from 'vitest';
import { InMemoryWorkshopRepository } from './in-memory-workshop.repository';
import { createWorkshop } from '../../domain/workshop';

describe('InMemoryWorkshopRepository', () => {
  let repo: InMemoryWorkshopRepository;

  beforeEach(() => {
    repo = new InMemoryWorkshopRepository();
  });

  it('should return null when no workshop has been saved', async () => {
    expect(await repo.load()).toBeNull();
  });

  it('should return the saved workshop when load is called', async () => {
    const workshop = createWorkshop('Test');
    await repo.save(workshop);
    expect(await repo.load()).toEqual(workshop);
  });

  it('should overwrite the previous workshop on save', async () => {
    const first = createWorkshop('First');
    const second = createWorkshop('Second');
    await repo.save(first);
    await repo.save(second);
    expect((await repo.load())?.name).toBe('Second');
  });

  it('should return null after clear', async () => {
    await repo.save(createWorkshop('ToDelete'));
    await repo.clear();
    expect(await repo.load()).toBeNull();
  });
});
