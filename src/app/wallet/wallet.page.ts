import { ResendOtpPage } from './../resend-otp/resend-otp.page';
import { AuthserviceService } from '@app/services/authservice.service';
import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { IonicModule, NavController } from '@ionic/angular';
import { Location } from '@angular/common';


@Component({
  selector: 'app-wallet',
  templateUrl: './wallet.page.html',
  styleUrls: ['./wallet.page.scss'],
  standalone: true,
  imports: [IonicModule, FormsModule, CommonModule],
})
export class WalletPage implements OnInit {
  constructor(private navCtrl: NavController,private location: Location, private authservice: AuthserviceService) {}

  ngOnInit() {
    this.getOrderDetailsEarnings();
  }
  
  goBackToScreen() {
    this.navCtrl.navigateBack('/setting-screen'); 
  }

  goBack(): void {
    this.location.back();
  }
  async getOrderDetailsEarnings() {
    const rider_id = 4;

    const apiCall = await this.authservice.getOrderDetailsByRiderId(rider_id, 'month');

    apiCall.subscribe((response: any) => {
      console.log('get order earning response', response);
    });
  }
}
