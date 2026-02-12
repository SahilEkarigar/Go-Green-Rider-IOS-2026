import { TestBed } from '@angular/core/testing';

import { LocationTracker } from './location-tracker';

describe('LocationTracker', () => {
  let service: LocationTracker;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(LocationTracker);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
