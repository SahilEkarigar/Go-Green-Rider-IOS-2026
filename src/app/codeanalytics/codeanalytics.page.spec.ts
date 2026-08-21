import { ComponentFixture, TestBed } from '@angular/core/testing';
import { CodeAnalyticsPage } from './codeanalytics.page';

describe('CodeAnalyticsPage', () => {
  let component: CodeAnalyticsPage;
  let fixture: ComponentFixture<CodeAnalyticsPage>;

  beforeEach(() => {
    fixture = TestBed.createComponent(CodeAnalyticsPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
