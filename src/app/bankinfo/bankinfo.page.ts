import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { IonicModule, NavController, ToastController, LoadingController  } from '@ionic/angular';
import { Location } from '@angular/common';
import { AuthserviceService } from '../services/authservice.service';
import { Storage } from '@ionic/storage-angular'; // optional if you store user_id in storage

@Component({
  selector: 'app-bankinfo',
  templateUrl: './bankinfo.page.html',
  styleUrls: ['./bankinfo.page.scss'],
  standalone: true,
  imports: [IonicModule, FormsModule, CommonModule],
})
export class BankinfoPage implements OnInit {
    constructor(
      private location: Location,
      private navCtrl: NavController,
      private authService: AuthserviceService,
      private toastCtrl: ToastController,
      private loadingCtrl: LoadingController,
      private storage: Storage
    ) {}

  accountHolderName = '';
  bankName = '';
  transitNumber = '';
  institutionNumber = '';
  accountNumber = '';

  isAccountHolderNameInvalid = false;
  isTransitNumberInvalid = false;
  isInstitutionNumberInvalid = false;
  isAccountNumberInvalid = false;

  ngOnInit() {
    this.loadBankInfo();
  }

  async loadBankInfo() {
    const loading = await this.loadingCtrl.create({
      message: 'Loading bank details...',
      spinner: 'circles',
    });
    await loading.present();

    try {
      const user_id = await this.storage.get('user_id');
      if (!user_id) {
        console.error('No user_id found in storage');
        await loading.dismiss();
        return;
      }

      this.authService.getBankInfo(user_id).subscribe({
        next: async (res: any) => {
          await loading.dismiss();
          if (res.success && res.data) {
            this.accountHolderName = res.data.account_holder_name || '';
            this.bankName = res.data.bank_name || '';
            this.transitNumber = res.data.transit_number || '';
            this.institutionNumber = res.data.institution_number || '';
            this.accountNumber = res.data.account_number || '';
          } else {
            const toast = await this.toastCtrl.create({
              message: res.message || 'Unable to fetch bank details',
              duration: 3000,
              color: 'warning',
            });
            toast.present();
          }
        },
        error: async (err) => {
          await loading.dismiss();
          console.error('Error fetching bank info:', err);
          const toast = await this.toastCtrl.create({
            message: 'Failed to load bank details. Please try again.',
            duration: 3000,
            color: 'danger',
          });
          toast.present();
        },
      });
    } catch (e) {
      await loading.dismiss();
      console.error('Error retrieving user_id:', e);
    }
  }

  goBack(): void {
    this.location.back();
  }

  validateForm() {
    this.isAccountHolderNameInvalid = !this.accountHolderName.trim();
    this.isTransitNumberInvalid = !this.transitNumber.trim();
    this.isInstitutionNumberInvalid = !this.institutionNumber.trim();
    this.isAccountNumberInvalid = !this.accountNumber.trim();
  }
}
