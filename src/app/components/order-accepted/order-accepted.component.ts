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
  ) {}

  ngOnInit(): void {
    // Get rider ID from localStorage
    this.riderId = localStorage.getItem('user_id') || 'unknown_rider';

    this.playBuzzer();

    if (this.orderId) {
      this.fetchOrderDetails();
    }
    console.log('Order Id:', this.orderId)

    // Ensure socket is connected (connect only if not already connected)
    // if (!this.socketService.isConnected()) {
    //   this.socketService.connect(this.riderId);
    // }
    this.socketService.joinOrderRoom(this.orderId);

    // Stop buzzer if another rider accepted the order
    this.socketService.listenForStopBuzzer(this.orderId).subscribe(async (data: { orderId: string }) => {
      console.log('🚨 Buzzer stopped for this order', data);

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
}
