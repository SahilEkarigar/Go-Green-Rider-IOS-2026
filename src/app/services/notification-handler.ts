import { Injectable } from '@angular/core';
import { ModalController, Platform } from '@ionic/angular';
import { OrderAcceptedComponent } from '../components/order-accepted/order-accepted.component';

@Injectable({ providedIn: 'root' })
export class NotificationHandler {
  private buzzerAudio: HTMLAudioElement | null = null;

  constructor(private modalCtrl: ModalController, private platform: Platform) {}

  async handleNewOrderNotification(data: any) {
    console.log('📥 Raw Notification Data:', data);

    if (!data) {
      console.warn('⚠️ Notification data is empty');
      return;
    }

    // ✅ Normalize data keys (handle both camelCase and snake_case)
    const orderId = data.order_id ?? data.orderId ?? null;
    const vendorId = data.vendor_id ?? data.vendorId ?? 'Rider';
    const rider_to_vendor_distance_km =
      data.rider_to_vendor_distance_km ?? data.distance_km ?? '0.00';
    const vendor_to_customer_distance_km =
      data.vendor_to_customer_distance_km ?? '0.00';
    const type = data.type ?? data.event ?? 'new_order';

    console.log('🧾 Normalized Notification Data:', {
      orderId,
      vendorId,
      rider_to_vendor_distance_km,
      vendor_to_customer_distance_km,
      type,
    });

    // Only handle new order notifications
    if (type !== 'new_order') {
      console.log('ℹ️ Ignored notification type:', type);
      return;
    }

    // Ensure critical fields exist
    if (!orderId || !vendorId) {
      console.error('❌ Missing required order info (orderId/vendorId)');
      return;
    }

    await this.platform.ready();

    // 🔊 Play buzzer before showing modal
    this.playBuzzer();

    const modal = await this.modalCtrl.create({
      component: OrderAcceptedComponent,
      componentProps: {
        orderId,
        vendorId,
        rider_to_vendor_distance_km,
        vendor_to_customer_distance_km,
      },
      backdropDismiss: false,
      cssClass: 'custom-modal',
    });

    await modal.present();

    // When closed
    const { data: result } = await modal.onDidDismiss();
    this.stopBuzzer();

    if (result?.action === 'accepted') {
      console.log('✅ Order accepted');
    } else if (result?.action === 'declined') {
      console.log('❌ Order declined');
    } else {
      console.log('ℹ️ Modal dismissed without action');
    }
  }

  private playBuzzer() {
    console.log('🔊 Playing buzzer sound');
    this.stopBuzzer();
    this.buzzerAudio = new Audio('assets/sound/order.mp3');
    this.buzzerAudio.loop = true;
    this.buzzerAudio.play().catch((err) =>
      console.error('Error playing buzzer sound:', err)
    );
  }

  private stopBuzzer() {
    if (this.buzzerAudio) {
      console.log('🔇 Stopping buzzer sound');
      this.buzzerAudio.pause();
      this.buzzerAudio.currentTime = 0;
      this.buzzerAudio = null;
    }
  }
}
