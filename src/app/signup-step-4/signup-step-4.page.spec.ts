import { ComponentFixture, TestBed } from '@angular/core/testing';
import { SignupStep4Page } from './signup-step-4.page';

describe('SignupStep4Page', () => {
  let component: SignupStep4Page;
  let fixture: ComponentFixture<SignupStep4Page>;

  beforeEach(() => {
    fixture = TestBed.createComponent(SignupStep4Page);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
