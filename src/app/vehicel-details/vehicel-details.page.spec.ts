import { ComponentFixture, TestBed } from '@angular/core/testing';
import { VehicelDetailsPage } from './vehicel-details.page';

describe('VehicelDetailsPage', () => {
  let component: VehicelDetailsPage;
  let fixture: ComponentFixture<VehicelDetailsPage>;

  beforeEach(() => {
    fixture = TestBed.createComponent(VehicelDetailsPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
