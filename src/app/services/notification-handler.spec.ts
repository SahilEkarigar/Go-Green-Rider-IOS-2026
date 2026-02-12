import { TestBed } from '@angular/core/testing';

import { NotificationHandler } from './notification-handler';

describe('NotificationHandler', () => {
  let service: NotificationHandler;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(NotificationHandler);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
