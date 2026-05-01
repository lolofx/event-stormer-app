import { ComponentFixture, TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { SegmentedControlComponent, SegmentItem } from './segmented-control.component';

const ITEMS: SegmentItem[] = [
  { label: 'Big Picture', value: 'big' },
  { label: 'Process', value: 'process', disabled: true },
  { label: 'Design', value: 'design', disabled: true },
];

describe('SegmentedControlComponent', () => {
  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [SegmentedControlComponent],
    }).compileComponents();
  });

  function create(overrides: { selectedValue?: string; items?: SegmentItem[] } = {}): {
    fixture: ComponentFixture<SegmentedControlComponent>;
    el: HTMLElement;
  } {
    const fixture = TestBed.createComponent(SegmentedControlComponent);
    fixture.componentRef.setInput('items', overrides.items ?? ITEMS);
    fixture.componentRef.setInput('selectedValue', overrides.selectedValue ?? 'big');
    fixture.detectChanges();
    return { fixture, el: fixture.nativeElement as HTMLElement };
  }

  it('should render all items as buttons', () => {
    const { el } = create();
    const buttons = el.querySelectorAll('button');
    expect(buttons.length).toBe(ITEMS.length);
  });

  it('should apply text-white to selected item', () => {
    const { fixture } = create({ selectedValue: 'big' });
    const buttons = fixture.debugElement.queryAll(By.css('button'));
    expect(buttons[0]!.nativeElement.classList).toContain('text-white');
    expect(buttons[1]!.nativeElement.classList).not.toContain('text-white');
  });

  it('should emit selectedChange with value when enabled item is clicked', () => {
    const items: SegmentItem[] = [
      { label: 'A', value: 'a' },
      { label: 'B', value: 'b' },
    ];
    const { fixture } = create({ items, selectedValue: 'a' });
    let emitted: string | null = null;
    fixture.componentInstance.selectedChange.subscribe((v: string) => { emitted = v; });

    fixture.debugElement.queryAll(By.css('button'))[1]!.nativeElement.click();

    expect(emitted).toBe('b');
  });

  it('should not emit when disabled item is clicked', () => {
    const { fixture } = create({ selectedValue: 'big' });
    let emitCount = 0;
    fixture.componentInstance.selectedChange.subscribe(() => { emitCount++; });

    fixture.debugElement.queryAll(By.css('button'))[1]!.nativeElement.click();

    expect(emitCount).toBe(0);
  });

  it('should not emit when clicking already selected item', () => {
    const { fixture } = create({ selectedValue: 'big' });
    let emitCount = 0;
    fixture.componentInstance.selectedChange.subscribe(() => { emitCount++; });

    fixture.debugElement.queryAll(By.css('button'))[0]!.nativeElement.click();

    expect(emitCount).toBe(0);
  });

  it('should mark disabled buttons with aria-disabled', () => {
    const { fixture } = create();
    const buttons = fixture.debugElement.queryAll(By.css('button'));
    expect(buttons[1]!.nativeElement.getAttribute('aria-disabled')).toBe('true');
  });

  it('should mark selected button with aria-pressed true', () => {
    const { fixture } = create({ selectedValue: 'big' });
    const buttons = fixture.debugElement.queryAll(By.css('button'));
    expect(buttons[0]!.nativeElement.getAttribute('aria-pressed')).toBe('true');
    expect(buttons[1]!.nativeElement.getAttribute('aria-pressed')).toBe('false');
  });

  it('should have group role on container', () => {
    const { el } = create();
    expect(el.querySelector('[role="group"]')).toBeTruthy();
  });

  it('should translate pill to index 1 when second item is selected', () => {
    const items: SegmentItem[] = [
      { label: 'A', value: 'a' },
      { label: 'B', value: 'b' },
      { label: 'C', value: 'c' },
    ];
    const { el } = create({ items, selectedValue: 'b' });
    const pill = el.querySelector('[aria-hidden="true"]') as HTMLElement;
    expect(pill.style.transform).toBe('translateX(calc(1 * 100%))');
  });
});
