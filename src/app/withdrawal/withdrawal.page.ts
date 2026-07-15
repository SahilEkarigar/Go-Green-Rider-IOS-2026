import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { IonicModule, NavController } from '@ionic/angular';
import { time } from 'ionicons/icons';
import { FooterTabsComponent } from "../components/footer-tabs/footer-tabs.component";

import { Location } from '@angular/common';

@Component({
  selector: 'app-withdrawal',
  templateUrl: './withdrawal.page.html',
  styleUrls: ['./withdrawal.page.scss'],
  standalone: true,
  imports: [IonicModule, FormsModule, CommonModule, FooterTabsComponent],
})
export class WithdrawalPage implements OnInit {
  constructor(private navCtrl: NavController,private location: Location) {}
  transactions = [
    {
      amount: '$180',
      date: '26 June, 2025',
      time: '12:14 A.M.',
      status: 'Completed',
    },
    {
      amount: '$75',
      date: '25 June, 2025',
      time: '10:00 A.M.',
      status: 'Processing',
    },
    {
      amount: '$60',
      date: '24 June, 2025',
      time: '01:50 P.M.',
      status: 'Failed',
    },
    {
      amount: '$50',
      date: '23 June, 2025',
      time: '03:40 A.M.',
      status: 'Failed',
    },
    {
      amount: '$90',
      date: '22 June, 2025',
      time: '09:00 P.M.',
      status: 'Completed',
    },
    {
      amount: '$40',
      date: '26 June, 2025',
      time: '10:03 A.M.',
      status: 'Completed',
    },
    {
      amount: '$20',
      date: '25 June, 2025',
      time: '11:00 P.M.',
      status: 'Processing',
    },
  ];
  ngOnInit() {}
  getStatusIcon(status: string): string {
    switch (status.trim().toLowerCase()) {
      case 'completed':
        return 'checkmark-circle';
      case 'processing':
        return 'time';
      case 'failed':
        return 'close-circle';
      default:
        return 'help-circle';
    }
  }

  // goBackToScreen() {
  //   this.navCtrl.navigateBack('/setting-screen');
  // }

  
  goBack(): void {
    this.location.back();
  }
}
