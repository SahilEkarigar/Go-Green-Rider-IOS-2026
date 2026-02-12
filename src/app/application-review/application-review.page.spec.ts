import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ApplicationReviewPage } from './application-review.page';

describe('ApplicationReviewPage', () => {
  let component: ApplicationReviewPage;
  let fixture: ComponentFixture<ApplicationReviewPage>;

  beforeEach(() => {
    fixture = TestBed.createComponent(ApplicationReviewPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
