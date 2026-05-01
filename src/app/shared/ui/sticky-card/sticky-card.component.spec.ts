import { ComponentFixture, TestBed } from '@angular/core/testing';
import { StickyCardComponent, STICKY_COLORS } from './sticky-card.component';
import { StickyType } from '../../../domain/sticky-type';

describe('StickyCardComponent', () => {
  let fixture: ComponentFixture<StickyCardComponent>;

  function create(inputs: Partial<{
    type: StickyType;
    label: string;
    rotation: number;
    selected: boolean;
    isDragging: boolean;
  }> = {}) {
    fixture = TestBed.createComponent(StickyCardComponent);
    fixture.componentRef.setInput('type', inputs.type ?? StickyType.DomainEvent);
    if (inputs.label !== undefined) fixture.componentRef.setInput('label', inputs.label);
    if (inputs.rotation !== undefined) fixture.componentRef.setInput('rotation', inputs.rotation);
    if (inputs.selected !== undefined) fixture.componentRef.setInput('selected', inputs.selected);
    if (inputs.isDragging !== undefined) fixture.componentRef.setInput('isDragging', inputs.isDragging);
    fixture.detectChanges();
    return fixture.nativeElement as HTMLElement;
  }

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [StickyCardComponent],
    }).compileComponents();
  });

  it('should display label when provided', () => {
    const el = create({ label: 'Commande passée' });
    expect(el.textContent?.trim()).toBe('Commande passée');
  });

  it('should display empty string when label is empty', () => {
    const el = create({ label: '' });
    expect(el.textContent?.trim()).toBe('');
  });

  it('should apply rotation transform', () => {
    const el = create({ rotation: 1.5 });
    const card = el.querySelector('[data-testid="sticky-card"]') as HTMLElement;
    expect(card.style.transform).toBe('rotate(1.5deg)');
  });

  it('should use correct background color for DomainEvent', () => {
    const el = create({ type: StickyType.DomainEvent });
    const card = el.querySelector('[data-testid="sticky-card"]') as HTMLElement;
    expect(card.style.backgroundColor).toBeTruthy();
    expect(STICKY_COLORS[StickyType.DomainEvent].bg).toBe('#ff9900');
  });

  it('should use transparent background for BoundedContext', () => {
    expect(STICKY_COLORS[StickyType.BoundedContext].bg).toBe('transparent');
  });

  it('should show outline ring when selected', () => {
    const el = create({ selected: true });
    const card = el.querySelector('[data-testid="sticky-card"]') as HTMLElement;
    expect(card.style.outline).toContain('2px');
  });

  it('should not show outline when not selected', () => {
    const el = create({ selected: false });
    const card = el.querySelector('[data-testid="sticky-card"]') as HTMLElement;
    expect(card.style.outline).toBe('none');
  });

  it('should define colors for all sticky types', () => {
    const types = Object.values(StickyType);
    for (const type of types) {
      expect(STICKY_COLORS[type]).toBeDefined();
      expect(STICKY_COLORS[type].bg).toBeTruthy();
    }
  });

  it('should have dark text on light backgrounds (Actor, Aggregate, DomainEvent)', () => {
    expect(STICKY_COLORS[StickyType.Actor].text).toBe('#000');
    expect(STICKY_COLORS[StickyType.Aggregate].text).toBe('#000');
    expect(STICKY_COLORS[StickyType.DomainEvent].text).toBe('#000');
  });

  it('should have light text on dark backgrounds (Command, Policy, ExternalSystem, ReadModel)', () => {
    expect(STICKY_COLORS[StickyType.Command].text).toBe('#fff');
    expect(STICKY_COLORS[StickyType.Policy].text).toBe('#fff');
    expect(STICKY_COLORS[StickyType.ExternalSystem].text).toBe('#fff');
    expect(STICKY_COLORS[StickyType.ReadModel].text).toBe('#fff');
  });
});
