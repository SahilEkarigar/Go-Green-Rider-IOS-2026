import { ComponentFixture, TestBed } from '@angular/core/testing';
import { WithdrawalPage } from './withdrawal.page';

describe('WithdrawalPage', () => {
  let component: WithdrawalPage;
  let fixture: ComponentFixture<WithdrawalPage>;

  beforeEach(() => {
    fixture = TestBed.createComponent(WithdrawalPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
