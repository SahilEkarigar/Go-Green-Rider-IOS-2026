import { Component, AfterViewInit, OnDestroy } from '@angular/core';
import { IonicModule } from '@ionic/angular';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { Geolocation } from '@capacitor/geolocation';
import { AuthserviceService } from '../services/authservice.service';
import { SocketService } from '../services/socket.service';
import { Storage } from '@ionic/storage-angular';
import { environment } from 'environments/environment';

declare var google: any;

@Component({
  selector: 'app-store-details',
  templateUrl: './store-details.page.html',
  styleUrls: ['./store-details.page.scss'],
  standalone: true,
  imports: [IonicModule, CommonModule],
})
export class StoreDetailsPage implements AfterViewInit, OnDestroy {

  // ------------------------
  // HTML BOUND VARIABLES
  // ------------------------
  order: any;
  riderId: string = '';
  orderId: string = '';

  pickupButtonText: string = 'Reached Pickup';
  headerText: string = 'Your Way To Vendor';
  hideButton: boolean = false;

  otp: string = '';
  otpDigits: string[] = [];

  // ------------------------
  // MAP
  // ------------------------
  map: any;
  directionsService: any;
  directionsRenderer: any;

  riderMarker: any;
  vendorMarker: any;
  customerMarker: any;

  riderPos!: google.maps.LatLngLiteral;
  vendorTarget!: google.maps.LatLngLiteral;
  customerTarget!: google.maps.LatLngLiteral;
  currentTarget: google.maps.LatLngLiteral | null = null;

  // ------------------------
  // TRACKING
  // ------------------------
  watchId: any;
  // otpSub: any;

  isAutoFollow = true;
  routePath: { lat: number; lng: number }[] = [];


  lastSnappedTime = 0;
  lastPosition: google.maps.LatLngLiteral | null = null;

  // Route throttling
  lastRouteUpdatePos: google.maps.LatLngLiteral | null = null;
  lastRouteUpdateTime = 0;
  lastHeading: number = 0;

  isMapLoading = true;

  mapReady = false;
  gpsReady = false;

  private readonly GOOGLE_API_KEY = environment.googleMapsApiKey;
  private otpSub: any = null;
  private otpVerifiedSub: any = null;

  constructor(
    private router: Router,
    private authService: AuthserviceService,
    private socketService: SocketService,
    private storage: Storage
  ) { }

  // ------------------------
  // INIT
  // ------------------------
  async ngAfterViewInit() {
    await this.storage.create();

    this.riderId = localStorage.getItem('user_id') || '';

    if (history.state?.order) {
      console.log('order-Data:-', history.state.order)
      this.order = history.state.order;
      this.orderId = this.order.order_id;
      this.getCoordinates(this.orderId);
    } else {
      this.router.navigate(['/home']);
    }
  }

  // ------------------------
  // NAVIGATION
  // ------------------------
  navigateToHome() {
    this.router.navigate(['/home']);
  }

  gotochatscreen() {
    this.router.navigate(['/chat-screen'], {
      state: {
        customerName: `${this.order?.firstname} ${this.order?.lastname}`,
        orderId: this.orderId,
        customer_id: this.order?.user_id,
        rider_id: this.riderId,
      },
    });
  }

  initMap() {
    this.isMapLoading = true;

    this.map = new google.maps.Map(
      document.getElementById('map')!,
      {
        zoom: 15,
        center: { lat: 0, lng: 0 }, // temporary, real center = rider
        disableDefaultUI: true,
      }
    );

    google.maps.event.addListenerOnce(this.map, 'tilesloaded', () => {
      this.mapReady = true;
      this.hideLoaderIfReady();
    });

    this.directionsService = new google.maps.DirectionsService();
    this.directionsRenderer = new google.maps.DirectionsRenderer({
      suppressMarkers: true,
      preserveViewport: true,
    });

    this.directionsRenderer.setMap(this.map);

    // Vendor marker (Default Icon)
    this.vendorMarker = new google.maps.Marker({
      map: this.map,
      position: this.vendorTarget,
    });

    this.startTrackingRider();
  }

  drawRoute(origin: google.maps.LatLngLiteral, destination: google.maps.LatLngLiteral) {
    this.directionsService.route(
      {
        origin,
        destination, // Use the passed destination
        travelMode: google.maps.TravelMode.DRIVING,
      },
      (result: any, status: any) => {
        if (status === 'OK') {
          this.directionsRenderer.setDirections(result);
        }
      }
    );
  }


