import { Component, OnInit } from '@angular/core';
import { CommonModule, Location } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IonicModule, NavController } from '@ionic/angular';
import { Router } from '@angular/router';
import { Storage } from '@ionic/storage-angular';
import { AuthserviceService } from '../services/authservice.service';
import { FooterTabsComponent } from '../components/footer-tabs/footer-tabs.component';
import { addIcons } from 'ionicons';
import {
  timeOutline,
  searchOutline,
  funnelOutline,
  chevronBackOutline,
  chevronForwardOutline,
  checkmarkCircleOutline,
  closeCircleOutline,
  syncOutline,
  receiptOutline,
  calendarOutline,
  cashOutline,
  storefrontOutline,
  personOutline,
  refreshOutline,
  filterOutline,
  cardOutline,
  bagCheckOutline,
  chevronDownOutline,
  chevronUpOutline,
  alertCircleOutline,
  locationOutline,
  bicycleOutline,
  heartOutline,
  fastFoodOutline,
  bagHandleOutline
} from 'ionicons/icons';

export interface OrderItem {
  id?: string;
  product_id?: string;
  product_name?: string;
  name?: string;
  product_quantity?: number;
  quantity?: number;
  product_price?: number;
  single_product_price?: number;
  single_item_price?: number;
  price?: number;
  total_item_price?: number;
  featured_image?: string;
  product_image?: string;
  image?: string;
  food_type?: string;
}

export interface PastOrder {
  order_id: string;
  id?: string;
  order_uid?: string;
  store_name?: string;
  vendor_name?: string;
  store_address?: string;
  store_image?: string;
  firstname?: string;
  lastname?: string;
  phonenumber?: string;
  delivery_address?: string;
  address?: string;
  grand_total?: number | string;
  total_amount?: number | string;
  total?: number | string;
  payable_amount?: number | string;
  subtotal?: number | string;
  total_price?: number | string;
  fast_delivery_charges?: number | string;
  fast_delivery_charge?: number | string;
  is_fast_delivery?: boolean | number;
  fast_delivery?: boolean | number;
  rider_deliveryCharge?: number | string;
  rider_delivery_charge?: number | string;
  delivery_charge?: number | string;
  delivery_fee?: number | string;
  tip_amount?: number | string;
  tip?: number | string;
  tip_percentage?: number | string;
  payment_method?: string;
  payment_type?: string;
  payment_mode?: string;
  order_payment_status?: number | string;
  payment_status?: number | string;
  is_paid?: number | string;
  rider_status?: number | string;
  order_status?: number | string;
  created_at?: string;
  order_created_at?: string;
  order_date?: string;
  date?: string;
  items?: OrderItem[];
}

@Component({
  selector: 'app-order-history',
  templateUrl: './order-history.page.html',
  styleUrls: ['./order-history.page.scss'],
  standalone: true,
  imports: [IonicModule, CommonModule, FormsModule, FooterTabsComponent]
})
export class OrderHistoryPage implements OnInit {

  orders: PastOrder[] = [];
  filteredOrders: PastOrder[] = [];

  isLoading: boolean = true;
  errorMessage: string = '';
  userId: string = '';

  // Filter States
  searchQuery: string = '';
  selectedStatusFilter: 'all' | 'delivered' | 'active' | 'cancelled' = 'all';
  selectedPaymentFilter: 'all' | 'cod' | 'online' = 'all';
  selectedPeriodFilter: 'all' | 'today' | 'week' | 'month' = 'all';

  // Stats Summary
  totalOrdersCount: number = 0;
  deliveredOrdersCount: number = 0;
  totalVolumeAmount: number = 0;

  defaultStoreImage: string = '../../assets/home/store-logo.png';

  constructor(
    private router: Router,
    private navCtrl: NavController,
    private storage: Storage,
    private authService: AuthserviceService,
    private location: Location
  ) {
    addIcons({
      timeOutline,
      searchOutline,
      funnelOutline,
      chevronBackOutline,
      chevronForwardOutline,
      checkmarkCircleOutline,
      closeCircleOutline,
      syncOutline,
      receiptOutline,
      calendarOutline,
      cashOutline,
      storefrontOutline,
      personOutline,
      refreshOutline,
      filterOutline,
      cardOutline,
      bagCheckOutline,
      chevronDownOutline,
      chevronUpOutline,
      alertCircleOutline,
      locationOutline,
      bicycleOutline,
      heartOutline,
      fastFoodOutline,
      bagHandleOutline
    });
  }

