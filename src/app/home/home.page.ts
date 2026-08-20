import {
  Component,
  OnDestroy,
  OnInit
} from '@angular/core';

import {
  CommonModule
} from '@angular/common';

import {
  Router
} from '@angular/router';

import {
  IonicModule,
  LoadingController
} from '@ionic/angular';

import {
  Storage
} from '@ionic/storage-angular';

import {
  filter,
  Subject,
  takeUntil
} from 'rxjs';

import {
  FooterTabsComponent
} from '../components/footer-tabs/footer-tabs.component';

import {
  AuthserviceService
} from '../services/authservice.service';

import {
  OrderStateService
} from '../services/order-state';

import {
  UserService
} from '../services/user.service';

import { jwtDecode } from 'jwt-decode';

@Component({
  selector: 'app-home',
  templateUrl: './home.page.html',
  styleUrls: ['./home.page.scss'],
  standalone: true,
  imports: [
    IonicModule,
    CommonModule,
    FooterTabsComponent
  ],
})

export class HomePage implements OnInit, OnDestroy {

  isActive = false;
  isScrolled = false;

  selectedTab:
    'receive' | 'completed' =
    'receive';

  user: any = {
    data: {}
  };

  user_id: any;

  receivedOrders: any[] = [];
  completedOrders: any[] = [];

  orderExpanded: {
    [orderId: string]: {
      [section: string]: boolean;
    } | undefined;
  } = {};

  loading:
    HTMLIonLoadingElement | null =
    null;

  statusUpdating = false;

  private readonly refreshTimeout =
    10000;

  private readonly loaderDelay =
    250;

  private loadingDelayTimer:
    ReturnType<typeof setTimeout> | null =
    null;

  private loaderRequested =
    false;

  private readonly destroy$ =
    new Subject<void>();


  constructor(
    private router: Router,
    private storage: Storage,
    private userService: UserService,
    private loadingCtrl: LoadingController,
    private authservice: AuthserviceService,
    private orderStateService: OrderStateService
  ) {}


  /* =====================================================
     INIT
  ===================================================== */

  async ngOnInit():
    Promise<void> {

    await this.storage.create();

    const user_token = (await this.storage.get('user_token')) || (await this.storage.get('token'));

    if (user_token) {
      try {
        const decoded: any = jwtDecode(user_token);
        console.log('decoded', decoded);

        const isVerified = decoded?.is_verified ?? decoded?.verification_Done;

        if (isVerified !== undefined && Number(isVerified) !== 1) {
          console.log('User is not verified (is_verified = ' + isVerified + '). Redirecting to application-review...');
          this.router.navigate(['application-review']);
          return;
        }
      } catch (e) {
        console.error('Error decoding token in home page:', e);
      }
    } else {
      this.router.navigate(['login']);
      return;
    }

    this.user_id =
      await this.storage.get(
        'user_id'
      );


    /*
     * Subscribe before refreshing/loading page data,
     * allowing the header to update as soon as user data
     * is available.
     */
    this.userService.user$
      .pipe(
        filter(user => !!user),
        takeUntil(this.destroy$)
      )
      .subscribe(user => {

        this.user = user;

        const isVerified = user?.data?.is_verified ?? user?.is_verified;
        if (isVerified !== undefined && Number(isVerified) !== 1) {
          this.router.navigate(['application-review']);
          return;
        }

        if (
          this.user?.data?.status !==
          undefined
        ) {

          this.isActive =
            Number(
              this.user.data.status
            ) === 1;

        }

      });


    /*
     * Accepted orders from the app state.
     */
    this.orderStateService
      .acceptedOrder$
      .pipe(
        takeUntil(this.destroy$)
      )
      .subscribe(order => {

        if (!order) {
          return;
        }


        const orderId =
          String(
            order.order_id ??
            order.order_uid ??
            ''
          );


        /*
         * Prevent duplicate order cards.
         */
        this.receivedOrders =
          this.receivedOrders.filter(
            existingOrder => {

              const existingId =
                String(
                  existingOrder.order_id ??
                  existingOrder.order_uid ??
                  ''
                );


              return (
                !orderId ||
                existingId !== orderId
              );

            }
          ); 

        this.receivedOrders = [
          order,
          ...this.receivedOrders
        ];


        this.selectedTab =
          'receive';

      });


    await this.loadData();

  }


  /* =====================================================
     DESTROY
  ===================================================== */

  ngOnDestroy(): void {

    this.destroy$.next();
    this.destroy$.complete();


    this.loaderRequested =
      false;


    this.cancelLoadingDelay();


    void this.hideLoading();

  }

  /* =====================================================
     LOAD ORDERS
  ===================================================== */