  startTrackingRider() {
    this.watchId = Geolocation.watchPosition(
      { enableHighAccuracy: true, timeout: 1000 },
      async (pos) => {
        if (!pos) return;

        const now = Date.now();
        const rawLatLng = {
          lat: pos.coords.latitude,
          lng: pos.coords.longitude,
        };

        let finalLatLng = rawLatLng;

        // SNAP TO ROAD
        if (now - this.lastSnappedTime > 4000) {
          const snapped = await this.snapToRoad(rawLatLng.lat, rawLatLng.lng);
          finalLatLng = {
            lat: snapped.latitude,
            lng: snapped.longitude,
          };
          this.lastSnappedTime = now;
        }

        // CALCULATE DISTANCE MOVED
        let distFromLast = 0;
        if (this.lastPosition) {
          distFromLast = this.getDistanceFromLatLonInKm(
            finalLatLng.lat, finalLatLng.lng,
            this.lastPosition.lat, this.lastPosition.lng
          ) * 1000; // in meters
        }

        // CALCULATE HEADING (Conditional)
        // Only update heading if we have significant movement or speed
        const speed = pos.coords.speed; // meters per second, might be null
        const isMoving = (speed && speed > 0.5) || (distFromLast > 2); // 2 meters threshold if no speed

        if (this.lastPosition && isMoving) {
          this.lastHeading = this.getBearing(this.lastPosition, finalLatLng);
        }

        // Set initial target if not set (Default to Vendor)
        if (!this.currentTarget) {
          this.currentTarget = this.vendorTarget;
        }

        if (!this.riderMarker) {
          this.gpsReady = true;
          this.hideLoaderIfReady();
          this.map.setCenter(finalLatLng);
          this.map.setZoom(17);

          this.riderMarker = new google.maps.Marker({
            map: this.map,
            position: finalLatLng,
            icon: {
              path: google.maps.SymbolPath.FORWARD_CLOSED_ARROW,
              scale: 6,
              fillColor: "#4285F4", // Google Blue
              fillOpacity: 1,
              strokeColor: "white",
              strokeWeight: 2,
              rotation: this.lastHeading, // ✅ Use stable heading
              anchor: new google.maps.Point(0, 2.5) // Adjust anchor to center rotation
            },
          });
        } else {
          this.riderMarker.setPosition(finalLatLng);
          // Update icon with new rotation
          const icon = this.riderMarker.getIcon();
          if (icon) {
            icon.rotation = this.lastHeading;
            this.riderMarker.setIcon(icon);
          }
        }

        // UPDATED: Throttled route drawing
        // Only redraw if:
        // 1. Destination changed (handled by checking currentTarget vs lastTarget - simplified here by forcing on event)
        // 2. Moved significantly (> 20 meters)
        // 3. Time elapsed (> 10 seconds)

        const dist = this.getDistanceFromLatLonInKm(
          finalLatLng.lat, finalLatLng.lng,
          this.lastRouteUpdatePos?.lat || 0, this.lastRouteUpdatePos?.lng || 0
        ) * 1000; // convert to meters

        const timeDiff = now - this.lastRouteUpdateTime;

        if (this.currentTarget && (dist > 30 || timeDiff > 10000 || !this.lastRouteUpdatePos)) {
          console.log('🗺️ Redrawing route...', { dist, timeDiff });
          this.drawRoute(finalLatLng, this.currentTarget);
          this.lastRouteUpdatePos = finalLatLng;
          this.lastRouteUpdateTime = now;
        }

        // ✅ Auto-center map on rider
        if (this.map) {
          this.map.panTo(finalLatLng);
        }

        this.lastPosition = finalLatLng;
      }
    );
  }

  // Helper for distance calculation
  getDistanceFromLatLonInKm(lat1: number, lon1: number, lat2: number, lon2: number) {
    const R = 6371; // Radius of the earth in km
    const dLat = this.deg2rad(lat2 - lat1);
    const dLon = this.deg2rad(lon2 - lon1);
    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos(this.deg2rad(lat1)) * Math.cos(this.deg2rad(lat2)) *
      Math.sin(dLon / 2) * Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    const d = R * c; // Distance in km
    return d;
  }

  deg2rad(deg: number) {
    return deg * (Math.PI / 180);
  }

  hideLoaderIfReady() {
    if (this.mapReady && this.gpsReady) {
      requestAnimationFrame(() => {
        this.isMapLoading = false;
      });
    }
  }

  getBearing(from: google.maps.LatLngLiteral, to: google.maps.LatLngLiteral) {
    const lat1 = from.lat * Math.PI / 180;
    const lat2 = to.lat * Math.PI / 180;
    const dLng = (to.lng - from.lng) * Math.PI / 180;

    const y = Math.sin(dLng) * Math.cos(lat2);
    const x =
      Math.cos(lat1) * Math.sin(lat2) -
      Math.sin(lat1) * Math.cos(lat2) * Math.cos(dLng);

    return (Math.atan2(y, x) * 180 / Math.PI + 360) % 360;
  }


  async snapToRoad(lat: number, lng: number) {
    const url =
      `https://roads.googleapis.com/v1/snapToRoads?` +
      `path=${lat},${lng}&interpolate=false&key=${this.GOOGLE_API_KEY}`;

    const res = await fetch(url);
    const data = await res.json();

    return data.snappedPoints?.[0]?.location || { latitude: lat, longitude: lng };
  }

