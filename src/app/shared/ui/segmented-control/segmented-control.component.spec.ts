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
    btn: (value: string) => HTMLButtonElement;
  } {
    const fixture = TestBed.createComponent(SegmentedControlComponent);
    fixture.componentRef.setInput('items', overrides.items ?? ITEMS);
    fixture.componentRef.setInput('selectedValue', overrides.selectedValue ?? 'big');
    fixture.detectChanges();
    const el = fixture.nativeElement as HTMLElement;
    const btn = (value: string): HTMLButtonElement =>
      el.querySelector(`button[data-value="${value}"]`) as HTMLButtonElement;
    return { fixture, el, btn };
  }

  it('should render all items as buttons', () => {
    const { el } = create();
    expect(el.querySelectorAll('button').length).toBe(ITEMS.length);
  });

  it('should apply text-white to selected item', () => {
    const { fixture, btn } = create({ selectedValue: 'big' });
    const bigBtn = fixture.debugElement.query(By.css('button[data-value="big"]'));
    const processBtn = fixture.debugElement.query(By.css('button[data-value="process"]'));
    expect(bigBtn.nativeElement.classList).toContain('text-white');
    expect(processBtn.nativeElement.classList).not.toContain('text-white');
    expect(btn('big')).toBeTruthy(); // btn helper works
  });

  it('should emit selectedChange with value when enabled item is clicked', () => {
    const items: SegmentItem[] = [
      { label: 'A', value: 'a' },
      { label: 'B', value: 'b' },
    ];
    const { fixture, btn } = create({ items, selectedValue: 'a' });
    let emitted: string | null = null;
    fixture.componentInstance.selectedChange.subscribe((v: string) => { emitted = v; });

    btn('b').click();

    expect(emitted).toBe('b');
  });

  it('should not emit when disabled item is clicked', () => {
    const { fixture, btn } = create({ selectedValue: 'big' });
    let emitCount = 0;
    fixture.componentInstance.selectedChange.subscribe(() => { emitCount++; });

    btn('process').click();

    expect(emitCount).toBe(0);
  });

  it('should not emit when clicking already selected item', () => {
    const { fixture, btn } = create({ selectedValue: 'big' });
    let emitCount = 0;
    fixture.componentInstance.selectedChange.subscribe(() => { emitCount++; });

    btn('big').click();

    expect(emitCount).toBe(0);
  });

  it('should mark disabled buttons with aria-disabled', () => {
    const { btn } = create();
    expect(btn('process').getAttribute('aria-disabled')).toBe('true');
  });

  it('should mark selected button with aria-pressed true', () => {
    const { btn } = create({ selectedValue: 'big' });
    expect(btn('big').getAttribute('aria-pressed')).toBe('true');
    expect(btn('process').getAttribute('aria-pressed')).toBe('false');
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
