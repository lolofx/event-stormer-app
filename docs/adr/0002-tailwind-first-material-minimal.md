# ADR 0002 — Tailwind en priorité, Material minimal

**Statut** : Accepté | **Date** : 2026-04-29

## Contexte

Angular Material est la librairie de composants Angular la plus mature, mais son thème M3 par défaut impose un violet primaire reconnaissable qui donne à l'UI un aspect "démo générique". L'objectif est d'utiliser Material uniquement pour les composants modaux (Dialog, Snackbar) tout en maintenant la direction visuelle Figma-like du projet (ADR 0006).

## Décision

**90 % de l'UI via Tailwind CSS custom.** Angular Material restreint à :
- `MatDialog` — confirmations, export obligatoire, déblocage de niveaux
- `MatSnackBar` — notifications courtes (auto-save, erreurs, succès)

**Thème Material :**
- Palette `mat.$azure-palette` (neutre, évite le violet M3 par défaut `mat.$violet-palette`)
- Typography overridée vers Geist (Roboto supprimé)
- Composants thématisés selectivement : `mat.dialog-theme()`, `mat.snack-bar-theme()`, `mat.button-theme()`
- CSS custom properties MDC overridées pour aligner sur les tokens du projet (`--surface`, `--text-primary`, etc.)
- Animations lazy-chargées via `provideAnimationsAsync()` (67 kB différé, non bloquant)

## Alternatives rejetées

- **Angular Material pour toute l'UI** : UI ressemblerait à une démo Material, anti-spec SPEC §9.1.
- **CDK Overlay sans Material** : CDK seul couvre bien les tooltips custom et le drag-drop, donc Material reste cantonné aux dialogs.
- **Pas de Material du tout** : reconstrire MatDialog serait plus coûteux que de l'encapsuler proprement.

## Conséquences

- `material-minimal-theme.scss` est le seul fichier autorisé à importer `@angular/material`.
- Tout nouveau composant UI passe par Tailwind. Toute tentation d'utiliser un composant Material non listé est un anti-pattern.
- La palette azure donne une légère teinte bleue à certains états focus/ripple des dialogs — acceptable car peu visible et compensée par les CSS overrides MDC.
