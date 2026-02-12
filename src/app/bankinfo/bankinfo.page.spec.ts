import { ComponentFixture, TestBed } from '@angular/core/testing';
import { BankinfoPage } from './bankinfo.page';

describe('BankinfoPage', () => {
  let component: BankinfoPage;
  let fixture: ComponentFixture<BankinfoPage>;

  beforeEach(() => {
    fixture = TestBed.createComponent(BankinfoPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
