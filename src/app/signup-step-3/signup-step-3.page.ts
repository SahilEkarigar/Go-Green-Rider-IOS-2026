import { Component, OnInit } from '@angular/core';
import { IonicModule, ToastController, Platform, LoadingController } from '@ionic/angular';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { Location } from '@angular/common';
import { catchError, throwError, timeout } from 'rxjs';
import { AuthserviceService } from '../services/authservice.service';
import { Storage } from '@ionic/storage-angular';
import { jwtDecode } from 'jwt-decode';

@Component({
  selector: 'app-signup-step-3',
  templateUrl: './signup-step-3.page.html',
  styleUrls: ['./signup-step-3.page.scss'],
  standalone: true,
  imports: [CommonModule, FormsModule, IonicModule],
})
export class SignupStep3Page implements OnInit {
  account_holder_name: string = '';
  institution_number: string = '';
  transit_number: string = '';
  account_number: string = '';
  void_cheque: File | null = null;



  // Error flags
  isAccount_holder_nameInvalid = false;
  isInstitution_numberInvalid = false;
  isTransit_numberInvalid = false;
  isAccount_numberInvalid = false;
  isVoid_chequeInvoice = false;

  role_id = 4;
  isIos = false;
  generalError = '';

  constructor(
    private platform: Platform,
    private router: Router,
    private toastController: ToastController,
    private location: Location,
    private authservice: AuthserviceService,
    private storage: Storage,
    private loadingController: LoadingController
  ) { }

  async ngOnInit() {
    await this.storage.create();
    const token = await this.storage.get('user_token');
  }


  onFileSelected(event: any) {
    const file = event.target.files[0];
    if (file) {
      this.void_cheque = file;
      this.isVoid_chequeInvoice = false;
    }
  }

  goBack(): void {
    this.location.back();
  } 

  private async presentLoading(message: string = 'Please wait...') {
    const loading = await this.loadingController.create({ message });
    await loading.present();
  }

  private async dismissLoading() {
    try { await this.loadingController.dismiss(); } catch {}
  }

  private async presentToast(message: string) {
    const toast = await this.toastController.create({
      message: message,
      duration: 3000,
      color: 'danger',
      position: 'bottom'
    });
    await toast.present();
  }

  async NextStep() {
    const token = await this.storage.get('token');
    if (!token || typeof token !== 'string') {
      console.error('No valid token found in storage.');
      this.presentToast('Session expired. Please log in again.');
      return;
    }
    const decoded: any = jwtDecode(token);
    const user_id = decoded.user_id;

    this.isAccount_holder_nameInvalid = !this.account_holder_name;
    this.isInstitution_numberInvalid = !this.institution_number;
    this.isTransit_numberInvalid = !this.transit_number;
    this.isAccount_numberInvalid = !this.account_number;
    this.isVoid_chequeInvoice = !this.void_cheque;

    if (
      this.isAccount_holder_nameInvalid ||
      this.isInstitution_numberInvalid ||
      this.isTransit_numberInvalid ||
      this.isAccount_numberInvalid ||
      this.isVoid_chequeInvoice
    ) {    
      this.presentToast('Please fill all required fields.');
      return;
    }


    const formData = new FormData();
    formData.append('user_id', user_id.toString());
    formData.append('role_id', this.role_id.toString());
    formData.append('account_holder_name', this.account_holder_name);
    formData.append('transit_number', this.transit_number);
    formData.append('institution_number', this.institution_number);
    formData.append('account_number', this.account_number);
    if (this.void_cheque) {
      formData.append('void_cheque', this.void_cheque);
    }

    await this.presentLoading('Saving bank details...');
    (await this.authservice.addBankDetails(formData)).subscribe(
      async (response) => {
        await this.dismissLoading();
        if (response && response.success) {
          this.router.navigate(['application-review']);
          await this.storage.remove('token');
          console.log('Step 3 API response:', response.message);
        } else {
          console.log(response.message || 'Submission failed');
          this.presentToast(response.message || 'Submission failed. Please try again.');
        }
      },
      async (error) => {
        await this.dismissLoading();
        console.error('API error:', error);
        this.presentToast(error?.error?.message || 'An error occurred. Please try again later.');
      }
    );


  }
  async skip_Step(): Promise<void> {
    await this.storage.remove('token');
    this.router.navigate(['application-review']);
  }
}
