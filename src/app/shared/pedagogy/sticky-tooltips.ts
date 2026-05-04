import { StickyType } from '../../domain/sticky-type';
import { STICKY_COLORS } from '../ui/sticky-card/sticky-card.component';

export interface StickyTooltipData {
  readonly type: StickyType;
  readonly label: string;
  readonly color: string;
  readonly definition: string;
  readonly example: string;
  readonly tip: string;
}

export const STICKY_TOOLTIPS: Readonly<Record<StickyType, StickyTooltipData>> = {
  [StickyType.DomainEvent]: {
    type: StickyType.DomainEvent,
    label: 'Domain Event',
    color: STICKY_COLORS[StickyType.DomainEvent].bg,
    definition: "Un fait métier qui s'est produit, exprimé au passé.",
    example: "« Commande passée », « Paiement validé », « Utilisateur inscrit ».",
    tip: "Formulation au passé + sujet métier, jamais une action technique.",
  },
  [StickyType.Command]: {
    type: StickyType.Command,
    label: 'Command',
    color: STICKY_COLORS[StickyType.Command].bg,
    definition: "Une intention d'agir, une demande adressée au système.",
    example: "« Passer la commande », « Valider le paiement ».",
    tip: "Verbe à l'impératif. Déclenche généralement un Event.",
  },
  [StickyType.Actor]: {
    type: StickyType.Actor,
    label: 'Actor',
    color: STICKY_COLORS[StickyType.Actor].bg,
    definition: "Une personne ou un rôle qui déclenche des Commands.",
    example: "« Client », « Administrateur », « Livreur ».",
    tip: "Un rôle, pas une personne nommée.",
  },
  [StickyType.Policy]: {
    type: StickyType.Policy,
    label: 'Policy',
    color: STICKY_COLORS[StickyType.Policy].bg,
    definition: "Une règle automatique qui réagit à un Event pour déclencher une Command.",
    example: "« Quand commande passée, alors réserver le stock ».",
    tip: "C'est le liant entre deux parties du workflow.",
  },
  [StickyType.ExternalSystem]: {
    type: StickyType.ExternalSystem,
    label: 'External System',
    color: STICKY_COLORS[StickyType.ExternalSystem].bg,
    definition: "Un système extérieur au domaine modélisé.",
    example: "« Service de paiement », « API de livraison ».",
    tip: "Tout ce qui est hors du périmètre d'équipe.",
  },
  [StickyType.Aggregate]: {
    type: StickyType.Aggregate,
    label: 'Aggregate',
    color: STICKY_COLORS[StickyType.Aggregate].bg,
    definition: "Un ensemble cohérent d'objets métier qui garantit des invariants.",
    example: "« Commande » (avec lignes et statut).",
    tip: "Frontière de cohérence transactionnelle.",
  },
  [StickyType.ReadModel]: {
    type: StickyType.ReadModel,
    label: 'Read Model',
    color: STICKY_COLORS[StickyType.ReadModel].bg,
    definition: "Une vue dénormalisée construite pour un besoin de lecture.",
    example: "« Tableau de bord des commandes du jour ».",
    tip: "Pensé pour la consommation, pas l'écriture.",
  },
  [StickyType.BoundedContext]: {
    type: StickyType.BoundedContext,
    label: 'Bounded Context',
    color: STICKY_COLORS[StickyType.BoundedContext].border,
    definition: "Une frontière sémantique dans laquelle un vocabulaire métier est cohérent.",
    example: "« Gestion des commandes », « Facturation », « Logistique ».",
    tip: "Conteneur visuel englobant.",
  },
};
