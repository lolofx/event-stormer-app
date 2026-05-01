import { Component } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ActionBarComponent } from './action-bar.component';

@Component({
  standalone: true,
  imports: [ActionBarComponent],
  template: `
    <app-action-bar>
      <button class="bar-btn">Export</button>
      <button class="bar-btn">New</button>
    </app-action-bar>
  `,
})
class ContentHostComponent {}

describe('ActionBarComponent', () => {
  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ActionBarComponent, ContentHostComponent],
    }).compileComponents();
  });

  it('should project ng-content items', () => {
    const fixture: ComponentFixture<ContentHostComponent> =
      TestBed.createComponent(ContentHostComponent);
    fixture.detectChanges();
    const items = fixture.nativeElement.querySelectorAll('.bar-btn');
    expect(items.length).toBe(2);
  });

  it('should have toolbar role for accessibility', () => {
    const fixture = TestBed.createComponent(ActionBarComponent);
    fixture.detectChanges();
    const el = fixture.nativeElement as HTMLElement;
    expect(el.getAttribute('role')).toBe('toolbar');
  });

  it('should be positioned fixed at bottom-right via host class', () => {
    const fixture = TestBed.createComponent(ActionBarComponent);
    fixture.detectChanges();
    const el = fixture.nativeElement as HTMLElement;
    // host class includes fixed bottom-6 right-6
    expect(el.classList).toContain('fixed');
  });
});
