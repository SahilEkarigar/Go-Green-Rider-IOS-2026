import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ShopstatusPage } from './shopstatus.page';

describe('ShopstatusPage', () => {
  let component: ShopstatusPage;
  let fixture: ComponentFixture<ShopstatusPage>;

  beforeEach(() => {
    fixture = TestBed.createComponent(ShopstatusPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
