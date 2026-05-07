# ADR 0004 — Pas de liens implicites dans l'export Mermaid

**Statut** : Accepté  
**Étape** : 10  
**Date** : 2026-05-07

## Contexte

L'export Mermaid doit représenter visuellement les stickies placés sur le canvas. Deux approches s'offraient :

1. **Liens implicites par proximité** : inférer des relations entre stickies en fonction de leur distance ou position relative sur le canvas.
2. **Liens explicites uniquement** : ne relier que les `DomainEvent` entre eux par ordre de position X (la seule relation sémantique explicite en Event Storming).

## Décision

On n'injecte **aucun lien implicite** dans l'export. Seuls les `DomainEvent` sont reliés entre eux (`-->`) dans le subgraph `Timeline`, triés par X croissant (tiebreaker Y, puis id). Tous les autres types sont listés dans leurs subgraphs respectifs sans flèches.

Les `BoundedContext` sont détectés géométriquement : un sticky est considéré "dans" un BC si son centre (`cx = x + width/2`, `cy = y + height/2`) est contenu dans le rectangle du BC. Cette détection est documentée dans le code (`mermaid-builder.ts`).

## Raisons

- **Fidélité au modèle** : en Event Storming, les relations entre stickies autres que les events ne sont pas formalisées — les proximités visuelles sont intentionnelles mais informelles.
- **Déterminisme** : un export avec des liens d'inférence produirait des résultats différents selon la tolérance de proximité choisie, difficile à tester et à valider.
- **Lisibilité Mermaid** : un graphe avec de nombreux liens implicites devient illisible. La valeur d'un export Mermaid est dans la chronologie des events et les groupements par type.
- **Rejeter l'inférence de liens par proximité** était déjà mentionné explicitement dans les contraintes hors périmètre (SPEC §11).

## Conséquences

- `mermaid-builder.ts` est pur et testable : entrée = Workshop, sortie = string déterministe.
- La validation des exports est possible via golden files.
- Les liens entre Command → Event, Policy → Command, etc., ne sont pas représentés dans l'export v1. C'est un choix conscient pour v1 ; les liens explicites entre stickies sont prévus en v2 (SPEC §11).
