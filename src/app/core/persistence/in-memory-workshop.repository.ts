import { Workshop } from '../../domain/workshop';
import { WorkshopRepository } from './workshop-repository';

export class InMemoryWorkshopRepository implements WorkshopRepository {
  private stored: Workshop | null = null;

  async save(workshop: Workshop): Promise<void> {
    this.stored = workshop;
  }

  async load(): Promise<Workshop | null> {
    return this.stored;
  }

  async clear(): Promise<void> {
    this.stored = null;
  }
}