  async ngOnInit(): Promise<void> {
    await this.storage.create();
    await this.initUserIdAndFetchOrders();
  }

  async ionViewWillEnter(): Promise<void> {
    if (this.userId) {
      this.fetchOrders();
    }
  }

  private async initUserIdAndFetchOrders(): Promise<void> {
    try {
      let storedId = await this.storage.get('user_id');
      if (!storedId) {
        storedId = localStorage.getItem('user_id');
      }

      if (storedId) {
        this.userId = String(storedId);
        this.fetchOrders();
      } else {
        this.isLoading = false;
        this.errorMessage = 'Rider user ID not found. Please log in again.';
      }
    } catch (err) {
      console.error('Error initializing user ID:', err);
      this.isLoading = false;
      this.errorMessage = 'Unable to load user session.';
    }
  }

  fetchOrders(refresherEvent?: any): void {
    if (!this.userId) {
      if (refresherEvent) refresherEvent.target.complete();
      return;
    }

    if (!refresherEvent) {
      this.isLoading = true;
    }
    this.errorMessage = '';

    this.authService.getReceivedOrders(this.userId).subscribe({
      next: (response: any) => {
        this.isLoading = false;
        if (refresherEvent) refresherEvent.target.complete();

        const rawList = Array.isArray(response)
          ? response
          : (response?.data && Array.isArray(response.data) ? response.data : []);

        this.orders = rawList;

        this.computeStats();
        this.applyFilters();
      },
      error: (err: any) => {
        console.error('Error fetching order history:', err);
        this.isLoading = false;
        if (refresherEvent) refresherEvent.target.complete();
        this.errorMessage = 'Failed to load order history. Please pull down to refresh.';
      }
    });
  }

  doRefresh(event: any): void {
    this.fetchOrders(event);
  }

  computeStats(): void {
    this.totalOrdersCount = this.orders.length;
    this.deliveredOrdersCount = this.orders.filter(o => this.isDeliveredStatus(o)).length;

    this.totalVolumeAmount = this.orders
      .filter(o => this.isDeliveredStatus(o))
      .reduce((sum, o) => sum + parseFloat(this.getOrderTotal(o)), 0);
  }

  applyFilters(): void {
    let result = [...this.orders];

    // Status Filter
    if (this.selectedStatusFilter === 'delivered') {
      result = result.filter(o => this.isDeliveredStatus(o));
    } else if (this.selectedStatusFilter === 'active') {
      result = result.filter(o => this.isActiveStatus(o));
    } else if (this.selectedStatusFilter === 'cancelled') {
      result = result.filter(o => this.isCancelledStatus(o));
    }

    // Payment Filter
    if (this.selectedPaymentFilter === 'cod') {
      result = result.filter(o => this.isCodOrder(o));
    } else if (this.selectedPaymentFilter === 'online') {
      result = result.filter(o => !this.isCodOrder(o));
    }

    // Period Filter
    if (this.selectedPeriodFilter !== 'all') {
      const now = new Date();
      result = result.filter(o => {
        const date = this.getOrderDateObj(o);
        if (!date) return true;

        if (this.selectedPeriodFilter === 'today') {
          return date.toDateString() === now.toDateString();
        } else if (this.selectedPeriodFilter === 'week') {
          const oneWeekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
          return date >= oneWeekAgo;
        } else if (this.selectedPeriodFilter === 'month') {
          const oneMonthAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
          return date >= oneMonthAgo;
        }
        return true;
      });
    }

    // Search Query
    if (this.searchQuery && this.searchQuery.trim() !== '') {
      const query = this.searchQuery.toLowerCase().trim();
      result = result.filter(o => {
        const orderIdStr = String(o.order_id || o.id || o.order_uid || '').toLowerCase();
        const storeNameStr = String(o.store_name || o.vendor_name || '').toLowerCase();
        const customerNameStr = String(`${o.firstname || ''} ${o.lastname || ''}`).toLowerCase();
        const addressStr = String(o.delivery_address || o.address || '').toLowerCase();

        return (
          orderIdStr.includes(query) ||
          storeNameStr.includes(query) ||
          customerNameStr.includes(query) ||
          addressStr.includes(query)
        );
      });
    }

    this.filteredOrders = result;
  }

