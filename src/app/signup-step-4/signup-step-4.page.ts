import {
  Component,
  OnDestroy,
  OnInit
} from '@angular/core';

import {
  IonicModule,
  ToastController,
  Platform,
  LoadingController
} from '@ionic/angular';

import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { CommonModule, Location } from '@angular/common';
import { AuthserviceService } from '../services/authservice.service';
import { Storage } from '@ionic/storage-angular';
import { jwtDecode } from 'jwt-decode';

@Component({
  selector: 'app-signup-step-4',
  templateUrl: './signup-step-4.page.html',
  styleUrls: ['./signup-step-4.page.scss'],
  standalone: true,
  imports: [
    IonicModule,
    FormsModule,
    CommonModule
  ],
})
export class SignupStep4Page implements OnInit, OnDestroy {

  address = '';
  dob = '';
  maxDate: string = '';

  identityProof: File | null = null;

  otherPhone = '';
  otherPrefix = '+1';

  profileImage: File | null = null;

  isAddressInvalid: boolean = false;
  isDobInvalid: boolean = false;
  isIdentityProofInvalid: boolean = false;
  isOtherPhoneInvalid: boolean = false;
  isProfileImageInvalid: boolean = false;

  addressErrorMessage: string = '';
  dobErrorMessage: string = '';
  identityProofErrorMessage: string = '';
  otherPhoneErrorMessage: string = '';
  profileImageErrorMessage: string = '';

  role_id = 4;
  isIos = false;

  generalError: string = '';

  private readonly errorDisplayTime = 2000;
  private readonly maximumImageSize = 5 * 1024 * 1024;

  private errorTimer?: ReturnType<typeof setTimeout>;
  private generalErrorTimer?: ReturnType<typeof setTimeout>;

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

    /*
     * Yesterday is the maximum selectable date.
     * Today and future dates cannot be selected.
     */
    const yesterday = new Date();

    yesterday.setDate(yesterday.getDate() - 1);

