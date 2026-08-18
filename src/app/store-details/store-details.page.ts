import {
  Component,
  AfterViewInit,
  OnDestroy,
  ViewChild,
  ElementRef
} from '@angular/core';

import { IonicModule } from '@ionic/angular';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';

import { Geolocation } from '@capacitor/geolocation';

import { AuthserviceService } from '../services/authservice.service';
import { SocketService } from '../services/socket.service';

import { Storage } from '@ionic/storage-angular';

import { environment } from 'environments/environment';

import { firstValueFrom } from 'rxjs';


declare var google: any;


@Component({
  selector: 'app-store-details',
  templateUrl: './store-details.page.html',
  styleUrls: ['./store-details.page.scss'],
  standalone: true,
  imports: [
    IonicModule,
    CommonModule,
    FormsModule
  ]
})
export class StoreDetailsPage implements AfterViewInit, OnDestroy {


  /* =====================================================
     OTP INPUT
  ===================================================== */

  @ViewChild('otpMasterInput')
  otpMasterInput?: ElementRef<HTMLInputElement>;


  /* =====================================================
     ORDER
  ===================================================== */

  order: any;

  riderId: string = '';

  orderId: string = '';

  pickupButtonText: string = 'Reached Pickup';

  headerText: string = 'Your Way To Vendor';

  hideButton: boolean = false;

  isOrderDetailsExpanded: boolean = true;


  /* =====================================================
     VENDOR OTP
  ===================================================== */

  otp: string = '';

  otpDigits: string[] = [];


  /* =====================================================
     CUSTOMER OTP
  ===================================================== */

  otpIndexes: number[] = [
    0,
    1,
    2,
    3,
    4,
    5
  ];


  /*
   * IMPORTANT:
   *
   * Only one string is used for the full OTP.
   *
   * Example:
   * customerOtp = "458921"
   */
  customerOtp: string = '';


  otpErrorMessage: string = '';

  isVerifyingOtp: boolean = false;

  isOtpFocused: boolean = false;


  /* =====================================================
     MAP
  ===================================================== */

  map: any;

  directionsService: any;

  directionsRenderer: any;


  riderMarker: any;

  vendorMarker: any;

  customerMarker: any;


  vendorTarget!: google.maps.LatLngLiteral;

  customerTarget!: google.maps.LatLngLiteral;


  currentTarget:
    google.maps.LatLngLiteral | null = null;


  /* =====================================================
     LOCATION TRACKING
  ===================================================== */

  watchId: any = null;

  lastSnappedTime: number = 0;

  lastPosition:
    google.maps.LatLngLiteral | null = null;


  lastRouteUpdatePos:
    google.maps.LatLngLiteral | null = null;

  lastRouteUpdateTime: number = 0;

  lastHeading: number = 0;


  /* =====================================================
     MAP
  ===================================================== */

  isMapLoading: boolean = true;

  mapReady: boolean = false;


  /* =====================================================
     SOCKET
  ===================================================== */

  private otpSub: any = null;

  private otpVerifiedSub: any = null;


  /* =====================================================
     GOOGLE API
  ===================================================== */

  private readonly GOOGLE_API_KEY =
    environment.googleMapsApiKey;



  constructor(
    private router: Router,
    private authService: AuthserviceService,
    private socketService: SocketService,
    private storage: Storage
  ) {}


  /* =====================================================
     CUSTOMER DELIVERY STAGE
  ===================================================== */

  get isCustomerDeliveryStage(): boolean {

    return (
      this.headerText.includes('Customer') ||
      this.pickupButtonText === 'Order Delivered'
    );

  }



  /* =====================================================
     CHECK OTP COMPLETE
  ===================================================== */

  get isOtpComplete(): boolean {

    return /^[0-9]{6}$/.test(
      this.customerOtp
    );

  }



  /* =====================================================
     ACTIVE OTP BOX
  ===================================================== */

  isOtpBoxActive(
    index: number
  ): boolean {

    if (!this.isOtpFocused) {

      return false;

    }


    /*
     * User has entered all six digits.
     * Keep last box active.
     */
    if (
      this.customerOtp.length >= 6
    ) {

      return index === 5;

    }


    return (
      index === this.customerOtp.length
    );

  }



  /* =====================================================
     INITIALIZE
  ===================================================== */

