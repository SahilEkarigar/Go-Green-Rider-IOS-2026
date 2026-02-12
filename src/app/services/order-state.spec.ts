import { TestBed } from '@angular/core/testing';

import { OrderStateService } from './order-state';

describe('OrderState', () => {
  let service: OrderStateService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(OrderStateService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
