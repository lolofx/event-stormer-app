import { Routes } from '@angular/router';

export const routes: Routes = [
  {
    path: '',
    loadComponent: () =>
      import('./features/canvas/canvas.component').then((m) => m.CanvasComponent),
  },
];