  async ngAfterViewInit() {

    await this.storage.create();


    this.riderId =
      localStorage.getItem('user_id') || '';


    if (!history.state?.order) {

      this.router.navigate([
        '/home'
      ]);

      return;

    }


    this.order =
      history.state.order;


    this.orderId =
      this.order?.order_id?.toString() || '';


    console.log(
      'Order Data:',
      this.order
    );


    /*
     * Rider already travelling to customer.
     */
    if (
      Number(this.order?.order_status) === 2 &&
      Number(this.order?.rider_status) === 3
    ) {

      this.headerText =
        'Your Way To Customer';


      this.pickupButtonText =
        'Order Delivered';

    }


    if (this.orderId) {

      this.getCoordinates(
        this.orderId
      );

    }

  }



  /* =====================================================
     NAVIGATION
  ===================================================== */

  navigateToHome() {

    this.router.navigate([
      '/home'
    ]);

  }



  gotochatscreen() {

    this.router.navigate(
      ['/chat-screen'],
      {

        state: {

          customerName:
            `${this.order?.firstname || ''} ${this.order?.lastname || ''}`.trim(),

          orderId:
            this.orderId,

          customer_id:
            this.order?.user_id,

          rider_id:
            this.riderId

        }

      }
    );

  }



  toggleOrderDetails() {

    this.isOrderDetailsExpanded =
      !this.isOrderDetailsExpanded;

  }



  /* =====================================================
     INITIALIZE MAP
  ===================================================== */

  initMap() {

    this.isMapLoading = true;


    const initialCenter =
      this.currentTarget ||
      this.vendorTarget ||
      {
        lat: 0,
        lng: 0
      };


    this.map =
      new google.maps.Map(
        document.getElementById('map')!,
        {

          zoom: 15,

          center: initialCenter,

          disableDefaultUI: true

        }
      );


    this.mapReady = true;

    this.isMapLoading = false;


    this.directionsService =
      new google.maps.DirectionsService();


    this.directionsRenderer =
      new google.maps.DirectionsRenderer({

        suppressMarkers: true,

        preserveViewport: true

      });


    this.directionsRenderer.setMap(
      this.map
    );


    /*
     * Already travelling to customer.
     */
    if (
      Number(this.order?.order_status) === 2 &&
      Number(this.order?.rider_status) === 3
    ) {

      this.currentTarget =
        this.customerTarget;


      this.customerMarker =
        new google.maps.Marker({

          map:
            this.map,

          position:
            this.customerTarget

        });

    }

    else {

      this.currentTarget =
        this.vendorTarget;


      this.vendorMarker =
        new google.maps.Marker({

          map:
            this.map,

          position:
            this.vendorTarget

        });

    }


    this.startTrackingRider();

  }



  /* =====================================================
     DRAW ROUTE
  ===================================================== */

  drawRoute(
    origin: google.maps.LatLngLiteral,
    destination: google.maps.LatLngLiteral
  ) {

    if (
      !this.directionsService ||
      !destination
    ) {

      return;

    }


    this.directionsService.route(

      {

        origin,

        destination,

        travelMode:
          google.maps.TravelMode.DRIVING

      },

      (
        result: any,
        status: any
      ) => {

        if (status === 'OK') {

          this.directionsRenderer
            .setDirections(result);

        }

      }

    );

  }



  /* =====================================================
     TRACK RIDER
  ===================================================== */

