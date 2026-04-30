import { Workshop } from '../../domain/workshop';

export interface WorkshopRepository {
  save(workshop: Workshop): Promise<void>;
  load(): Promise<Workshop | null>;
  clear(): Promise<void>;
}
