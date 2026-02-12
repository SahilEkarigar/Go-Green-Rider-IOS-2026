import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

@Injectable({
  providedIn: 'root'  // makes this service available globally
})
export class OrderStateService {

  // Holds the currently accepted order
  private acceptedOrderSubject = new BehaviorSubject<any>(null);

  // Observable that other components can subscribe to
  acceptedOrder$ = this.acceptedOrderSubject.asObservable();

  constructor() {}

  // Call this to update the accepted order
  setAcceptedOrder(order: any) {
    this.acceptedOrderSubject.next(order);
  }
}
