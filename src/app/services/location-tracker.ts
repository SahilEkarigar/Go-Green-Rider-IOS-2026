import { Injectable } from '@angular/core';
import { AlertController, Platform } from '@ionic/angular';
import { Diagnostic } from '@awesome-cordova-plugins/diagnostic/ngx';
import { Geolocation } from '@capacitor/geolocation';
import { Storage } from '@ionic/storage-angular';
import { AuthserviceService } from './authservice.service';
import { SocketService } from './socket.service';

@Injectable({ providedIn: 'root' })
export class LocationTracker {
  private watchId: any;
  private lastCoords: { latitude: number; longitude: number } | null = null;
  private lastSentTime = 0;
  private locationAlertActive = false;

  constructor(
    private platform: Platform,
    private alertCtrl: AlertController,
    private diagnostic: Diagnostic,
    private storage: Storage,
    private authService: AuthserviceService,
    private socketService: SocketService  ) {}

  async startTracking() {
    await this.platform.ready();
    await this.storage.create();

    this.monitorLocationStatus();
    this.startLiveLocationTracking();
  }

  private monitorLocationStatus() {
    setInterval(() => {
      this.diagnostic.isLocationEnabled()
        .then((enabled) => {
          if (!enabled && !this.locationAlertActive) {
            this.promptEnableLocation();
          }
        })
        .catch(console.error);
    }, 15000);
  }
  
  private async promptEnableLocation() {
    this.locationAlertActive = true;
    const alert = await this.alertCtrl.create({
      header: 'Location Disabled',
      message: 'Please enable location services for tracking.',
      buttons: [
        {
          text: 'Open Settings',
          handler: () => {
            this.diagnostic.switchToLocationSettings();
            this.locationAlertActive = false;
          },
        },
        {
          text: 'Cancel',
          role: 'cancel',
          handler: () => (this.locationAlertActive = false),
        },
      ],
    });
    await alert.present();
  }

  private async startLiveLocationTracking() {
    this.watchId = Geolocation.watchPosition(
      { enableHighAccuracy: true, timeout: 5000, maximumAge: 0 },
      async (position, err) => {
        if (err || !position?.coords) return;

        const { latitude, longitude, accuracy } = position.coords;
        if (accuracy > 30) return;

        const user_id = await this.storage.get('user_id');
        if (!user_id) return;

        const now = Date.now();

        if (this.lastCoords) {
          const distance = this.calcDistance(
            this.lastCoords,
            { latitude, longitude }
          ); // distance in KM

          const timeDiff = now - this.lastSentTime;

          // ❌ DO NOT SEND unless BOTH conditions are met
          if (distance < 0.002 || timeDiff < 3000) return;
        }

        // ✅ Update last values
        this.lastCoords = { latitude, longitude };
        this.lastSentTime = now;

        const data = {
          user_id,
          rider_lat: latitude,
          rider_lng: longitude,
        };

        console.log('📡 Sending location via socket:', data);

        this.socketService.sendRiderLocation(data);
      }
    );
  }


  private calcDistance(a: any, b: any) {
    const R = 6371;
    const dLat = (b.latitude - a.latitude) * (Math.PI / 180);
    const dLon = (b.longitude - a.longitude) * (Math.PI / 180);
    const lat1 = a.latitude * (Math.PI / 180);
    const lat2 = b.latitude * (Math.PI / 180);
    const h =
      Math.sin(dLat / 2) ** 2 +
      Math.cos(lat1) * Math.cos(lat2) * Math.sin(dLon / 2) ** 2;
    return R * 2 * Math.atan2(Math.sqrt(h), Math.sqrt(1 - h));
  }
}
