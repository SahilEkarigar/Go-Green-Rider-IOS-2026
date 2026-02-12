import { Component, OnInit } from '@angular/core';
import { IonicModule, LoadingController, ModalController } from '@ionic/angular';
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

// ✅ Import Ionicons
import { chevronUpOutline, chevronDownOutline } from 'ionicons/icons';
import { addIcons } from 'ionicons';

@Component({
  selector: 'app-home',
  templateUrl: './home.page.html',
  styleUrls: ['./home.page.scss'],
  standalone: true,
  imports: [IonicModule, FormsModule, CommonModule, FooterTabsComponent],
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
    [orderId: string]: { customer: boolean; store: boolean } | undefined
  } = {};

  loading: HTMLIonLoadingElement | null = null; // ✅ Store loading reference

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
          this.isActive = this.user.data.status === 1;
        }
      });

    // Listen for new accepted orders
    this.orderStateService.acceptedOrder$.subscribe(order => {
      if (order) {
        this.receivedOrders = [order, ...this.receivedOrders];
        this.selectedTab = 'receive';
      }
    });

    // Add manual refresh subscription or handler if needed, but ion-refresher uses the event binding.
  }

  async loadData(event?: any) {
    // Only show loader if it's NOT a refresher event
    if (!event) {
      await this.showLoading();
    }

    this.authservice.getReceivedOrders(this.user_id).subscribe({
      next: async (orders: any[]) => {
        // console.log("order is",orders)
        this.receivedOrders = orders.filter(o => o.rider_status === 2 || o.rider_status === 3);
        this.completedOrders = orders.filter(o => o.rider_status === 4);

        if (event) {
          event.target.complete();
        } else {
          await this.hideLoading();
        }
      },
      error: async err => {
        console.error('Error fetching orders', err);
        if (event) {
          event.target.complete();
        } else {
          await this.hideLoading();
        }
      },
    });
  }

  async handleRefresh(event: any) {
    this.loadData(event);
    await this.userService.refreshUserData();
  }

  // ✅ Centralized loader functions
  private async showLoading() {
    if (!this.loading) {
      this.loading = await this.loadingCtrl.create({
        message: 'Please wait...',
        spinner: 'bubbles',
        duration: 3000 // ✅ Auto dismiss after 3 seconds
      });
      await this.loading.present();
    }
  }

  private async hideLoading() {
    if (this.loading) {
      await this.loading.dismiss();
      this.loading = null; // reset so new loader can be created later
    }
  }

  // Header scroll effect
  onScroll(event: any) {
    const scrollTop = event.detail.scrollTop;
    this.isScrolled = scrollTop > 10;
  }

  // Switch tabs
  selectTab(tab: 'receive' | 'completed') {
    this.selectedTab = tab;
  }

  async setStatus(status: boolean) {
    this.isActive = status; // update UI immediately

    // Create payload
    const payload = {
      status: status,
      user_id: this.user_id,
      role_id: 4
    };

    this.authservice.updateStatusPayload(payload).subscribe({
      next: res => console.log('Status updated successfully:', res),
      error: err => {
        console.error('Failed to update status:', err);
        this.isActive = !status; // revert if API fails
      }
    });
  }

  navigateStoreDetails(order: any) {
    console.log('order details transfer to another paeg:', order)
    this.router.navigate(['/store-details'], { state: { order } });
  }

  // Order Accepted Modal (for buzzer)
  // async openOrderAcceptedModal() {
  //   const modal = await this.modalCtrl.create({
  //     component: OrderAcceptedComponent,
  //     componentProps: {
  //       orderId: '123456',
  //       username: 'Deepti',
  //       address: 'Mumbai',
  //       orderItems: [
  //         { name: 'Item A', qty: 2 },
  //         { name: 'Item B', qty: 1 },
  //       ],
  //     },
  //   });
  //   await modal.present();
  // }

  toggleSection(orderId: string, section: 'customer' | 'store') {
    if (!this.orderExpanded[orderId]) {
      this.orderExpanded[orderId] = { customer: false, store: false };
    }
    this.orderExpanded[orderId][section] = !this.orderExpanded[orderId][section];
  }

  // Test notification flow
  // testNewOrder() {
  //   const dummyData = {
  //     type: 'new_order',
  //     order_id: '199',
  //     vendor_id: '55',
  //     rider_to_vendor_distance_km: 2.5,
  //     vendor_to_customer_distance_km: 5.2,
  //   };
  //   this.appComponent.handleNewOrderNotification(dummyData);
  // }
}
