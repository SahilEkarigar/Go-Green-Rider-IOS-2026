import { Component, NgZone } from '@angular/core';
import { Platform } from '@ionic/angular';
import { App } from '@capacitor/app';
import { FcmService } from './services/fcm.service';
import { SocketManager } from './services/socket-manager';
import { LocationTracker } from './services/location-tracker';
import { NotificationHandler } from './services/notification-handler';
import { Storage } from '@ionic/storage-angular';
import { StatusBar, Style } from '@capacitor/status-bar';
import { Router, NavigationEnd } from '@angular/router';
import { filter } from 'rxjs/operators';

import { ScreenOrientation } from '@capacitor/screen-orientation';
import { addIcons } from 'ionicons';
import {
  personOutline,
  keyOutline,
  carOutline,
  statsChartOutline,
  documentTextOutline,
  timeOutline,
  swapHorizontalOutline,
  businessOutline,
  helpCircleOutline,
  chatbubblesOutline,
  documentAttachOutline,
  lockClosedOutline,
  starOutline,
  logOutOutline,
  chevronForwardOutline,
  chevronBackOutline,
  bagHandleOutline,
  checkmarkDoneCircleOutline
} from 'ionicons/icons';

@Component({
  selector: 'app-root',
  templateUrl: 'app.component.html',
  styleUrls: ['app.component.scss'],
  standalone: false,
})
export class AppComponent {
  isAppActive = true;

  constructor(
    private platform: Platform,
    private fcm: FcmService,
    private socketManager: SocketManager,
    private locationTracker: LocationTracker,
    private notificationHandler: NotificationHandler,
    private ngZone: NgZone,
    private storage: Storage,
    private router: Router
  ) {
    addIcons({
      personOutline,
      keyOutline,
      carOutline,
      statsChartOutline,
      documentTextOutline,
      timeOutline,
      swapHorizontalOutline,
      businessOutline,
      helpCircleOutline,
      chatbubblesOutline,
      documentAttachOutline,
      lockClosedOutline,
      starOutline,
      logOutOutline,
      chevronForwardOutline,
      chevronBackOutline,
      bagHandleOutline,
      checkmarkDoneCircleOutline
    });
    this.platform.ready().then(() => this.initializeApp());
    this.platform.ready().then(async () => {
      try {
        await StatusBar.setOverlaysWebView({ overlay: false });
      } catch (err) {
        console.error('StatusBar error', err);
      }
      try {
        await ScreenOrientation.lock({ orientation: 'portrait' });
      } catch (err) {
        // Screen orientation plugin not supported on web
      }
    });
  }

  async initializeApp() {
    await this.platform.ready();
    await this.storage.create();

    try {
      await ScreenOrientation.lock({ orientation: 'portrait' });
    } catch (err) {
      // Screen orientation fallback
    }

    // Listen to router navigation events to dynamically change status bar style/color
    this.router.events.pipe(
      filter(event => event instanceof NavigationEnd)
    ).subscribe((event: any) => {
      const url = event.urlAfterRedirects || event.url;
      const isSignupPage = url.includes('/signup') || url.includes('/signup-step');
      
      try {
        if (isSignupPage) {
          StatusBar.setBackgroundColor({ color: '#ffffff' });
          StatusBar.setStyle({ style: Style.Light });
        } else {
          // Brand green for all other screens
          StatusBar.setBackgroundColor({ color: '#005528' });
          StatusBar.setStyle({ style: Style.Dark });
        }
      } catch (err) {
        // StatusBar is only active on native platforms
      }
    });

    // ✅ Initialize FCM safely
    try {
      await this.fcm.initPush();
    } catch (err) {
      console.error('❌ FCM initialization failed, retrying in 3s...', err);
      setTimeout(() => this.fcm.initPush(), 3000);
    }

    // ✅ Track app state (foreground/background)
    App.addListener('appStateChange', ({ isActive }) => {
      this.ngZone.run(() => {
        this.isAppActive = isActive;
        // console.log(`📱 App state changed: ${isActive ? 'FOREGROUND' : 'BACKGROUND'}`);
        this.socketManager.handleAppStateChange(isActive);
      });
    });


    // ✅ Handle app pause (background or about to be killed)
    App.addListener('pause', async () => {
      // console.log('⏸️ App paused — disconnecting socket to save battery');
      this.socketManager['socketService']?.disconnect();
    });

    // ✅ Handle browser/tab close or PWA termination (optional for web testing)
    window.addEventListener('beforeunload', () => {
      // console.log('🧹 Cleaning up before app unload');
      this.socketManager['socketService']?.disconnect();
    });

    // ✅ Redundant fallback (Platform events)
    this.platform.pause.subscribe(() => {
      this.ngZone.run(() => {
        this.isAppActive = false;
        // console.log('⏸️ Platform PAUSE detected — disconnecting socket');
        this.socketManager.handleAppStateChange(false);
      });
    });

    this.platform.resume.subscribe(() => {
      this.ngZone.run(() => {
        this.isAppActive = true;
        // console.log('▶️ Platform RESUME detected — reconnecting socket');
        this.socketManager.handleAppStateChange(true);
      });
    });

    // ✅ Handle FCM push tap events
    this.fcm.onNotificationTapped$.subscribe((data) => {
      if (!data) return;
      // this.ngZone.run(() => {
        // console.log('📩 Push notification tapped:', data);
        this.notificationHandler.handleNewOrderNotification({ ...data, source: 'push_notification' });
      // });
    });
    
    const userId = await this.storage.get('user_id');

    if (userId) {
      // ✅ Initialize socket and background management
      this.socketManager.initialize(this.notificationHandler, this.isAppActive);

      // ✅ Start GPS tracking
      try {
        this.locationTracker.startTracking();
        // console.log('🛰️ Location tracking started');
      } catch (err) {
        console.error('⚠️ Location tracking failed:', err);
      }
    }

    // console.log('✅ App initialization complete.');
  }
}