  startTrackingRider() {

    this.watchId =
      Geolocation.watchPosition(

        {

          enableHighAccuracy:
            true,

          timeout:
            1000

        },

        async (pos) => {

          if (!pos) {

            return;

          }


          const now =
            Date.now();


          const finalLatLng = {

            lat:
              pos.coords.latitude,

            lng:
              pos.coords.longitude

          };


          /* =================================================
             SNAP TO ROAD
          ================================================= */

          if (
            now -
            this.lastSnappedTime >
            4000
          ) {

            this.snapToRoad(
              finalLatLng.lat,
              finalLatLng.lng
            )
              .then(snapped => {

                if (!snapped) {

                  return;

                }


                this.lastPosition = {

                  lat:
                    snapped.latitude,

                  lng:
                    snapped.longitude

                };

              })
              .catch(() => {});


            this.lastSnappedTime =
              now;

          }


          /* =================================================
             DISTANCE
          ================================================= */

          let distanceFromLast =
            0;


          if (this.lastPosition) {

            distanceFromLast =
              this.getDistanceFromLatLonInKm(

                finalLatLng.lat,

                finalLatLng.lng,

                this.lastPosition.lat,

                this.lastPosition.lng

              ) * 1000;

          }


          /* =================================================
             HEADING
          ================================================= */

          const speed =
            pos.coords.speed;


          const isMoving =
            (
              speed !== null &&
              speed > 0.5
            )
            ||
            distanceFromLast > 2;


          if (
            this.lastPosition &&
            isMoving
          ) {

            this.lastHeading =
              this.getBearing(

                this.lastPosition,

                finalLatLng

              );

          }


          if (!this.currentTarget) {

            this.currentTarget =
              this.vendorTarget;

          }


          /* =================================================
             RIDER MARKER
          ================================================= */

          if (!this.riderMarker) {

            this.map.setCenter(
              finalLatLng
            );


            this.map.setZoom(17);


            this.riderMarker =
              new google.maps.Marker({

                map:
                  this.map,

                position:
                  finalLatLng,

                icon: {

                  path:
                    google.maps.SymbolPath
                      .FORWARD_CLOSED_ARROW,

                  scale:
                    6,

                  fillColor:
                    '#4285F4',

                  fillOpacity:
                    1,

                  strokeColor:
                    '#ffffff',

                  strokeWeight:
                    2,

                  rotation:
                    this.lastHeading,

                  anchor:
                    new google.maps.Point(
                      0,
                      2.5
                    )

                }

              });

          }

          else {

            this.riderMarker
              .setPosition(
                finalLatLng
              );


            const icon =
              this.riderMarker.getIcon();


            if (icon) {

              icon.rotation =
                this.lastHeading;


              this.riderMarker
                .setIcon(icon);

            }

          }


          /* =================================================
             ROUTE UPDATE
          ================================================= */

          let routeDistance =
            0;


          if (this.lastRouteUpdatePos) {

            routeDistance =
              this.getDistanceFromLatLonInKm(

                finalLatLng.lat,

                finalLatLng.lng,

                this.lastRouteUpdatePos.lat,

                this.lastRouteUpdatePos.lng

              ) * 1000;

          }


          const timeDifference =
            now -
            this.lastRouteUpdateTime;


          if (
            this.currentTarget &&
            (
              !this.lastRouteUpdatePos ||
              routeDistance > 30 ||
              timeDifference > 10000
            )
          ) {

            this.drawRoute(

              finalLatLng,

              this.currentTarget

            );


            this.lastRouteUpdatePos =
              finalLatLng;


            this.lastRouteUpdateTime =
              now;

          }


          /*
           * Follow rider
           */
          if (this.map) {

            this.map.panTo(
              finalLatLng
            );

          }


          this.lastPosition =
            finalLatLng;

        }

      );

  }



  /* =====================================================
     DISTANCE
  ===================================================== */

  getDistanceFromLatLonInKm(
    lat1: number,
    lon1: number,
    lat2: number,
    lon2: number
  ): number {

    const R =
      6371;


    const dLat =
      this.deg2rad(
        lat2 - lat1
      );


    const dLon =
      this.deg2rad(
        lon2 - lon1
      );


    const a =

      Math.sin(dLat / 2)
      *
      Math.sin(dLat / 2)

      +

      Math.cos(
        this.deg2rad(lat1)
      )
      *
      Math.cos(
        this.deg2rad(lat2)
      )
      *
      Math.sin(dLon / 2)
      *
      Math.sin(dLon / 2);


    const c =
      2 *
      Math.atan2(
        Math.sqrt(a),
        Math.sqrt(1 - a)
      );


    return R * c;

  }



  deg2rad(
    deg: number
  ): number {

    return deg *
      (Math.PI / 180);

  }



  /* =====================================================
     GET BEARING
  ===================================================== */

  getBearing(
    from: google.maps.LatLngLiteral,
    to: google.maps.LatLngLiteral
  ): number {

    const lat1 =
      from.lat *
      Math.PI /
      180;


    const lat2 =
      to.lat *
      Math.PI /
      180;


    const dLng =
      (
        to.lng -
        from.lng
      )
      *
      Math.PI /
      180;


    const y =
      Math.sin(dLng) *
      Math.cos(lat2);


    const x =

      Math.cos(lat1)
      *
      Math.sin(lat2)

      -

      Math.sin(lat1)
      *
      Math.cos(lat2)
      *
      Math.cos(dLng);


    return (

      Math.atan2(y, x)
      *
      180
      /
      Math.PI

      +

      360

    ) % 360;

  }



