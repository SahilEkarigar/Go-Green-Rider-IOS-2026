import { CommonModule } from '@angular/common';
import { Component, CUSTOM_ELEMENTS_SCHEMA, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Location } from '@angular/common';
import { IonicModule, NavController } from '@ionic/angular';
import { FooterTabsComponent } from "../components/footer-tabs/footer-tabs.component";
import { AuthserviceService } from '@app/services/authservice.service';
import { Storage } from '@ionic/storage-angular';
@Component({
  selector: 'app-balance',
  templateUrl: './balance.page.html',
  styleUrls: ['./balance.page.scss'],
  standalone: true,
  imports: [IonicModule, FormsModule, CommonModule, FooterTabsComponent],
  schemas: [CUSTOM_ELEMENTS_SCHEMA]
})
export class BalancePage implements OnInit {

  rider_id: any;
  selectedDate!: string;   // YYYY-MM-DD
  orders: any[] = [];

  constructor(
    private navCtrl: NavController,
    private location: Location,
    private authservice: AuthserviceService,
    private storage: Storage
  ) {}

  async ngOnInit() {
    await this.storage.create();
    this.rider_id = await this.storage.get('user_id');
    this.selectedDate = this.getTodayDate();

    this.getAllOrderHistory(this.rider_id, this.selectedDate);
  }


  getTodayDate(): string {
    const today = new Date();
    return today.toISOString().split('T')[0];
  }


  onDateChange(event: any) {
    const value = event.detail.value;
    this.selectedDate = value.split('T')[0];

    console.log('Selected Date:', this.selectedDate);

    this.getAllOrderHistory(this.rider_id, this.selectedDate);
  }

  getAllOrderHistory(rider_id: any, date?: string) {

    const payload = { rider_id };

    const apiDate = date ? date : 'today';

    this.authservice.get_all_orders(payload, apiDate)
      .subscribe(response => {
        if (response.status == true) {
          console.log('Rider Order History', response);
          this.orders = response.orders;
        }else{
          this.orders = [];
        }
      });
  }

  goBack(): void {
    this.location.back();
  }

  goBackToScreen() {
    this.navCtrl.navigateBack('/setting-screen');
  }

  getOrderStatusText(status: number): string {
  switch (status) {
    case 2:
      return 'Out for Delivery';
    case 3:
      return 'Rejected';
    case 4:
      return 'Completed';
    default:
      return 'Pending';
  }
}

getOrderStatusColor(status: number): string {
  switch (status) {
    case 2:
      return 'primary';   // blue
    case 3:
      return 'danger';    // red
    case 4:
      return 'success';   // green
    default:
      return 'warning';   // yellow
  }
}
}

