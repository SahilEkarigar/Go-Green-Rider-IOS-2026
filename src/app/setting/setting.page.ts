import { Component, OnInit } from '@angular/core';
import { IonicModule, ToastController, Platform, NavController } from '@ionic/angular';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { Location } from '@angular/common';
import { catchError, throwError, timeout } from 'rxjs';
import { Storage } from '@ionic/storage-angular';
import { jwtDecode } from 'jwt-decode';
import { AuthserviceService } from '../services/authservice.service';
import { FooterTabsComponent } from '../components/footer-tabs/footer-tabs.component';
import { UserService } from '../services/user.service';
import { filter } from 'rxjs';
import { FCM_TOKEN, FcmService } from '../services/fcm.service';
import { Capacitor } from '@capacitor/core';

@Component({
  selector: 'app-setting',
  templateUrl: './setting.page.html',
  styleUrls: ['./setting.page.scss'],
  standalone: true,
  imports: [CommonModule, FormsModule, IonicModule, FooterTabsComponent],
})
export class SettingPage implements OnInit {
  user: any = ''

  constructor(
    private router: Router,
    private navCtrl: NavController,
    private storage: Storage,
    private location: Location,
    private authService: AuthserviceService,
    private userService: UserService,
    private fcm: FcmService,
  ) { }

  async ngOnInit() {
    await this.storage.create();
    const token = await this.storage.get('user_token');

    this.userService.user$
      .pipe(filter(user => !!user)) // ✅ ignore initial null
      .subscribe(user => {
        this.user = user;
      });

  }

  userImage: string = '';
  userName: string = '';
  role_id = 4;
  phone: string = '';

  profileData: any = null;
  storeProfilePicture: string = '';
  defaultProfileImage: string = 'assets/home/user.jfif';
  showSearch: boolean = false;
  storeName: string = '';


  goToEditProfile() {
    this.router.navigate(['/edit-account']);
  }
  changePassword() {
    this.router.navigate(['/passwordchange']);
  }

  onImageError(event: any) {
    event.target.src = this.defaultProfileImage;
  }

  onProfile() {
    console.log('Profile clicked');
  }
  goBackToHome() {
    this.navCtrl.navigateBack('/home');
  }
  goToChangePassword() {
    this.navCtrl.navigateBack('/changepassword');
  }
  goToRatings() {
    this.navCtrl.navigateBack('/ratings');
  }
  goTobank() {
    this.navCtrl.navigateBack('/bankinfo');
  }
  goToWallet() {
    this.navCtrl.navigateBack('/wallet');
  }
  goToshop() {
    this.navCtrl.navigateBack('/shopprofile');
  }
  openImageModal() {
    alert('Image modal clicked! (Implement actual modal here)');
  }
  goTohelp() {
    this.navCtrl.navigateBack('/help-support');
  }
  goTostatus() {
    this.navCtrl.navigateBack('/riderstatus');
  }
  goToaddress() {
    this.navCtrl.navigateBack('/address');
  }
  goToPrivacy() {
    this.navCtrl.navigateBack('/privacy');
  }
  goToOrder() {
    this.navCtrl.navigateBack('/balance');
  }
  goToTerms() {
    this.navCtrl.navigateBack('/terms-condition');
  }
  goToFAQS() {
    this.navCtrl.navigateBack('/faqs');
  }
  goToAnalytics() {
    this.navCtrl.navigateBack('/codeanalytics');
  }
  goTohistory() {
    this.navCtrl.navigateBack('/withdrawal');
  }


  showVehicelDetialPage() {
    this.navCtrl.navigateBack('/vehicel-details');
  }
  showRiderDetailPage() {
    this.navCtrl.navigateBack('/rider-details');
  }

  async logoutUser() {
    const user_id = await this.storage.get('user_id');
    const fcmToken = await this.storage.get('FCM_TOKEN');

    // 👉 Only send FCM token removal if Android/iOS
    if (Capacitor.getPlatform() === 'android' || Capacitor.getPlatform() === 'ios') {
      if (user_id && fcmToken) {
        const data = { user_id, fcmToken };

        (await this.authService.removeFCMToken(data)).subscribe(
          async (response) => {
            if (response && response.success) {
              console.log(response.message);
            } else {
              console.log(response.message || 'Submission failed');
            }
          },
          (error) => {
            console.error('API error:', error);
          }
        );
      }
    } else {
      console.log("🌐 Web platform — skipping FCM token removal.");
    }

    // 👉 Clear local storage for all platforms
    await this.storage.remove('token');
    await this.storage.remove('user_id');
    await this.storage.remove('FCM_TOKEN');
    await this.storage.clear();

    this.router.navigate(['/welcome']);
  }

  goBack(): void {
    this.location.back();
  }





}
