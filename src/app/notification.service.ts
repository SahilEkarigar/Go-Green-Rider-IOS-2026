import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class NotificationService {
  private count = new BehaviorSubject<number>(0);
  count$ = this.count.asObservable();

  incrementCount() {
    this.count.next(this.count.value + 1);
  }

  resetCount() {
    this.count.next(0);
  }

  getCurrentCount() {
    return this.count.value;
  }
}
