import { Injectable, NgZone } from '@angular/core';
import { Storage } from '@ionic/storage-angular';
import { Platform } from '@ionic/angular';
import { SocketService } from './socket.service';
import { Network } from '@capacitor/network';
import { take } from 'rxjs';

@Injectable({ providedIn: 'root' })
export class SocketManager {
  private isAppActive = true;
  private reconnectTimer: any = null;
  private reconnectDelay = 5000; // start with 5s

  private initialized = false;
  private connecting = false;

  constructor(
    private platform: Platform,
    private socketService: SocketService,
    private storage: Storage,
    private ngZone: NgZone
  ) { }

  async initialize(notificationHandler: any, isAppActive: boolean) {
    if (this.initialized) {
      // console.log('⚠️ SocketManager already initialized — skipping');
      return;
    }

    this.initialized = true;
    this.isAppActive = isAppActive;
    await this.platform.ready();
    await this.storage.create();

    let user_id = await this.storage.get('user_id');

    if (!user_id) {
      console.warn('⚠️ No rider ID found in storage, retrying in 2s...');
      // setTimeout(() => this.initialize(notificationHandler, this.isAppActive), 2000);
      return;
    }

    // console.log('🛰 Initializing socket for rider:', user_id);

    // ✅ Listen for socket new orders
    this.socketService.newOrder$
      .subscribe((data) => {
        if (!data) return;
        this.ngZone.run(() => {
          notificationHandler.handleNewOrderNotification({ ...data, source: 'socket' });
        });
      })

    // ✅ Connect socket safely
    this.safeConnect(user_id);

    // ✅ Reconnect on resume / pause events
    // this.platform.resume.subscribe(async () => {
    //   console.log('▶️ App resumed — reconnecting socket...');
    //   const id = await this.storage.get('user_id');
    //   if (id) this.safeConnect(id);
    // });

    // this.platform.pause.subscribe(() => {
    //   console.log('⏸️ App paused — disconnecting socket...');
    //   this.socketService.disconnect();
    // });

    // ✅ Reconnect on network regain
    Network.addListener('networkStatusChange', async (status) => {
      if (status.connected) {
        // console.log('📡 Network restored — reconnecting socket...');
        const id = await this.storage.get('user_id');
        if (id) this.safeConnect(id);
      }
    });

    // ✅ Health check every 10 seconds
    setInterval(async () => {
      const id = await this.storage.get('user_id');
      if (!this.socketService.isConnected() && id) {
        console.warn('⚠️ Socket disconnected! Reconnecting...');
        this.safeConnect(id);
      }
    }, 30000);
  }

  private async safeConnect(user_id: string) {
    if (this.socketService.isConnected() || this.connecting) {
      return;
    }

    this.connecting = true;

    try {
      await this.socketService.connect(user_id);
      this.reconnectDelay = 5000;
    } catch (err) {
      clearTimeout(this.reconnectTimer);
      this.reconnectTimer = setTimeout(() => {
        this.safeConnect(user_id);
        this.reconnectDelay = Math.min(this.reconnectDelay * 2, 60000);
      }, this.reconnectDelay);
    } finally {
      this.connecting = false;
    }
  }

  async handleAppStateChange(isActive: boolean) {
    this.isAppActive = isActive;
    const user_id = await this.storage.get('user_id');
    if (!user_id) return;

    if (isActive) {
      // console.log('▶️ App foregrounded — reconnecting socket.');
      this.safeConnect(user_id);
    } else {
      // console.log('⏸️ App backgrounded — disconnecting socket.');
      this.socketService.disconnect();
    }
  }
}
