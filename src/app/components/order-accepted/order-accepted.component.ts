import {
  Component,
  Input,
  OnInit,
  OnDestroy,
  ViewChild,
  ElementRef,
  AfterViewInit,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { IonicModule, ModalController } from '@ionic/angular';
import { AuthserviceService } from '../../services/authservice.service';
import { SocketService } from '../../services/socket.service';
import { OrderStateService } from '../../services/order-state';

import { addIcons } from 'ionicons';
import {
  storefrontOutline,
  locationOutline,
  bagHandleOutline,
  receiptOutline,
  checkmarkCircleOutline,
  closeCircleOutline
} from 'ionicons/icons';

@Component({
  selector: 'app-order-accepted',
  standalone: true,
  imports: [CommonModule, IonicModule],
  templateUrl: './order-accepted.component.html',
  styleUrls: ['./order-accepted.component.scss'],
})
export class OrderAcceptedComponent implements OnInit, OnDestroy, AfterViewInit {
  @Input() orderId!: string;
  @Input() vendorId!: string;
  @Input() rider_to_vendor_distance_km!: any;
  @Input() vendor_to_customer_distance_km!: any;

  @ViewChild('sliderKnob', { static: false }) sliderKnob!: ElementRef;
  @ViewChild('sliderContainer', { static: false }) sliderContainer!: ElementRef;

  private buzzerAudio = new Audio('assets/sound/order.mp3');
  preparationTime = 10;

  orderDetails: any;
  isLoading = false;
  riderId: string = '';
  

  constructor(
    private modalCtrl: ModalController,
    private authService: AuthserviceService,
    private socketService: SocketService,
    private orderStateService: OrderStateService
  ) {
    addIcons({
      storefrontOutline,
      locationOutline,
      bagHandleOutline,
      receiptOutline,
      checkmarkCircleOutline,
      closeCircleOutline
    });
  }

  ngOnInit(): void {
    // Get rider ID from localStorage
    this.riderId = localStorage.getItem('user_id') || 'unknown_rider';

    this.playBuzzer();

    if (this.orderId) {
      this.fetchOrderDetails();
    }
    // console.log('Order Id:', this.orderId)

    // Ensure socket is connected (connect only if not already connected)
    // if (!this.socketService.isConnected()) {
    //   this.socketService.connect(this.riderId);
    // }
    this.socketService.joinOrderRoom(this.orderId);

    // Stop buzzer if another rider accepted the order
    this.socketService.listenForStopBuzzer(this.orderId).subscribe(async (data: { orderId: string }) => {
      // console.log('🚨 Buzzer stopped for this order', data);

      this.stopBuzzer();

      // ✅ Check if a modal is still open before dismissing
      const topModal = await this.modalCtrl.getTop();
      if (topModal) {
        await this.modalCtrl.dismiss({ action: 'stopped_by_other' });
      } else {
        console.warn("⚠️ Tried to dismiss modal, but no active modal exists.");
      }
    });
  }

  ngAfterViewInit(): void {}

  ngOnDestroy(): void {
    this.stopBuzzer();
    this.socketService.leaveOrderRoom(this.orderId);
  }

  private async fetchOrderDetails() {
    this.isLoading = true;
    try {
      const obs = await this.authService.getOrderDetails(this.orderId);
      obs.subscribe({
        next: (res: any) => {
          this.orderDetails = res;
          console.log("Order Details:", this.orderDetails);
          this.isLoading = false;
        },
        error: (err: any) => {
          console.error('Error fetching order details:', err);
          this.isLoading = false;
        },
      });
    } catch (err) {
      console.error('Unexpected error:', err);
      this.isLoading = false;
    }
  }

  private playBuzzer() {
    this.buzzerAudio.loop = true;
    this.buzzerAudio.play().catch((err) =>
      console.error('Error playing buzzer sound:', err)
    );
  }

  private stopBuzzer() {
    this.buzzerAudio.pause();
    this.buzzerAudio.currentTime = 0;
  }

  onClose() {
    this.stopBuzzer();
    this.modalCtrl.dismiss({ action: 'closed', time: '' });
  }

  onAccept() {
    this.stopBuzzer();

    // Emit order acceptance through socket
    this.socketService.handleOrder({
      orderId: this.orderId,
      riderId: this.riderId,
      status: 2   // ✅ 2 = Accepted
    });

    this.modalCtrl.dismiss({ action: 'accepted'});
    this.orderStateService.setAcceptedOrder(this.orderDetails);
  }



  onDecline() {
    // ✅ Only stop buzzer, no API call
    this.stopBuzzer();
    this.modalCtrl.dismiss({ action: 'declined' });
  }

  increaseTime() {
    this.preparationTime += 5;
  }

  decreaseTime() {
    this.preparationTime = Math.max(this.preparationTime - 5, 0);
  }

  /* =====================================================
     CALCULATION HELPERS
  ===================================================== */

  getItemUnitPrice(item: any): number {
    if (!item) return 0;
    return Number(
      item.product_price ??
      item.single_product_price ??
      item.single_item_price ??
      item.price ??
      0
    );
  }

  getItemTotalPrice(item: any): number {
    if (!item) return 0;
    const qty = Number(item.product_quantity ?? item.quantity ?? 1) || 1;
    const unitPrice = this.getItemUnitPrice(item);
    const totalItemPrice = Number(item.total_item_price);

    if (!isNaN(totalItemPrice) && totalItemPrice > 0) {
      if (qty === 1 || totalItemPrice > unitPrice) {
        return totalItemPrice;
      }
    }
    return unitPrice * qty;
  }

  getItemsTotal(): number {
    const order = this.orderDetails;
    if (!order) return 0;
    const items = this.getOrderItems();
    if (items.length > 0) {
      return items.reduce((acc: number, item: any) => {
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

  getFastDeliveryCharge(): number {
    const order = this.orderDetails;
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

  getRiderDeliveryCharge(): number {
    const order = this.orderDetails;
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

  getTipAmount(): number {
    const order = this.orderDetails;
    if (!order) return 0;

    // 1. Check fixed tip_amount first
    const fixedTip = order.tip_amount ?? order.tip;
    if (fixedTip !== undefined && fixedTip !== null && fixedTip !== '' && Number(fixedTip) > 0) {
      return Number(fixedTip);
    }

    // 2. Check tip_percentage if tip_amount is not present
    const tipPct = order.tip_percentage;
    if (tipPct !== undefined && tipPct !== null && tipPct !== '' && Number(tipPct) > 0) {
      const baseTotal = this.getItemsTotal();
      return (Number(tipPct) / 100) * baseTotal;
    }

    return 0;
  }

  getTipPercentage(): number {
    const order = this.orderDetails;
    if (!order) return 0;
    const fixedTip = order.tip_amount ?? order.tip;
    if (fixedTip !== undefined && fixedTip !== null && fixedTip !== '' && Number(fixedTip) > 0) {
      return 0;
    }
    return Number(order.tip_percentage) || 0;
  }

  getOrderTotal(): string {
    const order = this.orderDetails;
    if (!order) return '0.00';

    const itemsTotal = this.getItemsTotal();
    const fastFee = this.getFastDeliveryCharge();
    const riderDeliveryFee = this.getRiderDeliveryCharge();
    const tip = this.getTipAmount();

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

  getOrderItems(): any[] {
    const order = this.orderDetails;
    if (!order) return [];
    if (Array.isArray(order.items) && order.items.length > 0) {
      return order.items;
    }
    if (Array.isArray(order.order_list) && order.order_list.length > 0) {
      return order.order_list;
    }
    if (Array.isArray(order.products) && order.products.length > 0) {
      return order.products;
    }
    return [];
  }
}
