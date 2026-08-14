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

        this.user =
          user;


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
          .getReceivedOrders(
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


          console.log(
            'Status updated successfully:',
            response
          );

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

}