import { Component, OnInit } from '@angular/core';
import { IonicModule, ToastController, Platform, LoadingController } from '@ionic/angular';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { catchError, throwError, timeout } from 'rxjs';
import { HttpClient } from '@angular/common/http';
import { Location } from '@angular/common';
import { AuthserviceService } from '../services/authservice.service';
import { Storage } from '@ionic/storage-angular';
import { jwtDecode } from 'jwt-decode';


@Component({
  selector: 'app-signup-step-2',
  templateUrl: './signup-step-2.page.html',
  styleUrls: ['./signup-step-2.page.scss'],
  standalone: true,
  imports: [CommonModule, FormsModule, IonicModule],
})
export class SignupStep2Page implements OnInit {
  // Form fields
  drivers_licenseNumber: string = '';
  licenseExpiryDate: string = '';
  licence_Image: File | null = null;
  vehicelOwnerName: string = '';
  vehicelRegistrationNumber: string = '';
  vehicelType: string = '';
  registrationExpiryDate: string = '';
  registrationDocument: File | null = null;

  // Error flags
  isDrivers_licenseNumberInvalid = false;
  isLicenseExpiryDateInvalid = false;
  isLicenceImageInvalid = false;
  isVehicelOwnerNameInvalid = false;
  isVehicelRegistrationNumberInvalid = false;
  isVehicelTypeInvalid = false;
  isRegistrationExpiryDateInvalid = false;
  isRegistrationDocumentInvalid = false;

  role_id = 4;
  isIos = false;

  generalError: string = '';

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

  private errorMsgShow(msg: string) {
    this.generalError = msg;
    this.presentToast(msg);
    setTimeout(() => {
      this.generalError = '';
    }, 3000);
  }

  onFileSelected(event: any, type: string) {
    const file: File = event.target.files[0];
    if (type === 'license') {
      this.licence_Image = file;
      this.isLicenceImageInvalid = false;
      console.log('licenceIMg', this.licence_Image)
    } else if (type === 'registration') {
      this.registrationDocument = file;
      this.isRegistrationDocumentInvalid = false;
    }
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

    this.isDrivers_licenseNumberInvalid = !this.drivers_licenseNumber;
    this.isLicenseExpiryDateInvalid = !this.licenseExpiryDate;
    this.isLicenceImageInvalid = !this.licence_Image;
    this.isVehicelOwnerNameInvalid = !this.vehicelOwnerName;
    this.isVehicelRegistrationNumberInvalid = !this.vehicelRegistrationNumber;
    this.isVehicelTypeInvalid = !this.vehicelType;
    this.isRegistrationExpiryDateInvalid = !this.registrationExpiryDate;
    this.isRegistrationDocumentInvalid = !this.registrationDocument;

    if (!this.drivers_licenseNumber && !this.licenseExpiryDate && !this.licence_Image && !this.vehicelOwnerName && !this.vehicelRegistrationNumber && !this.vehicelType && !this.registrationExpiryDate && !this.registrationDocument) {
      this.isDrivers_licenseNumberInvalid = true;
      this.isLicenseExpiryDateInvalid = true;
      this.isLicenceImageInvalid = true;
      this.isVehicelOwnerNameInvalid = true;
      this.isVehicelRegistrationNumberInvalid = true;
      this.isVehicelTypeInvalid = true;
      this.isRegistrationExpiryDateInvalid = true;
      this.isRegistrationDocumentInvalid = true;
      this.errorMsgShow('All fields are required.');
      return;
    } else if (!this.drivers_licenseNumber) {
      this.isDrivers_licenseNumberInvalid = true;
      this.errorMsgShow('Driver license number is required.');
      return;
    }
    else if (!this.licenseExpiryDate) {
      this.isLicenseExpiryDateInvalid = true;
      this.errorMsgShow('License expiry date is required.');
      return;
    }
    else if (!this.licence_Image) {
      this.isLicenceImageInvalid = true;
      this.errorMsgShow('License image is required.');
      return;
    }
    else if (!this.vehicelOwnerName) {
      this.isVehicelOwnerNameInvalid = true;
      this.errorMsgShow('Vehicle owner name is required.');
      return;
    }
    else if (!this.vehicelRegistrationNumber) {
      this.isVehicelRegistrationNumberInvalid = true;
      this.errorMsgShow('Vehicle registration number is required.');
      return;
    }
    else if (!this.vehicelType) {
      this.isVehicelTypeInvalid = true;
      this.errorMsgShow('Vehicle type is required.');
      return;
    }
    else if (!this.registrationExpiryDate) {
      this.isRegistrationExpiryDateInvalid = true;
      this.errorMsgShow('Registration expiry date is required.');
      return;
    }
    else if (!this.registrationDocument) {
      this.isRegistrationDocumentInvalid = true;
      this.errorMsgShow('Registration document is required.');
      return;
    }

    if (
      this.isDrivers_licenseNumberInvalid ||
      this.isLicenseExpiryDateInvalid ||
      this.isLicenceImageInvalid ||
      this.isVehicelOwnerNameInvalid ||
      this.isVehicelRegistrationNumberInvalid ||
      this.isVehicelTypeInvalid ||
      this.isRegistrationExpiryDateInvalid ||
      this.isRegistrationDocumentInvalid
    ) {
      return;
    }

    const formData = new FormData();
    formData.append('role_id', this.role_id.toString());
    formData.append('user_id', user_id.toString());
    formData.append('license_number', this.drivers_licenseNumber);
    formData.append('license_expiry_date', this.licenseExpiryDate);
    if (this.licence_Image) {
      formData.append('rider_license_image', this.licence_Image);
    }
    formData.append('vehicle_owner_name', this.vehicelOwnerName);
    formData.append('vehicle_registration_number', this.vehicelRegistrationNumber);
    formData.append('vehicle_type', this.vehicelType);
    formData.append('registraion_expiry_date', this.registrationExpiryDate);
    if (this.registrationDocument) {
      formData.append('registration_doc', this.registrationDocument);
    }

    await this.presentLoading('Saving details...');
    (await this.authservice.registerRiderStep2(formData)).subscribe(
      async (response) => {
        await this.dismissLoading();
        if (response && response.success) {
          this.router.navigate(['signup-step-3']);
          console.log('Step 2 API response:', response.message);
        } else {
          console.log(response.message || 'Submission failed');
          this.generalError = response.message || 'Submission failed. Please try again.';
          this.presentToast(this.generalError);
        }
      },
      async (error) => {
        await this.dismissLoading();
        console.error('API error:', error);
        this.generalError = error?.error?.message || 'An error occurred. Please try again later.';
        this.presentToast(this.generalError);
      }
    );
  }

}
