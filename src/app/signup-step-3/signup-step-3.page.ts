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

type ValidationField =
  | 'accountHolderName'
  | 'institution'
  | 'transit'
  | 'account'
  | 'voidCheque';

type NumericField =
  | 'institution'
  | 'transit'
  | 'account';

@Component({
  selector: 'app-signup-step-3',
  templateUrl: './signup-step-3.page.html',
  styleUrls: ['./signup-step-3.page.scss'],
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    IonicModule
  ],
})
export class SignupStep3Page implements OnInit, OnDestroy {

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

  // Professional field error messages
  accountHolderNameErrorMessage: string = '';
  institutionNumberErrorMessage: string = '';
  transitNumberErrorMessage: string = '';
  accountNumberErrorMessage: string = '';
  voidChequeErrorMessage: string = '';

  role_id = 4;
  isIos = false;
  generalError = '';

  private readonly errorDisplayTime = 2000;
  private readonly maximumFileSize = 5 * 1024 * 1024;

  private validationTimer?: ReturnType<typeof setTimeout>;
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
  }

  ngOnDestroy() {
    if (this.validationTimer) {
      clearTimeout(this.validationTimer);
    }

    if (this.generalErrorTimer) {
      clearTimeout(this.generalErrorTimer);
    }
  }

  /**
   * Allow only numeric characters while preserving leading zeroes.
   */
  onNumericInput(
    event: Event,
    field: NumericField
  ) {
    const input = event.target as HTMLInputElement;

    let maximumLength = 12;

    if (field === 'institution') {
      maximumLength = 3;
    }

    if (field === 'transit') {
      maximumLength = 5;
    }

    const numericValue = input.value
      .replace(/[^0-9]/g, '')
      .slice(0, maximumLength);

    input.value = numericValue;

    if (field === 'institution') {
      this.institution_number = numericValue;
      this.clearFieldError('institution');
    }

    if (field === 'transit') {
      this.transit_number = numericValue;
      this.clearFieldError('transit');
    }

    if (field === 'account') {
      this.account_number = numericValue;
      this.clearFieldError('account');
    }
  }

  /**
   * Void cheque is optional.
   * It is validated only when a file is selected.
   */
  onFileSelected(event: Event) {
    const input = event.target as HTMLInputElement;
    const selectedFile = input.files?.[0] || null;

    this.clearFieldError('voidCheque');

    if (!selectedFile) {
      this.void_cheque = null;
      return;
    }

    const allowedFileTypes = [
      'image/jpeg',
      'image/png',
      'image/webp',
      'application/pdf'
    ];

    if (!allowedFileTypes.includes(selectedFile.type)) {
      this.void_cheque = null;
      input.value = '';

      this.showSingleFieldError(
        'voidCheque',
        'Please upload a JPG, PNG, WEBP or PDF document.'
      );

      return;
    }

    if (selectedFile.size > this.maximumFileSize) {
      this.void_cheque = null;
      input.value = '';

      this.showSingleFieldError(
        'voidCheque',
        'The uploaded document must not exceed 5 MB.'
      );

      return;
    }

    this.void_cheque = selectedFile;
  }

  goBack(): void {
    this.location.back();
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

  /**
   * Toasts also automatically close after 2 seconds.
   */
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

  async NextStep() {
    /*
     * Clear any previous error before checking the form.
     * Validation stops at the first invalid field.
     */
    this.clearAllFieldErrors();
    this.clearGeneralError();

    this.account_holder_name =
      this.account_holder_name.trim();

    this.institution_number =
      this.institution_number.trim();

    this.transit_number =
      this.transit_number.trim();

    this.account_number =
      this.account_number.trim();

    /*
     * Account holder name validation.
     */
    if (!this.account_holder_name) {
      this.showSingleFieldError(
        'accountHolderName',
        'Please enter the account holder name.'
      );

      return;
    }

    if (
      this.account_holder_name.length < 2 ||
      !/^[A-Za-zÀ-ÿ.' -]+$/.test(
        this.account_holder_name
      )
    ) {
      this.showSingleFieldError(
        'accountHolderName',
        'Please enter a valid account holder name.'
      );

      return;
    }

    /*
     * Institution number validation.
     */
    if (!this.institution_number) {
      this.showSingleFieldError(
        'institution',
        'Please enter the institution number.'
      );

      return;
    }

    if (!/^[0-9]{3}$/.test(this.institution_number)) {
      this.showSingleFieldError(
        'institution',
        'Institution number must contain exactly 3 digits.'
      );

      return;
    }

    /*
     * Transit number validation.
     */
    if (!this.transit_number) {
      this.showSingleFieldError(
        'transit',
        'Please enter the transit number.'
      );

      return;
    }

    if (!/^[0-9]{5}$/.test(this.transit_number)) {
      this.showSingleFieldError(
        'transit',
        'Transit number must contain exactly 5 digits.'
      );

      return;
    }

    /*
     * Account number validation.
     */
    if (!this.account_number) {
      this.showSingleFieldError(
        'account',
        'Please enter the account number.'
      );

      return;
    }

    if (!/^[0-9]{7,12}$/.test(this.account_number)) {
      this.showSingleFieldError(
        'account',
        'Account number must contain 7 to 12 digits.'
      );

      return;
    }

    /*
     * Void cheque is optional, so no required validation is applied.
     */

    const token =
      await this.storage.get('token') ||
      await this.storage.get('user_token');

    if (!token || typeof token !== 'string') {
      console.error(
        'No valid token found in storage.'
      );

      await this.showGeneralError(
        'Your session has expired. Please log in again.'
      );

      return;
    }

    let decoded: any;

    try {
      decoded = jwtDecode(token);
    } catch (error) {
      console.error('Token decode error:', error);

      await this.showGeneralError(
        'Your session is invalid. Please log in again.'
      );

      return;
    }

    const user_id = decoded?.user_id;

    if (!user_id) {
      await this.showGeneralError(
        'User information was not found. Please log in again.'
      );

      return;
    }

    const formData = new FormData();

    formData.append(
      'user_id',
      user_id.toString()
    );

    formData.append(
      'role_id',
      this.role_id.toString()
    );

    formData.append(
      'account_holder_name',
      this.account_holder_name
    );

    formData.append(
      'transit_number',
      this.transit_number
    );

    formData.append(
      'institution_number',
      this.institution_number
    );

    formData.append(
      'account_number',
      this.account_number
    );

    if (this.void_cheque) {
      formData.append(
        'void_cheque',
        this.void_cheque,
        this.void_cheque.name
      );
    }

    await this.presentLoading(
      'Saving bank details...'
    );

    try {
      const bankDetailsObservable =
        await this.authservice.addBankDetails(
          formData
        );

      bankDetailsObservable.subscribe({
        next: async (response: any) => {
          await this.dismissLoading();

          if (response && response.success) {
            console.log(
              'Step 3 API response:',
              response.message
            );

            await this.storage.remove('token');

            this.router.navigate([
              'application-review'
            ]);
          } else {
            await this.showGeneralError(
              response?.message ||
              'Unable to save the bank details. Please try again.'
            );
          }
        },

        error: async (error: any) => {
          await this.dismissLoading();

          console.error('API error:', error);

          await this.showGeneralError(
            error?.error?.message ||
            'Something went wrong. Please try again later.'
          );
        }
      });
    } catch (error: any) {
      await this.dismissLoading();

      console.error('Submission error:', error);

      await this.showGeneralError(
        error?.error?.message ||
        'Something went wrong. Please try again later.'
      );
    }
  }

  async skip_Step(): Promise<void> {
    this.clearAllFieldErrors();
    this.clearGeneralError();

    await this.storage.remove('token');

    this.router.navigate([
      'application-review'
    ]);
  }

  /**
   * Show only one inline field error.
   * The error automatically disappears after 2 seconds.
   */
  private showSingleFieldError(
    field: ValidationField,
    message: string
  ) {
    this.clearAllFieldErrors();
    this.clearGeneralError();

    switch (field) {
      case 'accountHolderName':
        this.isAccount_holder_nameInvalid = true;
        this.accountHolderNameErrorMessage = message;
        break;

      case 'institution':
        this.isInstitution_numberInvalid = true;
        this.institutionNumberErrorMessage = message;
        break;

      case 'transit':
        this.isTransit_numberInvalid = true;
        this.transitNumberErrorMessage = message;
        break;

      case 'account':
        this.isAccount_numberInvalid = true;
        this.accountNumberErrorMessage = message;
        break;

      case 'voidCheque':
        this.isVoid_chequeInvoice = true;
        this.voidChequeErrorMessage = message;
        break;
    }

    this.validationTimer = setTimeout(() => {
      this.clearAllFieldErrors();
    }, this.errorDisplayTime);
  }

  /**
   * Remove the active error when the user starts correcting it.
   */
  clearFieldError(field: ValidationField) {
    switch (field) {
      case 'accountHolderName':
        if (this.isAccount_holder_nameInvalid) {
          this.clearAllFieldErrors();
        }
        break;

      case 'institution':
        if (this.isInstitution_numberInvalid) {
          this.clearAllFieldErrors();
        }
        break;

      case 'transit':
        if (this.isTransit_numberInvalid) {
          this.clearAllFieldErrors();
        }
        break;

      case 'account':
        if (this.isAccount_numberInvalid) {
          this.clearAllFieldErrors();
        }
        break;

      case 'voidCheque':
        if (this.isVoid_chequeInvoice) {
          this.clearAllFieldErrors();
        }
        break;
    }
  }

  private clearAllFieldErrors() {
    if (this.validationTimer) {
      clearTimeout(this.validationTimer);
      this.validationTimer = undefined;
    }

    this.isAccount_holder_nameInvalid = false;
    this.isInstitution_numberInvalid = false;
    this.isTransit_numberInvalid = false;
    this.isAccount_numberInvalid = false;
    this.isVoid_chequeInvoice = false;

    this.accountHolderNameErrorMessage = '';
    this.institutionNumberErrorMessage = '';
    this.transitNumberErrorMessage = '';
    this.accountNumberErrorMessage = '';
    this.voidChequeErrorMessage = '';
  }

  /**
   * API and session errors appear separately and disappear after 2 seconds.
   */
  private async showGeneralError(message: string) {
    this.clearAllFieldErrors();
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

