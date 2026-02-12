import { ComponentFixture, TestBed } from '@angular/core/testing';
import { TermsConditionPage } from './terms-condition.page';

describe('TermsConditionPage', () => {
  let component: TermsConditionPage;
  let fixture: ComponentFixture<TermsConditionPage>;

  beforeEach(() => {
    fixture = TestBed.createComponent(TermsConditionPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
