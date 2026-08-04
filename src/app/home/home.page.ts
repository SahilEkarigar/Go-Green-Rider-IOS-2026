import { Component, OnInit } from '@angular/core';
import {
  IonicModule,
  LoadingController,
  ModalController
} from '@ionic/angular';

import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { Storage } from '@ionic/storage-angular';
import { filter } from 'rxjs';

import { FooterTabsComponent } from '../components/footer-tabs/footer-tabs.component';
import { AuthserviceService } from '../services/authservice.service';
import { AppComponent } from '../app.component';
import { OrderStateService } from '../services/order-state';
import { UserService } from '../services/user.service';
import { OrderAcceptedComponent } from '../components/order-accepted/order-accepted.component';

import {
  chevronUpOutline,
  chevronDownOutline
} from 'ionicons/icons';

import { addIcons } from 'ionicons';

@Component({
  selector: 'app-home',
  templateUrl: './home.page.html',
  styleUrls: ['./home.page.scss'],
  standalone: true,
  imports: [
    IonicModule,
    FormsModule,
    CommonModule,
    FooterTabsComponent
  ],
})
export class HomePage implements OnInit {

  isActive = false;
  isScrolled = false;

  selectedTab: 'receive' | 'completed' = 'receive';

  user: any = '';
  user_id: any;

  receivedOrders: any[] = [];
  completedOrders: any[] = [];

  orderExpanded: {
    [orderId: string]:
    { [section: string]: boolean } | undefined
  } = {};

  loading: HTMLIonLoadingElement | null = null;

  private readonly refreshTimeout = 10000;

  constructor(
    private router: Router,
    private storage: Storage,
    private userService: UserService,
    private loadingCtrl: LoadingController,
    private modalCtrl: ModalController,
    private authservice: AuthserviceService,
    private appComponent: AppComponent,
    private orderStateService: OrderStateService
  ) {
    addIcons({
      'chevron-up-outline': chevronUpOutline,
      'chevron-down-outline': chevronDownOutline,
    });
  }

  async ngOnInit() {
    await this.storage.create();

    this.user_id = await this.storage.get('user_id');

    // Load initial orders
    await this.loadData();

    // Subscribe to user updates
    this.userService.user$
      .pipe(filter(user => !!user))
      .subscribe(user => {
        this.user = user;

        if (this.user?.data?.status !== undefined) {
          this.isActive =
            Number(this.user.data.status) === 1;
        }
      });

    // Listen for new accepted orders
    this.orderStateService.acceptedOrder$
      .subscribe(order => {
        if (order) {
          this.receivedOrders = [
            order,
            ...this.receivedOrders
          ];

          this.selectedTab = 'receive';
        }
      });
  }

  /**
   * Load received and completed orders.
   *
   * During a pull-to-refresh event, the normal page loader
   * will not be displayed. The refresher is completed from
   * handleRefresh().
   */
  async loadData(event?: any): Promise<void> {
    if (!event) {
      await this.showLoading();
    }

    return new Promise<void>((resolve) => {
      let requestFinished = false;

      const finishRequest = async () => {
        if (requestFinished) {
          return;
        }

        requestFinished = true;

        clearTimeout(safetyTimeout);

        if (!event) {
          await this.hideLoading();
        }

        resolve();
      };

      /*
       * Safety timeout:
       * Prevents the refresh spinner from remaining active
       * when the request does not respond on a real device.
       */
      const safetyTimeout = setTimeout(async () => {
        console.warn(
          'Orders request timed out. Closing loader.'
        );

        await finishRequest();
      }, this.refreshTimeout);

      this.authservice
        .getReceivedOrders(this.user_id)
        .subscribe({
          next: async (orders: any[]) => {
            const orderList =
              Array.isArray(orders) ? orders : [];

            this.receivedOrders = orderList.filter(
              order =>
                Number(order.rider_status) === 2 ||
                Number(order.rider_status) === 3
            );

            this.completedOrders = orderList.filter(
              order =>
                Number(order.rider_status) === 4
            );

            await finishRequest();
          },

          error: async (error: any) => {
            console.error(
              'Error fetching orders:',
              error
            );

            await finishRequest();
          }
        });
    });
  }

