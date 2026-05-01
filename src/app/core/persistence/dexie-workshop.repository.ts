import Dexie, { Table } from 'dexie';
import { Workshop } from '../../domain/workshop';
import { WorkshopRepository } from './workshop-repository';

// Single-row table: we always upsert under the CURRENT_KEY constant.
// Using a fixed key means "load" and "clear" are O(1) without a full table scan.
const CURRENT_KEY = 'current';

interface WorkshopRecord extends Omit<Workshop, 'createdAt' | 'updatedAt'> {
  _key: string;
  createdAt: string; // ISO — IndexedDB can store Date but serialisation is safer across browsers
  updatedAt: string;
}

class EventStormerDb extends Dexie {
  workshops!: Table<WorkshopRecord, string>;

  constructor(indexedDB?: IDBFactory, IDBKeyRangeCtor?: typeof IDBKeyRange) {
    super('EventStormerDb', { indexedDB, IDBKeyRange: IDBKeyRangeCtor });
    this.version(1).stores({
      workshops: '_key',
    });
  }
}

export class DexieWorkshopRepository implements WorkshopRepository {
  private readonly db: EventStormerDb;

  constructor(indexedDB?: IDBFactory, IDBKeyRangeCtor?: typeof IDBKeyRange) {
    this.db = new EventStormerDb(indexedDB, IDBKeyRangeCtor);
  }

  async save(workshop: Workshop): Promise<void> {
    const record: WorkshopRecord = {
      ...workshop,
      _key: CURRENT_KEY,
      createdAt: workshop.createdAt.toISOString(),
      updatedAt: workshop.updatedAt.toISOString(),
    };
    await this.db.workshops.put(record);
  }

  async load(): Promise<Workshop | null> {
    const record = await this.db.workshops.get(CURRENT_KEY);
    if (!record) return null;
    return {
      id: record.id,
      name: record.name,
      activeLevel: record.activeLevel,
      levelUnlockState: record.levelUnlockState,
      viewport: record.viewport,
      stickies: record.stickies,
      schemaVersion: record.schemaVersion,
      createdAt: new Date(record.createdAt),
      updatedAt: new Date(record.updatedAt),
    };
  }

  async clear(): Promise<void> {
    await this.db.workshops.delete(CURRENT_KEY);
  }
}