  /* =====================================================
     SNAP TO ROAD
  ===================================================== */

  async snapToRoad(
    lat: number,
    lng: number
  ) {

    const url =

      `https://roads.googleapis.com/v1/snapToRoads` +

      `?path=${lat},${lng}` +

      `&interpolate=false` +

      `&key=${this.GOOGLE_API_KEY}`;


    const response =
      await fetch(url);


    const data =
      await response.json();


    return (

      data?.snappedPoints?.[0]?.location

      ||

      {
        latitude: lat,
        longitude: lng
      }

    );

  }



  /* =====================================================
     GET COORDINATES
  ===================================================== */

  getCoordinates(
    orderId: string
  ) {

    this.authService
      .getCordinatesofOrder(orderId)
      .subscribe({

        next: (res: any) => {

          if (!res?.data) {

            console.error(
              'Coordinates not available'
            );

            this.isMapLoading =
              false;

            return;

          }


          this.vendorTarget = {

            lat:
              Number(
                res.data.vendor_lat
              ),

            lng:
              Number(
                res.data.vendor_lng
              )

          };


          this.customerTarget = {

            lat:
              Number(
                res.data.customer_lat
              ),

            lng:
              Number(
                res.data.customer_lng
              )

          };


          this.initMap();

        },


        error: (error: any) => {

          console.error(
            'Coordinate API Error:',
            error
          );


          this.isMapLoading =
            false;

        }

      });

  }



  /* =====================================================
     REACHED VENDOR
  ===================================================== */

  async reachedPickup(
    orderId: string
  ) {

    if (!orderId) {

      return;

    }


    this.orderId =
      orderId;


    this.socketService
      .joinOrderRoom(
        orderId
      );


    /* =================================================
       LISTEN OTP
    ================================================= */

    if (!this.otpSub) {

      this.otpSub =
        this.socketService
          .listenToOtp(orderId)
          .subscribe({

            next: (otpData: any) => {

              if (!otpData?.otp) {

                return;

              }


              this.otp =
                otpData.otp.toString();


              this.otpDigits =
                this.otp.split('');


              this.pickupButtonText =
                'Send OTP Again';

            }

          });

    }


    /* =================================================
       VENDOR VERIFIED OTP
    ================================================= */

    if (!this.otpVerifiedSub) {

      this.otpVerifiedSub =
        this.socketService
          .listenToOtpVerified(orderId)
          .subscribe({

            next: (data: any) => {

              console.log(
                'Vendor OTP Verified:',
                data
              );


              this.otp =
                '';


              this.otpDigits =
                [];


              this.onOtpVerified();

            }

          });

    }


    /*
     * Rider status 3
     */
    const body = {

      orderId:
        orderId,

      riderId:
        this.riderId,

      status:
        3

    };


    try {

      const request$ =
        await this.authService
          .handleOrderByRider(body);


      const response =
        await firstValueFrom(
          request$
        );


      console.log(
        'Rider status updated to 3:',
        response
      );

    }

    catch (error) {

      console.error(
        'Status update error:',
        error
      );

    }

  }



  /* =====================================================
     SWITCH TO CUSTOMER
  ===================================================== */

  onOtpVerified() {

    this.currentTarget =
      this.customerTarget;


    if (this.vendorMarker) {

      this.vendorMarker
        .setMap(null);


      this.vendorMarker =
        null;

    }


    if (this.customerMarker) {

      this.customerMarker
        .setMap(null);

    }


    this.customerMarker =
      new google.maps.Marker({

        map:
          this.map,

        position:
          this.customerTarget

      });


    this.headerText =
      'Your Way To Customer';


    this.pickupButtonText =
      'Order Delivered';


    if (this.order) {

      this.order.rider_status =
        3;

    }


    this.lastRouteUpdateTime =
      0;


    this.lastRouteUpdatePos =
      null;


    if (
      this.lastPosition &&
      this.currentTarget
    ) {

      this.drawRoute(

        this.lastPosition,

        this.currentTarget

      );

    }

  }



  /* =====================================================
     GOOGLE MAPS
  ===================================================== */

