// import { Storage } from '@ionic/storage-angular';
import { Component, OnInit } from '@angular/core';
import { IonicModule, ToastController, Platform } from '@ionic/angular';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { catchError, throwError, timeout } from 'rxjs';
import { Location } from '@angular/common';
import { AuthserviceService } from '../services/authservice.service';
import { Storage } from '@ionic/storage-angular';
import { jwtDecode } from 'jwt-decode';




@Component({
  selector: 'app-signup-step-4',
  templateUrl: './signup-step-4.page.html',
  styleUrls: ['./signup-step-4.page.scss'],
  standalone: true,
  imports: [IonicModule, FormsModule, CommonModule],
})
export class SignupStep4Page implements OnInit {
  address = '';
  dob = '';
  identityProof: File | null = null;
  otherPhone = '';
  profileImage: File | null = null;
  isAddressInvalid: boolean = false;
  isDobInvalid: boolean = false;
  isIdentityProofInvalid: boolean = false;
  isOtherPhoneInvalid: boolean = false;
  isProfileImagevalid: boolean = false;
  otherPrefix = '+1';
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

  onProfileImageSelected(event: any) {
    const file: File = event.target.files[0];
    this.profileImage = file;
  }

  onIdentityProofSelected(event: any) {
    const file: File = event.target.files[0];
    this.identityProof = file;
  }


  async NextStep() {
    const token = await this.storage.get('token');
    if (!token || typeof token !== 'string') {
      this.generalError = 'No valid token found. Please log in again.';
      return;
    }
    const decoded: any = jwtDecode(token);
    const user_id = decoded.user_id;

    this.isAddressInvalid = false;
    this.isDobInvalid = false;
    this.isIdentityProofInvalid = false;
    this.isProfileImagevalid = false;
    this.generalError = '';

    if (!this.address && !this.dob && !this.identityProof && !this.profileImage) {
      this.generalError = 'fill all data';
      this.isAddressInvalid = true;
      this.isDobInvalid = true;
      this.isIdentityProofInvalid = true;
      this.isProfileImagevalid = true;
      setTimeout(() => {
        this.generalError = '';
      }, 2000);
    } else if (!this.address) {
      this.isAddressInvalid = true;
      this.generalError = 'Address is required.';
      setTimeout(() => {
        this.generalError = '';
      }, 2000);
      return;
    } else if (!this.dob) {
      this.isDobInvalid = true;
      this.generalError = 'Date of birth is required.';
      setTimeout(() => {
        this.generalError = '';
      }, 2000);
      return;
    } else if (!this.identityProof) {
      this.isIdentityProofInvalid = true;
      this.generalError = 'Identity proof is required.';
      setTimeout(() => {
        this.generalError = '';
      }, 2000);
      return;
    } else if (!this.profileImage) {
      this.isProfileImagevalid = true;
      this.generalError = 'Profile image is required.';
      setTimeout(() => {
        this.generalError = '';
      }, 2000);
      return;
    }

    if (
      this.isAddressInvalid ||
      this.isDobInvalid ||
      this.isIdentityProofInvalid ||
      this.isProfileImagevalid
    ) {
      return;
    }

    const formData = new FormData();
    formData.append('user_id', user_id.toString());
    formData.append('address', this.address);
    formData.append('dob', this.dob);
    formData.append('other_phone_number', this.otherPhone);
    formData.append('role_id', this.role_id.toString());
    if (this.identityProof) {
      formData.append('identity_proof', this.identityProof);
    }
    if (this.profileImage) {
      formData.append('profile_pic', this.profileImage);
    }

    (await this.authservice.personlaData(formData)).subscribe(async (response: { success: any; message: any; }) => {
      if (response && response.success) {
        this.router.navigate(['signup-step-2']);
        console.log('Step 2 API response:', response.message);
      } else {
        console.log(response.message || 'Submission failed');
      }
    },
      (error) => {
        console.error('API error:', error);
        this.generalError = error?.error?.message || 'An error occurred. Please try again later.';
        setTimeout(() => {
          this.generalError = '';
        }, 2000);
      }
    );

    // Submit formData here (e.g., call your service)
  }


}