    this.maxDate = this.formatDate(yesterday);
  }

  ngOnDestroy() {
    if (this.errorTimer) {
      clearTimeout(this.errorTimer);
    }

    if (this.generalErrorTimer) {
      clearTimeout(this.generalErrorTimer);
    }
  }

  goBack(): void {
    this.location.back();
  }

  private formatDate(date: Date): string {
    const year = date.getFullYear();

    const month = String(
      date.getMonth() + 1
    ).padStart(2, '0');

    const day = String(
      date.getDate()
    ).padStart(2, '0');

    return `${year}-${month}-${day}`;
  }

  private getTodayDate(): string {
    return this.formatDate(new Date());
  }

  private async presentLoading(
    message: string = 'Please wait...'
  ) {
    const loading = await this.loadingController.create({
      message: message
    });

    await loading.present();
  }

  private async dismissLoading() {
    try {
      await this.loadingController.dismiss();
    } catch {
      // Loading was already dismissed.
    }
  }

  private async presentToast(message: string) {
    const existingToast =
      await this.toastController.getTop();

    if (existingToast) {
      await existingToast.dismiss();
    }

    const toast = await this.toastController.create({
      message: message,
      duration: this.errorDisplayTime,
      color: 'danger',
      position: 'bottom'
    });

    await toast.present();
  }

  onAddressInput() {
    if (this.isAddressInvalid) {
      this.clearAllFieldErrors();
    }
  }

  onDobChange() {
    this.clearAllFieldErrors();

    if (!this.dob) {
      return;
    }

    const today = this.getTodayDate();

    if (this.dob >= today) {
      this.showSingleFieldError(
        'dob',
        'Date of birth must be older than today.'
      );
    }
  }

  onOtherPhoneInput(event: Event) {
    const input = event.target as HTMLInputElement;

    const numericValue = input.value
      .replace(/[^0-9]/g, '')
      .slice(0, 10);

    this.otherPhone = numericValue;
    input.value = numericValue;

    if (this.isOtherPhoneInvalid) {
      this.clearAllFieldErrors();
    }
  }

  validateOptionalPhone() {
    const phoneNumber = this.otherPhone.trim();

    /*
     * Other phone number is optional.
     */
    if (!phoneNumber) {
      this.clearAllFieldErrors();
      return true;
    }

    if (!/^[0-9]{10}$/.test(phoneNumber)) {
      this.showSingleFieldError(
        'otherPhone',
        'Please enter a valid 10-digit phone number.'
      );

      return false;
    }

    this.clearAllFieldErrors();

    return true;
  }

  onIdentityProofSelected(event: Event) {
    const input = event.target as HTMLInputElement;
    const selectedFile = input.files?.[0] || null;

    this.clearAllFieldErrors();

    if (!selectedFile) {
      this.identityProof = null;
      return;
    }

    const validationMessage =
      this.validateImageFile(selectedFile);

    if (validationMessage) {
      this.identityProof = null;
      input.value = '';

      this.showSingleFieldError(
        'identityProof',
        validationMessage
      );

      return;
    }

    this.identityProof = selectedFile;
  }

  onProfileImageSelected(event: Event) {
    const input = event.target as HTMLInputElement;
    const selectedFile = input.files?.[0] || null;

    this.clearAllFieldErrors();

    if (!selectedFile) {
      this.profileImage = null;
      return;
    }

    const validationMessage =
      this.validateImageFile(selectedFile);

    if (validationMessage) {
      this.profileImage = null;
      input.value = '';

      this.showSingleFieldError(
        'profileImage',
        validationMessage
      );

      return;
    }

    this.profileImage = selectedFile;
  }

  private validateImageFile(file: File): string {
    const allowedImageTypes = [
      'image/jpeg',
      'image/png',
      'image/webp'
    ];

    if (!allowedImageTypes.includes(file.type)) {
      return 'Please select a JPG, PNG or WEBP image.';
    }

    if (file.size > this.maximumImageSize) {
      return 'Image size must not exceed 5 MB.';
    }

    return '';
  }

  async NextStep() {
    /*
     * Clear previous error before checking the next field.
     */
    this.clearAllFieldErrors();
    this.clearGeneralError();

    /*
     * Validate fields one at a time.
     */
    if (!this.address.trim()) {
      await this.showValidationError(
        'address',
        'Please enter your address.'
      );

      return;
    }

    if (this.address.trim().length < 3) {
      await this.showValidationError(
        'address',
        'Please enter a valid address.'
      );

      return;
    }

    if (!this.dob) {
      await this.showValidationError(
        'dob',
        'Please select your date of birth.'
      );

      return;
    }

    const today = this.getTodayDate();

    if (this.dob >= today) {
      await this.showValidationError(
        'dob',
        'Date of birth must be older than today.'
      );

      return;
    }

    const selectedDate =
      new Date(`${this.dob}T00:00:00`);

    if (isNaN(selectedDate.getTime())) {
      await this.showValidationError(
        'dob',
        'Please select a valid date of birth.'
      );

      return;
    }

    if (!this.identityProof) {
      await this.showValidationError(
        'identityProof',
        'Please upload your identity proof.'
      );

      return;
    }

    /*
     * Phone number is optional.
     * Validate it only when a value is entered.
     */
    if (
      this.otherPhone.trim() &&
      !/^[0-9]{10}$/.test(this.otherPhone.trim())
    ) {
      await this.showValidationError(
        'otherPhone',
        'Please enter a valid 10-digit phone number.'
      );

      return;
    }

    if (!this.profileImage) {
      await this.showValidationError(
        'profileImage',
        'Please upload your profile image.'
      );

      return;
    }

    const token =
      await this.storage.get('token') ||
      await this.storage.get('user_token');

    if (!token || typeof token !== 'string') {
      const message =
        'Your session has expired. Please log in again.';

      this.showGeneralError(message);
      await this.presentToast(message);

      return;
    }

    let decoded: any;

    try {
      decoded = jwtDecode(token);
    } catch (error) {
      console.error('Token decode error:', error);

      const message =
        'Your session is invalid. Please log in again.';

      this.showGeneralError(message);
      await this.presentToast(message);

      return;
    }

    const user_id = decoded?.user_id;

    if (!user_id) {
      const message =
        'User information was not found. Please log in again.';

      this.showGeneralError(message);
      await this.presentToast(message);

      return;
    }

    const formData = new FormData();

    formData.append(
      'user_id',
      user_id.toString()
    );

    formData.append(
      'address',
      this.address.trim()
    );

    formData.append(
      'dob',
      this.dob
    );

    formData.append(
      'other_phone_number',
      this.otherPhone.trim()
    );

    formData.append(
      'role_id',
      this.role_id.toString()
    );

    if (this.identityProof) {
      formData.append(
        'identity_proof',
        this.identityProof,
        this.identityProof.name
      );
    }

    if (this.profileImage) {
      formData.append(
        'profile_pic',
        this.profileImage,
        this.profileImage.name
      );
    }

    await this.presentLoading('Saving details...');

    try {
      const personalDataObservable =
        await this.authservice.personlaData(formData);

      personalDataObservable.subscribe({
        next: async (response: {
          success: any;
          message: any;
        }) => {
          await this.dismissLoading();

          if (response && response.success) {
            console.log(
              'Step 2 API response:',
              response.message
            );

            this.router.navigate([
              'signup-step-2'
            ]);
          } else {
            const message =
              response?.message ||
              'Unable to save your details. Please try again.';

            console.log(message);

            this.showGeneralError(message);
            await this.presentToast(message);
          }
        },

        error: async (error: any) => {
          await this.dismissLoading();

          console.error('API error:', error);

          const message =
            error?.error?.message ||
            'Something went wrong. Please try again.';

          this.showGeneralError(message);
          await this.presentToast(message);
        }
      });
    } catch (error: any) {
      await this.dismissLoading();

      console.error('Submission error:', error);

      const message =
        error?.error?.message ||
        'Something went wrong. Please try again.';

      this.showGeneralError(message);
      await this.presentToast(message);
    }
  }

  private async showValidationError(
    field:
      | 'address'
      | 'dob'
      | 'identityProof'
      | 'otherPhone'
      | 'profileImage',
    message: string
  ) {
    this.showSingleFieldError(field, message);
    await this.presentToast(message);
  }

  private showSingleFieldError(
    field:
      | 'address'
      | 'dob'
      | 'identityProof'
      | 'otherPhone'
      | 'profileImage',
    message: string
  ) {
    /*
     * Always remove all old errors first.
     * This guarantees that only one field error is displayed.
     */
    this.clearAllFieldErrors();

    switch (field) {
      case 'address':
        this.isAddressInvalid = true;
        this.addressErrorMessage = message;
        break;

      case 'dob':
        this.isDobInvalid = true;
        this.dobErrorMessage = message;
        break;

      case 'identityProof':
        this.isIdentityProofInvalid = true;
        this.identityProofErrorMessage = message;
        break;

      case 'otherPhone':
        this.isOtherPhoneInvalid = true;
        this.otherPhoneErrorMessage = message;
        break;

      case 'profileImage':
        this.isProfileImageInvalid = true;
        this.profileImageErrorMessage = message;
        break;
    }

    this.errorTimer = setTimeout(() => {
      this.clearAllFieldErrors();
    }, this.errorDisplayTime);
  }

  private clearAllFieldErrors() {
    if (this.errorTimer) {
      clearTimeout(this.errorTimer);
      this.errorTimer = undefined;
    }

    this.isAddressInvalid = false;
    this.isDobInvalid = false;
    this.isIdentityProofInvalid = false;
    this.isOtherPhoneInvalid = false;
    this.isProfileImageInvalid = false;

    this.addressErrorMessage = '';
    this.dobErrorMessage = '';
    this.identityProofErrorMessage = '';
    this.otherPhoneErrorMessage = '';
    this.profileImageErrorMessage = '';
  }

  private showGeneralError(message: string) {
    this.clearGeneralError();

    this.generalError = message;

    this.generalErrorTimer = setTimeout(() => {
      this.generalError = '';
    }, this.errorDisplayTime);
  }

  private clearGeneralError() {
    if (this.generalErrorTimer) {
      clearTimeout(this.generalErrorTimer);
      this.generalErrorTimer = undefined;
    }

    this.generalError = '';
  }
}