  openGoogleMaps() {

    if (
      !this.vendorTarget &&
      !this.customerTarget
    ) {

      return;

    }


    let target =
      this.vendorTarget;


    if (
      this.isCustomerDeliveryStage
    ) {

      target =
        this.customerTarget;

    }


    if (!target) {

      return;

    }


    const url =

      `https://www.google.com/maps/dir/?api=1` +

      `&destination=${target.lat},${target.lng}` +

      `&travelmode=driving`;


    window.open(
      url,
      '_system'
    );

  }



  /* =====================================================
     CUSTOMER OTP INPUT

     ONLY THIS FUNCTION HANDLES OTP TYPING.
  ===================================================== */

  onOtpInput(
    event: Event
  ) {

    const input =
      event.target as HTMLInputElement;


    /*
     * Get the input value.
     */
    let value =
      input.value || '';


    /*
     * Remove everything except numbers.
     *
     * Example:
     * "12a3-" becomes "123"
     */
    value =
      value.replace(
        /[^0-9]/g,
        ''
      );


    /*
     * Maximum six digits.
     */
    value =
      value.slice(
        0,
        6
      );


    /*
     * Save ONE clean OTP value.
     */
    this.customerOtp =
      value;


    /*
     * Keep actual input synchronized.
     */
    if (
      input.value !== value
    ) {

      input.value =
        value;

    }


    /*
     * Remove error once rider starts
     * changing the OTP.
     */
    if (this.otpErrorMessage) {

      this.otpErrorMessage =
        '';

    }

  }



  /* =====================================================
     OTP FOCUS
  ===================================================== */

  onOtpFocus() {

    this.isOtpFocused =
      true;

  }



  onOtpBlur() {

    this.isOtpFocused =
      false;

  }



  /* =====================================================
     FOCUS OTP PROGRAMMATICALLY
  ===================================================== */

  focusOtp() {

    if (
      this.isVerifyingOtp
    ) {

      return;

    }


    this.otpMasterInput
      ?.nativeElement
      ?.focus();

  }



  /* =====================================================
     RESET CUSTOMER OTP
  ===================================================== */

  resetCustomerOtp() {

    this.customerOtp =
      '';


    this.otpErrorMessage =
      '';


    if (
      this.otpMasterInput?.nativeElement
    ) {

      this.otpMasterInput
        .nativeElement
        .value = '';

    }

  }



  /* =====================================================
     CHECK OTP API SUCCESS
  ===================================================== */

  private isOtpVerificationSuccessful(
    response: any
  ): boolean {

    if (!response) {

      return false;

    }


    /*
     * Standard success response
     */
    if (
      response.success === true ||
      response.success === 1 ||
      response.success === '1'
    ) {

      return true;

    }


    /*
     * Status response
     */
    if (
      response.status === true ||
      response.status === 1 ||
      response.status === '1' ||
      response.status === 200 ||
      response.status === '200' ||
      response.status === 'success'
    ) {

      return true;

    }


    /*
     * Verified flag
     */
    if (
      response.verified === true
    ) {

      return true;

    }


    /*
     * Nested data response
     */
    if (
      response.data?.success === true ||
      response.data?.status === true ||
      response.data?.verified === true
    ) {

      return true;

    }


    return false;

  }



  /* =====================================================
     VERIFY CUSTOMER OTP
  ===================================================== */