  // ------------------------
  // GET COORDINATES
  // ------------------------
  getCoordinates(orderId: string) {
    this.authService.getCordinatesofOrder(orderId).subscribe((res: any) => {
      if (!res?.data) return;

      this.vendorTarget = {
        lat: +res.data.vendor_lat,
        lng: +res.data.vendor_lng,
      };

      this.customerTarget = {
        lat: +res.data.customer_lat,
        lng: +res.data.customer_lng,
      };
      console.log('Vendor cordinates: ', this.vendorTarget)
      console.log('Customer cordinates: ', this.customerTarget)
      setTimeout(() => this.initMap(), 300);

    });
  }


  async reachedPickup(orderId: string) {
    this.orderId = orderId;
    this.socketService.joinOrderRoom(orderId);
    console.log('order-id: ', orderId)
    console.log('this.otpSub: ', this.otpSub)

    // ✅ Listen for OTP generated
    if (!this.otpSub) {
      this.otpSub = this.socketService.listenToOtp(orderId).subscribe({
        next: (otpData) => {
          console.log("OTP received:", otpData.otp);
          this.otp = otpData.otp.toString();
          this.otpDigits = this.otp.split('');
          this.pickupButtonText = 'Send OTP Again';
        }
      });
    }

    // ✅ Listen for OTP verified
    if (!this.otpVerifiedSub) {
      this.otpVerifiedSub = this.socketService.listenToOtpVerified(orderId).subscribe({
        next: (data) => {
          console.log("OTP Verified Event:", data);

          // Clear OTP UI
          this.otp = '';
          this.otpDigits = [];
          this.onOtpVerified();

          // Use toggleSimulation functionality to start the ride
          const mockEvent = new Event('click');

        }
      });
    }

    const body = { orderId, riderId: this.riderId, status: 3 };
    try {
      (await this.authService.handleOrderByRider(body)).subscribe({
        next: (res: any) => console.log("Order handled successfully:", res),
        error: (err: any) => console.error("Error handling order:", err)
      });
    } catch (err) {
      console.error(err);
    }
  }

  onOtpVerified() {
    console.log("OTP Verified - Switching path to Customer");

    // 1. Change the target to Customer
    this.currentTarget = this.customerTarget;

    // 2. Remove the vendor marker if you want
    if (this.vendorMarker) {
      this.vendorMarker.setMap(null);
    }

    // 3. Add the customer marker (Default Icon)
    this.customerMarker = new google.maps.Marker({
      map: this.map,
      position: this.customerTarget,
    });

    this.headerText = 'Your Way To Customer';

    // 4. Force an immediate route redraw
    // Reset throttle variables so the next tracking update forces a draw,
    // or draw immediately if we have a position.
    this.lastRouteUpdateTime = 0;
    this.lastRouteUpdatePos = null;

    if (this.lastPosition && this.currentTarget) {
      this.drawRoute(this.lastPosition, this.currentTarget);
    }

    this.pickupButtonText = 'Order Delivered';
  }

  // ------------------------
  // DELIVERY & EXTERNAL NAV
  // ------------------------

  openGoogleMaps() {
    if (!this.vendorTarget && !this.customerTarget) return;

    let target = this.vendorTarget;
    if (this.pickupButtonText === 'Order Delivered' || this.headerText.includes('Customer')) {
      target = this.customerTarget;
    }

    if (target) {
      const url = `https://www.google.com/maps/dir/?api=1&destination=${target.lat},${target.lng}&travelmode=driving`;
      window.open(url, '_system');
    }
  }

  async deliverOrder(orderId: string | undefined) {
    if (!orderId) {
      console.error('deliverOrder called without orderId');
      return;
    }

    // Stop location tracking when order is delivered
    this.stopLocationTracking();

    const body = { orderId, riderId: this.riderId, status: 4 };
    try {
      (await this.authService.handleOrderByRider(body)).subscribe({
        next: (res: any) => {
          console.log('Order marked delivered:', res);
          this.pickupButtonText = '';

          // ✅ Show alert
          alert('Order completed successfully!');

          // ✅ Navigate to home after success
          this.router.navigate(['/home']);
        },
        error: (err: any) => {
          console.error('Failed to mark order delivered:', err);
        }
      });
    } catch (err) {
      console.error(err);
    }
  }

  stopLocationTracking() {
    if (this.watchId) {
      Geolocation.clearWatch({ id: this.watchId });
      this.watchId = null;
    }
  }

  // ------------------------
  // CLEANUP
  // ------------------------
  ngOnDestroy() {
    this.stopLocationTracking();

    // Clean up subscriptions
    if (this.otpSub) {
      this.otpSub.unsubscribe();
    }
    if (this.otpVerifiedSub) {
      this.otpVerifiedSub.unsubscribe();
    }
  }
}
