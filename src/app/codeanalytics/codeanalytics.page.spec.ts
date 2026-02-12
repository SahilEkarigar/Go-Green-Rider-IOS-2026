import { ComponentFixture, TestBed } from '@angular/core/testing';
import { CodeanalyticsPage } from './codeanalytics.page';

describe('CodeanalyticsPage', () => {
  let component: CodeanalyticsPage;
  let fixture: ComponentFixture<CodeanalyticsPage>;

  beforeEach(() => {
    fixture = TestBed.createComponent(CodeanalyticsPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
