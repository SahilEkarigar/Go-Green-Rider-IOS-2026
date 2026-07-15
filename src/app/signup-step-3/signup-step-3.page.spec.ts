import { ComponentFixture, TestBed } from '@angular/core/testing';
import { SignupStep3Page } from './signup-step-3.page';

describe('SignupStep3Page', () => {
  let component: SignupStep3Page;
  let fixture: ComponentFixture<SignupStep3Page>;

  beforeEach(() => {
    fixture = TestBed.createComponent(SignupStep3Page);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
