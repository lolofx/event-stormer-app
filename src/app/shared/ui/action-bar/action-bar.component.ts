import { Component } from '@angular/core';

@Component({
  selector: 'app-action-bar',
  standalone: true,
  template: `
    <div class="flex flex-col items-center bg-white/95 backdrop-blur-md rounded-2xl border border-ui-border shadow-dock overflow-hidden">
      <ng-content />
    </div>
  `,
  host: {
    class: 'fixed bottom-6 right-6 z-50 flex flex-col items-end',
    role: 'toolbar',
    'aria-label': 'Actions du workshop',
  },
})
export class ActionBarComponent {}