  /**
   * Pull-to-refresh handler.
   *
   * The refresher is always completed inside finally,
   * regardless of API success, failure or timeout.
   */
  async handleRefresh(event: any) {
    try {
      await Promise.allSettled([
        this.loadData(event),

        this.promiseWithTimeout(
          Promise.resolve(
            this.userService.refreshUserData()
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
      await this.completeRefresher(event);
    }
  }

  /**
   * Force a promise to finish after the specified time.
   * This prevents refreshUserData() from keeping the
   * pull-to-refresh spinner open indefinitely.
   */
  private promiseWithTimeout<T>(
    promise: Promise<T>,
    timeoutDuration: number
  ): Promise<T | null> {
    return new Promise<T | null>(
      (resolve, reject) => {
        const timer = setTimeout(() => {
          console.warn(
            'User refresh request timed out.'
          );

          resolve(null);
        }, timeoutDuration);

        promise
          .then((result) => {
            clearTimeout(timer);
            resolve(result);
          })
          .catch((error) => {
            clearTimeout(timer);
            reject(error);
          });
      }
    );
  }

  /**
   * Safely close the Ionic refresher.
   */
  private async completeRefresher(
    event: any
  ): Promise<void> {
    try {
      if (
        event?.target &&
        typeof event.target.complete === 'function'
      ) {
        await event.target.complete();
        return;
      }

      /*
       * Fallback for devices where the refresher
       * complete method is available under event.detail.
       */
      if (
        event?.detail &&
        typeof event.detail.complete === 'function'
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

  /**
   * Centralized loading functions.
   */
  private async showLoading() {
    /*
     * Check whether Ionic already has an active loader.
     */
    const activeLoader =
      await this.loadingCtrl.getTop();

    if (activeLoader) {
      this.loading = activeLoader;
      return;
    }

    if (this.loading) {
      return;
    }

    this.loading = await this.loadingCtrl.create({
      message: 'Please wait...',
      spinner: 'bubbles'
    });

    /*
     * Reset the stored loading reference whenever
     * the loader is dismissed.
     */
    this.loading
      .onDidDismiss()
      .then(() => {
        this.loading = null;
      });

    await this.loading.present();
  }

  private async hideLoading() {
    try {
      const activeLoader =
        await this.loadingCtrl.getTop();

      if (activeLoader) {
        await activeLoader.dismiss();
      }
    } catch (error) {
      console.warn(
        'Loader was already dismissed:',
        error
      );
    } finally {
      this.loading = null;
    }
  }

  // Header scroll effect
  onScroll(event: any) {
    const scrollTop =
      event.detail.scrollTop;

    this.isScrolled = scrollTop > 10;
  }

  // Switch tabs
  selectTab(
    tab: 'receive' | 'completed'
  ) {
    this.selectedTab = tab;
  }

  async setStatus(status: boolean) {
    // Update UI immediately
    this.isActive = status;

    const payload = {
      status: status,
      user_id: this.user_id,
      role_id: 4
    };

    this.authservice
      .updateStatusPayload(payload)
      .subscribe({
        next: response => {
          console.log(
            'Status updated successfully:',
            response
          );
        },

        error: error => {
          console.error(
            'Failed to update status:',
            error
          );

          // Revert UI status if API fails
          this.isActive = !status;
        }
      });
  }

  navigateStoreDetails(order: any) {
    console.log(
      'Order details transferred to store page:',
      order
    );

    this.router.navigate(
      ['/store-details'],
      {
        state: {
          order: order
        }
      }
    );
  }

  toggleSection(
    orderId: any,
    section: string
  ) {
    const id = String(orderId);

    if (!this.orderExpanded[id]) {
      this.orderExpanded[id] = {};
    }

    this.orderExpanded[id][section] =
      !this.orderExpanded[id][section];
  }

  isExpanded(
    orderId: any,
    section: string
  ): boolean {
    return !!this.orderExpanded[
      String(orderId)
    ]?.[section];
  }
}

