import { Component, OnInit } from '@angular/core';
import { IonicModule, ToastController, Platform } from '@ionic/angular';
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

  ) { }

  async ngOnInit() {
    await this.storage.create();
    const token = await this.storage.get('user_token');
  }


  // goBack(): void {
  //   this.location.back();
  // }

  onFileSelected(event: any, type: string) {
    const file: File = event.target.files[0];
    if (type === 'license') {
      this.licence_Image = file;
      console.log('licenceIMg', this.licence_Image)
    } else if (type === 'registration') {
      this.registrationDocument = file;
    }
  }



  async NextStep() {
    const token = await this.storage.get('token');
    if (!token || typeof token !== 'string') {
      console.error('No valid rider_ini_token found in storage.');
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
      this.generalError = 'fill all data';
      this.isDrivers_licenseNumberInvalid = true;
      this.isLicenseExpiryDateInvalid = true;
      this.isLicenceImageInvalid = true;
      this.isVehicelOwnerNameInvalid = true;
      this.isVehicelRegistrationNumberInvalid = true;
      this.isVehicelTypeInvalid = true;
      this.isRegistrationExpiryDateInvalid = true;
      this.isRegistrationDocumentInvalid = true;
      setTimeout(() => {
        this.generalError = '';
      }, 2000);
    } else if (!this.drivers_licenseNumber) {
      this.isDrivers_licenseNumberInvalid = true;
      this.generalError = 'Driver license number is required.';
      setTimeout(() => { this.generalError = ''; }, 2000);
      return;
    }
    else if (!this.licenseExpiryDate) {
      this.isLicenseExpiryDateInvalid = true;
      this.generalError = 'License expiry date is required.';
      setTimeout(() => { this.generalError = ''; }, 2000);
      return;
    }
    else if (!this.licence_Image) {
      this.isLicenceImageInvalid = true;
      this.generalError = 'License image is required.';
      setTimeout(() => { this.generalError = ''; }, 2000);
      return;
    }
    else if (!this.vehicelOwnerName) {
      this.isVehicelOwnerNameInvalid = true;
      this.generalError = 'Vehicle owner name is required.';
      setTimeout(() => { this.generalError = ''; }, 2000);
      return;
    }
    else if (!this.vehicelRegistrationNumber) {
      this.isVehicelRegistrationNumberInvalid = true;
      this.generalError = 'Vehicle registration number is required.';
      setTimeout(() => { this.generalError = ''; }, 2000);
      return;
    }
    else if (!this.vehicelType) {
      this.isVehicelTypeInvalid = true;
      this.generalError = 'Vehicle type is required.';
      setTimeout(() => { this.generalError = ''; }, 2000);
      return;
    }
    else if (!this.registrationExpiryDate) {
      this.isRegistrationExpiryDateInvalid = true;
      this.generalError = 'Registration expiry date is required.';
      setTimeout(() => { this.generalError = ''; }, 2000);
      return;
    }
    else if (!this.registrationDocument) {
      this.isRegistrationDocumentInvalid = true;
      this.generalError = 'Registration document is required.';
      setTimeout(() => { this.generalError = ''; }, 2000);
      return;
    }
    // If any field is invalid, stop here
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
      // Optionally show a toast or alert here
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


    formData.forEach((value, key) => {
      if (value instanceof File) {
        console.log(`${key}: [File] ${value.name}`);
      } else {
        console.log(`${key}: ${value}`);
      }
    });


    (await this.authservice.registerRiderStep2(formData)).subscribe(async (response) => {
      if (response && response.success) {
        this.router.navigate(['signup-step-3']);
        console.log('Step 2 API response:', response.message);
      } else {
        console.log(response.message || 'Submission failed');
      }
    },
      (error) => {
        console.error('API error:', error);
        // this.generalError = 'Registration document is required.';
        this.generalError = error?.error?.message || 'An error occurred. Please try again later.';
        setTimeout(() => { this.generalError = ''; }, 2000);
      }
    );
  }



}
