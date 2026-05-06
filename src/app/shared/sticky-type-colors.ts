import { StickyType } from '../domain/sticky-type';

export interface StickyColors {
  readonly bg: string;
  readonly border: string;
  readonly text: string;
}

export const STICKY_COLORS: Record<StickyType, StickyColors> = {
  [StickyType.DomainEvent]: { bg: '#ff9900', border: '#b36b00', text: '#000' },
  [StickyType.Command]: { bg: '#4a90e2', border: '#2e5c8a', text: '#fff' },
  [StickyType.Actor]: { bg: '#ffeb3b', border: '#b8a82a', text: '#000' },
  [StickyType.Policy]: { bg: '#9c27b0', border: '#6a1b9a', text: '#fff' },
  [StickyType.ExternalSystem]: { bg: '#ec407a', border: '#ad1457', text: '#fff' },
  [StickyType.Aggregate]: { bg: '#fff59d', border: '#bfa726', text: '#000' },
  [StickyType.ReadModel]: { bg: '#66bb6a', border: '#2e7d32', text: '#fff' },
  [StickyType.BoundedContext]: { bg: 'transparent', border: '#424242', text: '#1a1a1a' },
};