  async verifyCustomerOtp() {

    /*
     * Prevent multiple button clicks.
     */
    if (
      this.isVerifyingOtp
    ) {

      return;

    }


    this.otpErrorMessage =
      '';


    /*
     * Final clean OTP.
     */
    const enteredOtp =
      this.customerOtp.trim();


    /*
     * Must be exactly six numbers.
     */
    if (
      !/^[0-9]{6}$/.test(
        enteredOtp
      )
    ) {

      this.otpErrorMessage =
        'Please enter the complete 6-digit OTP.';


      this.focusOtp();


      return;

    }


    if (!this.orderId) {

      this.otpErrorMessage =
        'Order information is missing.';


      return;

    }


    if (!this.riderId) {

      this.otpErrorMessage =
        'Rider information is missing.';


      return;

    }


    this.isVerifyingOtp =
      true;


    const body = {

      order_id:
        this.orderId,

      entered_otp:
        enteredOtp

    };


    console.log(
      'Verifying Customer OTP:',
      body
    );


    try {

      /* =================================================
         STEP 1
         VERIFY CUSTOMER OTP
      ================================================= */

      const verifyRequest$ =
        await this.authService
          .riderVerifyOtpthroughtCustomer(
            body
          );


      const verifyResponse =
        await firstValueFrom(
          verifyRequest$
        );


      console.log(
        'Customer OTP API Response:',
        verifyResponse
      );


      /*
       * Do NOT change rider status unless
       * OTP verification succeeded.
       */
      if (
        !this.isOtpVerificationSuccessful(
          verifyResponse
        )
      ) {

        this.otpErrorMessage =

          verifyResponse?.message

          ||

          verifyResponse?.data?.message

          ||

          'Invalid OTP. Please check the OTP and try again.';


        /*
         * Clear wrong OTP so rider can
         * immediately type again.
         */
        this.resetOtpAfterInvalid();


        return;

      }


      console.log(
        'OTP verified successfully'
      );


      /* =================================================
         STEP 2
         COMPLETE ORDER
      ================================================= */

      await this.completeDeliveryAfterOtp();

    }

    catch (error: any) {

      console.error(
        'OTP Verification Error:',
        error
      );


      this.otpErrorMessage =

        error?.error?.message

        ||

        error?.message

        ||

        'OTP verification failed. Please try again.';

    }

    finally {

      this.isVerifyingOtp =
        false;

    }

  }



  /* =====================================================
     CLEAR INVALID OTP BUT KEEP ERROR
  ===================================================== */

  private resetOtpAfterInvalid() {

    const currentError =
      this.otpErrorMessage;


    this.customerOtp =
      '';


    if (
      this.otpMasterInput?.nativeElement
    ) {

      this.otpMasterInput
        .nativeElement
        .value = '';

    }


    this.otpErrorMessage =
      currentError;


    /*
     * Wait for disabled state to clear
     * before focusing again.
     */
    setTimeout(() => {

      this.focusOtp();

    }, 150);

  }



  /* =====================================================
     COMPLETE DELIVERY AFTER OTP
  ===================================================== */

  private async completeDeliveryAfterOtp() {

    if (!this.orderId) {

      throw new Error(
        'Order ID missing.'
      );

    }


    /*
     * status 4 = delivered
     */
    const body = {

      orderId:
        this.orderId,

      riderId:
        this.riderId,

      status:
        4

    };


    console.log(
      'OTP verified. Updating rider status:',
      body
    );


    /* =================================================
       IMPORTANT:
       RUN handleOrderByRider ONLY AFTER OTP SUCCESS
    ================================================= */

    const request$ =
      await this.authService
        .handleOrderByRider(body);


    const response =
      await firstValueFrom(
        request$
      );


    console.log(
      'handleOrderByRider Response:',
      response
    );


    /*
     * Explicit backend failure.
     */
    if (
      response?.success === false ||
      response?.status === false ||
      response?.status === 0 ||
      response?.status === '0' ||
      response?.status === 'failed' ||
      response?.status === 'error'
    ) {

      throw new Error(

        response?.message

        ||

        'Unable to mark order as delivered.'

      );

    }


    /*
     * Backend delivery update succeeded.
     */
    if (this.order) {

      this.order.rider_status =
        4;

    }


    /*
     * Clear OTP.
     */
    this.resetCustomerOtp();


    /*
     * Hide button.
     */
    this.hideButton =
      true;


    this.pickupButtonText =
      '';


    /*
     * Only stop GPS after backend status
     * has successfully changed.
     */
    this.stopLocationTracking();


    /*
     * Return to rider home.
     */
    this.router.navigate([
      '/home'
    ]);

  }



  /* =====================================================
     STOP TRACKING
  ===================================================== */

  stopLocationTracking() {

    if (!this.watchId) {

      return;

    }


    Geolocation.clearWatch({

      id:
        this.watchId

    });


    this.watchId =
      null;

  }



  /* =====================================================
     PRICING & BREAKDOWN HELPERS
  ===================================================== */

  getItemUnitPrice(item: any): number {
    if (!item) return 0;
    const qty = Number(item.product_quantity ?? item.quantity ?? 1) || 1;
    const price = Number(
      item.product_price ??
      item.single_product_price ??
      item.single_item_price ??
      item.price ??
      0
    );

    if (price > 0) {
      return price;
    }

    const totalItemPrice = Number(item.total_item_price);
    if (!isNaN(totalItemPrice) && totalItemPrice > 0 && qty > 0) {
      return totalItemPrice / qty;
    }

    return 0;
  }

