import { ComponentFixture, TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { EditableTitleComponent } from './editable-title.component';

describe('EditableTitleComponent', () => {
  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [EditableTitleComponent],
    }).compileComponents();
  });

  function create(title = 'Mon atelier'): {
    fixture: ComponentFixture<EditableTitleComponent>;
    input: HTMLInputElement;
  } {
    const fixture = TestBed.createComponent(EditableTitleComponent);
    fixture.componentRef.setInput('title', title);
    fixture.detectChanges();
    const input = fixture.debugElement.query(By.css('input')).nativeElement as HTMLInputElement;
    return { fixture, input };
  }

  it('should display the title in the input', () => {
    const { input } = create('Mon atelier');
    expect(input.value).toBe('Mon atelier');
  });

  it('should emit titleChange on blur when value changed', () => {
    const { fixture, input } = create('Original');
    let emitted: string | null = null;
    fixture.componentInstance.titleChange.subscribe((v: string) => { emitted = v; });

    input.value = 'Nouveau titre';
    input.dispatchEvent(new Event('input'));
    input.dispatchEvent(new FocusEvent('blur'));

    expect(emitted).toBe('Nouveau titre');
  });

  it('should not emit titleChange on blur when value unchanged', () => {
    const { fixture, input } = create('Original');
    let emitCount = 0;
    fixture.componentInstance.titleChange.subscribe(() => { emitCount++; });

    input.dispatchEvent(new FocusEvent('blur'));

    expect(emitCount).toBe(0);
  });

  it('should trim whitespace before emitting', () => {
    const { fixture, input } = create('Original');
    let emitted: string | null = null;
    fixture.componentInstance.titleChange.subscribe((v: string) => { emitted = v; });

    input.value = '  Nouveau  ';
    input.dispatchEvent(new Event('input'));
    input.dispatchEvent(new FocusEvent('blur'));

    expect(emitted).toBe('Nouveau');
  });

  it('should revert to original title and not emit on Escape', () => {
    const { fixture, input } = create('Original');
    let emitCount = 0;
    fixture.componentInstance.titleChange.subscribe(() => { emitCount++; });

    input.value = 'En cours de saisie';
    input.dispatchEvent(new Event('input'));
    fixture.detectChanges(); // Angular must know about the draft change before Escape
    input.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape', bubbles: true }));
    fixture.detectChanges();

    expect(input.value).toBe('Original');
    expect(emitCount).toBe(0);
  });

  it('should not emit empty title on blur — reverts to original', () => {
    const { fixture, input } = create('Original');
    let emitted: string | null = null;
    fixture.componentInstance.titleChange.subscribe((v: string) => { emitted = v; });

    input.value = '   ';
    input.dispatchEvent(new Event('input'));
    input.dispatchEvent(new FocusEvent('blur'));

    expect(emitted).toBeNull();
  });

  it('should show placeholder attribute', () => {
    const { input } = create('');
    expect(input.getAttribute('placeholder')).toBeTruthy();
  });
});
