import { Component } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { DockComponent } from './dock.component';

// Host needed only to test ng-content projection
@Component({
  standalone: true,
  imports: [DockComponent],
  template: `
    <app-dock>
      <span class="dock-item">A</span>
      <span class="dock-item">B</span>
    </app-dock>
  `,
})
class ContentHostComponent {}

describe('DockComponent', () => {
  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [DockComponent, ContentHostComponent],
    }).compileComponents();
  });

  function createDock(inputs: { collapsed?: boolean } = {}): {
    fixture: ComponentFixture<DockComponent>;
    el: HTMLElement;
  } {
    const fixture = TestBed.createComponent(DockComponent);
    if (inputs.collapsed !== undefined) {
      fixture.componentRef.setInput('collapsed', inputs.collapsed);
    }
    fixture.detectChanges();
    return { fixture, el: fixture.nativeElement as HTMLElement };
  }

  it('should project ng-content items', () => {
    const fixture = TestBed.createComponent(ContentHostComponent);
    fixture.detectChanges();
    const items = fixture.nativeElement.querySelectorAll('.dock-item');
    expect(items.length).toBe(2);
  });

  it('should render toggle handle', () => {
    const { fixture } = createDock();
    const handle = fixture.debugElement.query(By.css('[data-testid="dock-handle"]'));
    expect(handle).toBeTruthy();
  });

  it('should emit toggleCollapsed when handle is clicked', () => {
    const { fixture } = createDock();
    let emitCount = 0;
    fixture.componentInstance.toggleCollapsed.subscribe(() => { emitCount++; });

    const handle = fixture.debugElement.query(By.css('[data-testid="dock-handle"]'));
    handle.nativeElement.click();

    expect(emitCount).toBe(1);
  });

  it('should add collapsed class when collapsed is true', () => {
    const { fixture } = createDock({ collapsed: true });
    const content = fixture.debugElement.query(By.css('[data-testid="dock-content"]'));
    expect(content.nativeElement.classList).toContain('dock-collapsed');
  });

  it('should not add collapsed class when expanded', () => {
    const { fixture } = createDock({ collapsed: false });
    const content = fixture.debugElement.query(By.css('[data-testid="dock-content"]'));
    expect(content.nativeElement.classList).not.toContain('dock-collapsed');
  });
});
