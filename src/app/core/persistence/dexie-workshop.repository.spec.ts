import { describe, it, expect, beforeEach } from 'vitest';
import { IDBFactory, IDBKeyRange } from 'fake-indexeddb';
import { DexieWorkshopRepository } from './dexie-workshop.repository';
import { createWorkshop } from '../../domain/workshop';

// Each test gets a fresh IDBFactory to avoid state leakage between tests
function makeRepo(): DexieWorkshopRepository {
  return new DexieWorkshopRepository(new IDBFactory(), IDBKeyRange);
}

describe('DexieWorkshopRepository', () => {
  let repo: DexieWorkshopRepository;

  beforeEach(() => {
    repo = makeRepo();
  });

  it('should return null when no workshop has been saved', async () => {
    expect(await repo.load()).toBeNull();
  });

  it('should persist and return the saved workshop', async () => {
    const workshop = createWorkshop('Mon atelier');
    await repo.save(workshop);
    const loaded = await repo.load();
    expect(loaded?.name).toBe('Mon atelier');
    expect(loaded?.id).toBe(workshop.id);
  });

  it('should overwrite the existing workshop on subsequent saves', async () => {
    const first = createWorkshop('Premier');
    const second = createWorkshop('Second');
    await repo.save(first);
    await repo.save(second);
    const loaded = await repo.load();
    expect(loaded?.name).toBe('Second');
  });

  it('should return null after clear', async () => {
    await repo.save(createWorkshop('ATester'));
    await repo.clear();
    expect(await repo.load()).toBeNull();
  });

  it('should persist Date fields as serialised values', async () => {
    const workshop = createWorkshop('Dates');
    await repo.save(workshop);
    const loaded = await repo.load();
    expect(loaded?.createdAt).toBeDefined();
  });
});