  async loadData(
    event?: any
  ): Promise<void> {

    if (!event) {

      this.scheduleLoading();

    }


    return new Promise<void>(
      resolve => {

        let requestFinished =
          false;


        let safetyTimeout:
          ReturnType<typeof setTimeout>;


        const finishRequest =
          async (): Promise<void> => {

            if (
              requestFinished
            ) {
              return;
            }


            requestFinished =
              true;


            clearTimeout(
              safetyTimeout
            );


            if (!event) {

              this.loaderRequested =
                false;


              this.cancelLoadingDelay();


              await this.hideLoading();

            }


            resolve();

          };


        /*
         * Safety timeout prevents a hanging API from
         * leaving pull-to-refresh or loading UI active.
         */
        safetyTimeout =
          setTimeout(
            async () => {

              console.warn(
                'Orders request timed out.'
              );


              await finishRequest();

            },
            this.refreshTimeout
          );


        this.authservice
          .getTodayOrders(
            this.user_id
          )
          .subscribe({

            next: async (
              orders: any[]
            ) => {

              const orderList =
                Array.isArray(orders)
                  ? orders
                  : [];


              this.receivedOrders =
                orderList.filter(
                  order =>
                    Number(
                      order.rider_status
                    ) === 2 ||
                    Number(
                      order.rider_status
                    ) === 3
                );


              this.completedOrders =
                orderList.filter(
                  order =>
                    Number(
                      order.rider_status
                    ) === 4
                );


              await finishRequest();

            },


            error: async (
              error: any
            ) => {

              console.error(
                'Error fetching orders:',
                error
              );


              await finishRequest();

            }

          });

      }
    );

  }


  /* =====================================================
     REFRESH
  ===================================================== */

  async handleRefresh(
    event: any
  ): Promise<void> {

    try {

      await Promise.allSettled([

        this.loadData(
          event
        ),


        this.promiseWithTimeout(
          Promise.resolve(
            this.userService
              .refreshUserData()
          ),
          this.refreshTimeout
        )

      ]);

    } catch (error) {

      console.error(
        'Refresh error:',
        error
      );

    } finally {

      await this.completeRefresher(
        event
      );

    }

  }


  /* =====================================================
     PROMISE TIMEOUT
  ===================================================== */

  private promiseWithTimeout<T>(
    promise: Promise<T>,
    timeoutDuration: number
  ): Promise<T | null> {

    return new Promise<T | null>(
      (resolve, reject) => {

        const timer =
          setTimeout(() => {

            console.warn(
              'User refresh request timed out.'
            );


            resolve(
              null
            );

          }, timeoutDuration);


        promise
          .then(result => {

            clearTimeout(
              timer
            );


            resolve(
              result
            );

          })
          .catch(error => {

            clearTimeout(
              timer
            );


            reject(
              error
            );

          });

      }
    );

  }


  /* =====================================================
     COMPLETE REFRESHER
  ===================================================== */

  private async completeRefresher(
    event: any
  ): Promise<void> {

    try {

      if (
        event?.target &&
        typeof event.target.complete ===
          'function'
      ) {

        await event.target.complete();

        return;

      }


      if (
        event?.detail &&
        typeof event.detail.complete ===
          'function'
      ) {

        await event.detail.complete();

      }

    } catch (error) {

      console.warn(
        'Unable to complete refresher:',
        error
      );

    }

  }


  /* =====================================================
     DELAYED LOADER
  ===================================================== */

  private scheduleLoading():
    void {

    this.cancelLoadingDelay();


    this.loaderRequested =
      true;


    this.loadingDelayTimer =
      setTimeout(() => {

        this.loadingDelayTimer =
          null;


        void this.showLoading();

      }, this.loaderDelay);

  }


  private cancelLoadingDelay():
    void {

    if (
      this.loadingDelayTimer
    ) {

      clearTimeout(
        this.loadingDelayTimer
      );


      this.loadingDelayTimer =
        null;

    }

  }


  private async showLoading():
    Promise<void> {

    if (
      !this.loaderRequested ||
      this.loading
    ) {

      return;

    }


    try {

      const loader =
        await this.loadingCtrl.create({

          message:
            'Loading orders...',

          spinner:
            'crescent',

          cssClass:
            'home-loading'

        });


      /*
       * API may have completed while Ionic was creating
       * the loader.
       */
      if (
        !this.loaderRequested
      ) {

        return;

      }


      this.loading =
        loader;


      loader
        .onDidDismiss()
        .then(() => {

          if (
            this.loading === loader
          ) {

            this.loading =
              null;

          }

        });


      await loader.present();


      /*
       * Request may finish immediately after present().
       */
      if (
        !this.loaderRequested
      ) {

        await this.hideLoading();

      }

    } catch (error) {

      console.warn(
        'Unable to show loader:',
        error
      );


      this.loading =
        null;

    }

  }


  private async hideLoading():
    Promise<void> {

    const loader =
      this.loading;


    this.loading =
      null;


    if (!loader) {

      return;

    }


    try {

      await loader.dismiss();

    } catch {

      /*
       * Loader may already be dismissed.
       */

    }

  }


  /* =====================================================
     HEADER SCROLL
  ===================================================== */

  onScroll(
    event: any
  ): void {

    const scrollTop =
      Number(
        event?.detail?.scrollTop ||
        0
      );


    this.isScrolled =
      scrollTop > 10;

  }


  /* =====================================================
     TAB
  ===================================================== */

  selectTab(
    tab:
      'receive' | 'completed'
  ): void {

    this.selectedTab =
      tab;

  }


