import { Component, OnInit } from '@angular/core';
import { IonicModule, NavController } from '@ionic/angular';
import { Location } from '@angular/common';
import { AuthserviceService } from '../services/authservice.service';
import { Storage } from '@ionic/storage-angular';
import { UserService } from '../services/user.service';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-shopstatus',
  templateUrl: './shopstatus.page.html',
  styleUrls: ['./shopstatus.page.scss'],
  standalone: true,
  imports: [IonicModule, FormsModule, CommonModule],
})
export class ShopstatusPage implements OnInit {

  shopStatus: boolean = true;
  openTime: string = '';
  closeTime: string = '';

  constructor(
    private navCtrl: NavController,
    private location: Location,
    private authservice: AuthserviceService,
    private storage: Storage,
    private userService: UserService,
  ) {}

  async saveRiderStatus() {
    const storedUserId = await this.storage.get('user_id');

    const payload = {
      status: this.shopStatus ? 1 : 0,
      user_id: storedUserId,
      start_time: this.openTime,
      close_time: this.closeTime,
      role_id: 4
    };

    this.authservice.updateStatusPayload(payload).subscribe({
      next: (res) => {
        // console.log('Rider status updated successfully:', res);
        this.navCtrl.navigateBack('/setting');
      },
      error: (err) => {
        console.error('Failed to update rider status:', err);
      }
    });
  }

  async ngOnInit() {
    // Subscribe to BehaviorSubject to auto-update UI
    this.userService.user$.subscribe((user) => {
      if (user) {
        // console.log('user is', user);
        this.shopStatus = user.data.status === 1;
        this.openTime = user.data.rider_start_time || '';
        this.closeTime = user.data.rider_close_time || '';
      }
    });
  }

  async doRefresh(event: any) {
    await this.userService.refreshUserData();
    setTimeout(() => {
      event.target.complete();
    }, 800);
  }

  // ✅ Ionic lifecycle: runs every time page is navigated to
  async ionViewWillEnter() {
    await this.userService.refreshUserData();
  }

  goBack(): void {
    this.location.back();
  }
}
