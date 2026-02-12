import { ComponentFixture, TestBed } from '@angular/core/testing';
import { RiderDetailsPage } from './rider-details.page';

describe('RiderDetailsPage', () => {
  let component: RiderDetailsPage;
  let fixture: ComponentFixture<RiderDetailsPage>;

  beforeEach(() => {
    fixture = TestBed.createComponent(RiderDetailsPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