  onSearchChange(): void {
    this.applyFilters();
  }

  setStatusFilter(status: 'all' | 'delivered' | 'active' | 'cancelled'): void {
    this.selectedStatusFilter = status;
    this.applyFilters();
  }

  setPaymentFilter(payment: 'all' | 'cod' | 'online'): void {
    this.selectedPaymentFilter = payment;
    this.applyFilters();
  }

  setPeriodFilter(period: 'all' | 'today' | 'week' | 'month'): void {
    this.selectedPeriodFilter = period;
    this.applyFilters();
  }

  goBack(): void {
    this.navCtrl.navigateBack('/setting');
  }

  /* =====================================================
     HELPERS & PRICING (MATCHING HOME PAGE)
  ===================================================== */

  isDeliveredStatus(order: PastOrder): boolean {
    const st = Number(order.rider_status ?? order.order_status);
    if (st === 4) return true;
    const str = String(order.rider_status ?? order.order_status ?? '').toLowerCase();
    return str.includes('deliver') || str.includes('complete') || str.includes('done');
  }

  isCancelledStatus(order: PastOrder): boolean {
    const st = Number(order.rider_status ?? order.order_status);
    if (st === 5 || st === 6) return true;
    const str = String(order.rider_status ?? order.order_status ?? '').toLowerCase();
    return str.includes('cancel') || str.includes('reject');
  }

  isActiveStatus(order: PastOrder): boolean {
    return !this.isDeliveredStatus(order) && !this.isCancelledStatus(order);
  }

  isCodOrder(order: PastOrder): boolean {
    if (Number(order.order_payment_status) === 0) return true;
    const method = String(order.payment_method || order.payment_type || order.payment_mode || '').toUpperCase();
    return method.includes('COD') || method.includes('CASH');
  }

  isOrderPaid(order: PastOrder): boolean {
    if (!this.isCodOrder(order)) return true;
    const paymentStatus = order.order_payment_status ?? order.payment_status ?? order.is_paid;
    if (paymentStatus !== undefined && paymentStatus !== null && paymentStatus !== '') {
      if (Number(paymentStatus) === 1) return true;
      if (Number(paymentStatus) === 0) return false;
    }
    const str = String(paymentStatus ?? '').toLowerCase();
    return str === 'paid' || str === 'completed' || str === 'done' || str === '1';
  }

  getOrderStatusText(order: PastOrder): string {
    if (this.isDeliveredStatus(order)) return 'Delivered';
    if (this.isCancelledStatus(order)) return 'Cancelled';
    const st = Number(order.rider_status ?? order.order_status);
    if (st === 1) return 'Assigned';
    if (st === 2) return 'Accepted';
    if (st === 3) return 'Picked Up';
    return 'In Progress';
  }

  getOrderStatusClass(order: PastOrder): string {
    if (this.isDeliveredStatus(order)) return 'delivered';
    if (this.isCancelledStatus(order)) return 'cancelled';
    return 'active';
  }

  getItemUnitPrice(item: any): number {
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
    if (!isNaN(totalItemPrice) && totalItemPrice > 0 && qty > 1) {
      return totalItemPrice / qty;
    }
    return unitPrice;
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
    const fixedTip = order.tip_amount ?? order.tip;
    if (fixedTip !== undefined && fixedTip !== null && fixedTip !== '' && Number(fixedTip) > 0) {
      return Number(fixedTip);
    }
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

  getOrderDateObj(order: PastOrder): Date | null {
    const dateStr = order.order_created_at || order.created_at || order.order_date || order.date;
    if (!dateStr) return null;
    const d = new Date(dateStr);
    return isNaN(d.getTime()) ? null : d;
  }

  formatOrderDate(order: PastOrder): string {
    const d = this.getOrderDateObj(order);
    if (!d) return order.created_at || order.order_date || 'N/A';

    return d.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  }

  handleProductImageError(event: any): void {
    if (event && event.target) {
      event.target.src = this.defaultStoreImage;
    }
  }

  trackByOrderId(index: number, order: any): any {
    return order.order_id || order.id || index;
  }

  trackByItem(index: number, item: any): any {
    return item.product_id || item.id || index;
  }
}
