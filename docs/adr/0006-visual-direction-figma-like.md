# ADR 0006 — Direction visuelle Figma-like

**Statut** : Accepté | **Date** : 2026-04-29

## Contexte

EventStormer est un outil de projection. Il doit être lisible à 3–5 m sur grand écran et donner une impression professionnelle, sans ressembler à une démo Angular Material générique.

## Décision

Minimalisme précis inspiré de **Figma / Linear / Excalidraw / tldraw** :

- **Canvas** : fond `#FAFAF7` (blanc cassé chaud), grille de points `#E5E5E0` via `radial-gradient` CSS (pas SVG pattern — plus performant).
- **Typographie** : Geist (Vercel) en local via `@font-face`, poids 400/500/600. Jamais Inter, Roboto, Arial.
- **Couleurs stickies** : convention Brandolini (orange #FF9900, bleu #4A90E2, jaune #FFEB3B, violet #9C27B0, rose #EC407A, jaune pâle #FFF59D, vert #66BB6A, contour #424242).
- **Angular Material** : restreint à MatDialog + MatSnackBar. Thème personnalisé neutralisant le violet M3 par défaut.
- **Tailwind CSS** : 90 % de l'UI. Config v3 avec tokens custom (`sticky-event`, `shadow-dock`, etc.).
- **CSS custom properties** dans `tokens.css` : source de vérité, consommées par Tailwind et le SCSS natif.

## Stack styles

```
src/styles.scss          ← point d'entrée (@use ordonné)
  ├── fonts.css          ← @font-face Geist (local, OFL)
  ├── tokens.css         ← CSS custom properties (palette SPEC §9.2)
  ├── tailwind.css       ← @tailwind base/components/utilities
  └── material-minimal-theme.scss  ← overrides Material 3
tailwind.config.ts       ← palette + shadows + fontFamily étendus
postcss.config.mjs       ← tailwindcss + autoprefixer
public/fonts/            ← Geist-Regular/Medium/SemiBold + GeistMono-Regular
```

## Alternatives rejetées

- **Tailwind v4** : config CSS-first sans `tailwind.config.ts`. Moins adapté aux tokens structurés du SPEC, incompatible avec la syntaxe BOOTSTRAP.md attendue. À reconsidérer en v2.
- **aidesigner MCP** : génère HTML/Tailwind à reconvertir en Angular. ROI faible pour un écran unique.
- **Thème sombre** : hors périmètre v1.

## Conséquences

- Tout composant UI doit passer par le skill `frontend-design` avant implémentation.
- Pas de couleur Material 3 violette par défaut : override obligatoire dans `material-minimal-theme.scss`.
- Les fonts locales évitent toute requête CDN externe (RGPD + perf).
