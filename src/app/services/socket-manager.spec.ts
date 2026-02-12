import { TestBed } from '@angular/core/testing';

import { SocketManager } from './socket-manager';

describe('SocketManager', () => {
  let service: SocketManager;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(SocketManager);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
