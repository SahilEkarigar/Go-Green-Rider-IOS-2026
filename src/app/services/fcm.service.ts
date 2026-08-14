
import { Injectable } from '@angular/core';
import { Router } from '@angular/router';
import { BehaviorSubject } from 'rxjs';
import { Capacitor } from '@capacitor/core';
import { FCM } from '@capacitor-community/fcm';
import {
  PushNotifications,
  ActionPerformed,
  PushNotificationSchema,
} from '@capacitor/push-notifications';
import { StorageService } from '../services/storage.service';

export const FCM_TOKEN = 'push_notification_token';

@Injectable({ providedIn: 'root' })
export class FcmService {
  private notificationTappedSource = new BehaviorSubject<any>(null);
  onNotificationTapped$ = this.notificationTappedSource.asObservable();

  constructor(private storage: StorageService, private router: Router) {}

  async initPush() {
    if (Capacitor.getPlatform() === 'web') return;

    await this.addListeners();

    let perm = await PushNotifications.checkPermissions();
    if (perm.receive === 'prompt') {
      perm = await PushNotifications.requestPermissions();
    }
    if (perm.receive !== 'granted') return;

    await PushNotifications.register();
    // Get FCM token
    const { token } = await FCM.getToken();
    await this.storage.setStorage(FCM_TOKEN, JSON.stringify(token));
  }

  private async addListeners() {

    // Foreground notifications
    PushNotifications.addListener(
      'pushNotificationReceived',
      (notification: PushNotificationSchema) => {
        // console.log('📩 Notification received (foreground):', notification);
      }
    );


    PushNotifications.addListener(
      'pushNotificationActionPerformed',
      (action: ActionPerformed) => {
        const data = action.notification?.data;
        // console.log('➡️ Notification tapped:', data);

        // ✅ Emit only when app opened from notification tap
        if (data && data.type === 'new_order') {
          this.notificationTappedSource.next(data);
        }
      }
    );
  }
}