  getItemTotalPrice(item: any): number {
    if (!item) return 0;

    const qty = Number(item.product_quantity ?? item.quantity ?? 1) || 1;
    const unitPrice = Number(
      item.product_price ??
      item.single_product_price ??
      item.single_item_price ??
      item.price ??
      0
    );

    const totalItemPrice = Number(item.total_item_price);

    if (!isNaN(totalItemPrice) && totalItemPrice > 0) {
      if (qty === 1 || totalItemPrice > unitPrice) {
        return totalItemPrice;
      }
    }

    return unitPrice * qty;
  }

  getItemsTotal(order: any): number {
    if (!order) return 0;
    if (order.items && Array.isArray(order.items) && order.items.length > 0) {
      return order.items.reduce((acc: number, item: any) => {
        return acc + this.getItemTotalPrice(item);
      }, 0);
    }
    if (order.subtotal !== undefined && order.subtotal !== null && order.subtotal !== '') {
      return Number(order.subtotal) || 0;
    }
    if (order.total_price !== undefined && order.total_price !== null && order.total_price !== '') {
      return Number(order.total_price) || 0;
    }
    return 0;
  }

  getFastDeliveryCharge(order: any): number {
    if (!order) return 0;
    if (order.fast_delivery_charges !== undefined && order.fast_delivery_charges !== null && order.fast_delivery_charges !== '') {
      return Number(order.fast_delivery_charges) || 0;
    }
    if (order.fast_delivery_charge !== undefined && order.fast_delivery_charge !== null && order.fast_delivery_charge !== '') {
      return Number(order.fast_delivery_charge) || 0;
    }
    if (order.is_fast_delivery || order.fast_delivery) {
      return 3;
    }
    return 0;
  }

  getRiderDeliveryCharge(order: any): number {
    if (!order) return 0;
    const charge =
      order.rider_deliveryCharge ??
      order.rider_delivery_charge ??
      order.delivery_charge ??
      order.delivery_fee;

    if (charge !== undefined && charge !== null && charge !== '') {
      return Number(charge) || 0;
    }
    return 0;
  }

  getTipAmount(order: any): number {
    if (!order) return 0;

    // 1. Check fixed tip_amount first
    const fixedTip = order.tip_amount ?? order.tip;
    if (fixedTip !== undefined && fixedTip !== null && fixedTip !== '' && Number(fixedTip) > 0) {
      return Number(fixedTip);
    }

    // 2. Check tip_percentage if tip_amount is not present
    const tipPct = order.tip_percentage;
    if (tipPct !== undefined && tipPct !== null && tipPct !== '' && Number(tipPct) > 0) {
      const baseTotal = this.getItemsTotal(order);
      return (Number(tipPct) / 100) * baseTotal;
    }

    return 0;
  }

  getOrderTotal(order: any): string {
    if (!order) return '0.00';

    const itemsTotal = this.getItemsTotal(order);
    const fastFee = this.getFastDeliveryCharge(order);
    const riderDeliveryFee = this.getRiderDeliveryCharge(order);
    const tip = this.getTipAmount(order);

    let backendTotal =
      order.grand_total ??
      order.total_amount ??
      order.payable_amount;

    if (backendTotal !== undefined && backendTotal !== null && backendTotal !== '') {
      let totalNum = Number(backendTotal) || 0;
      return totalNum.toFixed(2);
    }

    const grandTotal = itemsTotal + fastFee + riderDeliveryFee + tip;
    return grandTotal.toFixed(2);
  }

  handleProductImageError(event: any) {
    if (event && event.target) {
      event.target.src = '../../assets/home/store-logo.png';
    }
  }

  trackByItem(index: number, item: any): any {
    return item.product_id || item.id || index;
  }



  /* =====================================================
     DESTROY
  ===================================================== */

  ngOnDestroy() {

    this.stopLocationTracking();


    if (this.otpSub) {

      this.otpSub.unsubscribe();

      this.otpSub =
        null;

    }


    if (this.otpVerifiedSub) {

      this.otpVerifiedSub.unsubscribe();

      this.otpVerifiedSub =
        null;

    }

  }

}