  /* =====================================================
     RIDER STATUS
  ===================================================== */

  setStatus(
    status: boolean
  ): void {

    /*
     * Avoid duplicate requests when the currently
     * selected status is tapped repeatedly.
     */
    if (
      this.statusUpdating ||
      status === this.isActive
    ) {

      return;

    }


    const previousStatus =
      this.isActive;


    this.isActive =
      status;


    this.statusUpdating =
      true;


    const payload = {

      status:
        status,

      user_id:
        this.user_id,

      role_id:
        4

    };


    this.authservice
      .updateStatusPayload(
        payload
      )
      .subscribe({

        next: response => {

          this.statusUpdating =
            false;


          if (
            this.user?.data
          ) {

            this.user.data.status =
              status ? 1 : 0;

          }

        },


        error: error => {

          this.statusUpdating =
            false;


          this.isActive =
            previousStatus;


          console.error(
            'Failed to update status:',
            error
          );

        }

      });

  }


  /* =====================================================
     STORE DETAILS
  ===================================================== */

  navigateStoreDetails(
    order: any
  ): void {

    this.router.navigate(
      ['/store-details'],
      {
        state: {
          order
        }
      }
    );

  }

  goToEditAccount(): void {
    this.router.navigate(['/edit-account']);
  }


  /* =====================================================
     ACCORDION
  ===================================================== */

  toggleSection(
    orderId: any,
    section: string
  ): void {

    const id =
      String(
        orderId
      );


    if (
      !this.orderExpanded[id]
    ) {

      this.orderExpanded[id] =
        {};

    }


    const currentValue =
      !!this.orderExpanded[id]?.[
        section
      ];


    this.orderExpanded[id]![
      section
    ] = !currentValue;

  }


  isExpanded(
    orderId: any,
    section: string
  ): boolean {

    return !!this.orderExpanded[
      String(orderId)
    ]?.[
      section
    ];

  }


  /* =====================================================
     IMAGE FALLBACK
  ===================================================== */

  handleAvatarError(
    event: Event
  ): void {

    const image =
      event.target;


    if (
      image instanceof HTMLImageElement
    ) {

      image.onerror =
        null;


      image.src =
        '../../assets/home/rider_profile.png';

    }

  }


  /* =====================================================
     TRACK BY
  ===================================================== */

  trackByOrderId(
    index: number,
    order: any
  ): any {

    return (
      order?.order_id ??
      order?.order_uid ??
      index
    );

  }


  trackByItem(
    index: number,
    item: any
  ): any {

    return (
      item?.order_item_id ??
      item?.product_id ??
      `${item?.product_name || 'item'}-${index}`
    );

  }


  /* =====================================================
     DATE & STATUS HELPERS
  ===================================================== */

  formatOrderDate(dateInput: any): string {
    if (!dateInput) return '';

    let dStr = String(dateInput).trim();

    if (dStr.includes(' ') && !dStr.includes('T')) {
      dStr = dStr.replace(' ', 'T');
    }

    const date = new Date(dStr);
    if (isNaN(date.getTime())) {
      return String(dateInput);
    }

    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);

    const orderDate = new Date(date.getFullYear(), date.getMonth(), date.getDate());

    const timeString = date.toLocaleTimeString('en-US', {
      hour: 'numeric',
      minute: '2-digit',
      hour12: true
    });

    if (orderDate.getTime() === today.getTime()) {
      return `Today, ${timeString}`;
    } else if (orderDate.getTime() === yesterday.getTime()) {
      return `Yesterday, ${timeString}`;
    } else {
      const day = date.getDate();
      const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
      const month = monthNames[date.getMonth()];
      const year = date.getFullYear();

      if (year === now.getFullYear()) {
        return `${day} ${month}, ${timeString}`;
      }
      return `${day} ${month} ${year}, ${timeString}`;
    }
  }


  getOrderStatus(order: any): 'completed' | 'processing' | 'new' {
    if (!order) return 'new';

    const riderStatus = Number(order.rider_status);
    const orderStatus = Number(order.order_status);
    const statusText = String(order.status || '').toLowerCase();

    if (
      riderStatus === 4 ||
      orderStatus === 3 ||
      orderStatus === 4 ||
      order.is_completed === true ||
      statusText === 'completed' ||
      statusText === 'delivered'
    ) {
      return 'completed';
    }

    if (
      riderStatus === 2 ||
      riderStatus === 3 ||
      orderStatus === 2 ||
      statusText === 'processing' ||
      statusText === 'in_transit' ||
      statusText === 'accepted' ||
      statusText === 'picked_up'
    ) {
      return 'processing';
    }

    return 'new';
  }


  getOrderStatusLabel(order: any): string {
    const status = this.getOrderStatus(order);
    if (status === 'completed') return 'Completed';
    if (status === 'processing') return 'Processing';
    return 'New';
  }


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
    if (Array.isArray(order.items) && order.items.length > 0) {
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


  handleProductImageError(event: Event): void {
    const img = event.target as HTMLImageElement;
    if (img) {
      img.onerror = null;
      img.src = '../../assets/home/store-logo.png';
    }
  }

}