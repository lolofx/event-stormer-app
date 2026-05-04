import { InjectionToken } from '@angular/core';
import type { StickyTooltipData } from '../../pedagogy/sticky-tooltips';

export const PEDAGOGY_TOOLTIP_DATA = new InjectionToken<StickyTooltipData>('PEDAGOGY_TOOLTIP_DATA');
