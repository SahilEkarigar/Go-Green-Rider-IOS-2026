import {
  Component,
  OnDestroy,
  OnInit
} from '@angular/core';

import {
  IonicModule,
  LoadingController
} from '@ionic/angular';

import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { CommonModule, Location } from '@angular/common';

import { AuthserviceService } from '../services/authservice.service';
import { Storage } from '@ionic/storage-angular';

import { jwtDecode } from 'jwt-decode';


import { addIcons } from 'ionicons';
import { chevronDownOutline } from 'ionicons/icons';

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


  isAccount_holder_nameInvalid = false;
  isInstitution_numberInvalid = false;
  isTransit_numberInvalid = false;
  isAccount_numberInvalid = false;
  isVoid_chequeInvoice = false;


  accountHolderNameErrorMessage: string = '';
  institutionNumberErrorMessage: string = '';
  transitNumberErrorMessage: string = '';
  accountNumberErrorMessage: string = '';
  voidChequeErrorMessage: string = '';


  role_id = 4;

  generalError: string = '';
  isKeyboardActive: boolean = false;


  private readonly errorDisplayTime = 8000;

  private readonly maximumFileSize =
    5 * 1024 * 1024;


  private validationTimer?:
    ReturnType<typeof setTimeout>;

  private generalErrorTimer?:
    ReturnType<typeof setTimeout>;


  constructor(
    private router: Router,
    private location: Location,
    private authservice: AuthserviceService,
    private storage: Storage,
    private loadingController: LoadingController
  ) {
    addIcons({ chevronDownOutline });
  }

  dismissKeyboard(): void {
    if (document.activeElement && document.activeElement instanceof HTMLElement) {
      document.activeElement.blur();
    }
    this.isKeyboardActive = false;
  }

  onInputFocus(): void {
    this.isKeyboardActive = true;
  }

  onInputBlur(): void {
    setTimeout(() => {
      const activeEl = document.activeElement;
      if (!activeEl || (activeEl.tagName !== 'INPUT' && activeEl.tagName !== 'SELECT' && activeEl.tagName !== 'TEXTAREA')) {
        this.isKeyboardActive = false;
      }
    }, 150);
  }


  async ngOnInit(): Promise<void> {

    await this.storage.create();

  }


  doRefresh(event: any): void {
    setTimeout(() => {
      event.target.complete();
    }, 800);
  }

  ngOnDestroy(): void {

    if (this.validationTimer) {

      clearTimeout(
        this.validationTimer
      );

      this.validationTimer =
        undefined;

    }


    if (this.generalErrorTimer) {

      clearTimeout(
        this.generalErrorTimer
      );

      this.generalErrorTimer =
        undefined;

    }

  }


  /* =====================================================
     NUMERIC INPUT
  ===================================================== */

  onNumericInput(
    event: Event,
    field: NumericField
  ): void {

    const input =
      event.target as HTMLInputElement;


    let maximumLength = 12;


    if (field === 'institution') {

      maximumLength = 3;

    }


    if (field === 'transit') {

      maximumLength = 5;

    }


    const numericValue =
      input.value
        .replace(
          /[^0-9]/g,
          ''
        )
        .slice(
          0,
          maximumLength
        );


    input.value =
      numericValue;


    if (field === 'institution') {

      this.institution_number =
        numericValue;


      this.clearFieldError(
        'institution'
      );

    }


    if (field === 'transit') {

      this.transit_number =
        numericValue;


      this.clearFieldError(
        'transit'
      );

    }


    if (field === 'account') {

      this.account_number =
        numericValue;


      this.clearFieldError(
        'account'
      );

    }

  }


  /* =====================================================
     FILE SELECT
  ===================================================== */

  onFileSelected(
    event: Event
  ): void {

    const input =
      event.target as HTMLInputElement;


    const selectedFile =
      input.files?.[0] || null;


    this.clearFieldError(
      'voidCheque'
    );


    if (!selectedFile) {

      this.void_cheque =
        null;

      return;

    }


    const allowedFileTypes = [
      'image/jpeg',
      'image/png',
      'image/webp',
      'application/pdf'
    ];


    if (
      !allowedFileTypes.includes(
        selectedFile.type
      )
    ) {

      this.void_cheque =
        null;

      input.value = '';


      this.showSingleFieldError(
        'voidCheque',
        'Please upload a JPG, PNG, WEBP or PDF document.'
      );


      return;

    }


    if (
      selectedFile.size >
      this.maximumFileSize
    ) {

      this.void_cheque =
        null;

      input.value = '';


      this.showSingleFieldError(
        'voidCheque',
        'The uploaded document must not exceed 5 MB.'
      );


      return;

    }


    this.void_cheque =
      selectedFile;

  }


  /* =====================================================
     BACK
  ===================================================== */

  goBack(): void {

    this.location.back();

  }


  /* =====================================================
     LOADER
  ===================================================== */

  private async presentLoading(
    message: string = 'Please wait...'
  ): Promise<void> {

    const loading =
      await this.loadingController.create({
        message
      });


    await loading.present();

  }


  private async dismissLoading():
    Promise<void> {

    try {

      await this.loadingController.dismiss();

    } catch {

      // Loader may already be dismissed.

    }

  }


  /* =====================================================
     SUBMIT BANK DETAILS
  ===================================================== */

  async NextStep(): Promise<void> {

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


    /* Account Holder */

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


    /* Institution */

    if (!this.institution_number) {

      this.showSingleFieldError(
        'institution',
        'Please enter the institution number.'
      );


      return;

    }


    if (
      !/^[0-9]{3}$/.test(
        this.institution_number
      )
    ) {

      this.showSingleFieldError(
        'institution',
        'Institution number must contain exactly 3 digits.'
      );


      return;

    }


    /* Transit */

    if (!this.transit_number) {

      this.showSingleFieldError(
        'transit',
        'Please enter the transit number.'
      );


      return;

    }


    if (
      !/^[0-9]{5}$/.test(
        this.transit_number
      )
    ) {

      this.showSingleFieldError(
        'transit',
        'Transit number must contain exactly 5 digits.'
      );


      return;

    }


    /* Account Number */

    if (!this.account_number) {

      this.showSingleFieldError(
        'account',
        'Please enter the account number.'
      );


      return;

    }


    if (
      !/^[0-9]{7,12}$/.test(
        this.account_number
      )
    ) {

      this.showSingleFieldError(
        'account',
        'Account number must contain 7 to 12 digits.'
      );


      return;

    }


    /* Token */

    const token =
      await this.storage.get(
        'token'
      ) ||
      await this.storage.get(
        'user_token'
      );


    if (
      !token ||
      typeof token !== 'string'
    ) {

      this.showGeneralError(
        'Your session has expired. Please log in again.'
      );


      return;

    }


    let decoded: any;


    try {

      decoded =
        jwtDecode(token);

    } catch (error) {

      console.error(
        'Token decode error:',
        error
      );


      this.showGeneralError(
        'Your session is invalid. Please log in again.'
      );


      return;

    }


    const user_id =
      decoded?.user_id;


    if (!user_id) {

      this.showGeneralError(
        'User information was not found. Please log in again.'
      );


      return;

    }


    /* Form Data */

    const formData =
      new FormData();


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

        next: async (
          response: any
        ) => {

          await this.dismissLoading();


          if (
            response &&
            response.success
          ) {

            // console.log(
            //   'Step 3 API response:',
            //   response.message
            // );


            await this.storage.remove(
              'token'
            );


            this.router.navigate([
              'application-review'
            ]);

          } else {

            this.showGeneralError(
              response?.message ||
              'Unable to save the bank details. Please try again.'
            );

          }

        },


        error: async (
          error: any
        ) => {

          await this.dismissLoading();


          console.error(
            'API error:',
            error
          );


          this.showGeneralError(
            error?.error?.message ||
            'Something went wrong. Please try again later.'
          );

        }

      });

    } catch (error: any) {

      await this.dismissLoading();


      console.error(
        'Submission error:',
        error
      );


      this.showGeneralError(
        error?.error?.message ||
        'Something went wrong. Please try again later.'
      );

    }

  }


  /* =====================================================
     SKIP BANK DETAILS
  ===================================================== */

  async skip_Step(): Promise<void> {

    this.clearAllFieldErrors();
    this.clearGeneralError();


    await this.storage.remove(
      'token'
    );


    this.router.navigate([
      'application-review'
    ]);

  }


  /* =====================================================
     SHOW FIELD ERROR
  ===================================================== */

  private showSingleFieldError(
    field: ValidationField,
    message: string
  ): void {

    this.clearAllFieldErrors();
    this.clearGeneralError();


    switch (field) {

      case 'accountHolderName':

        this.isAccount_holder_nameInvalid =
          true;

        this.accountHolderNameErrorMessage =
          message;

        break;


      case 'institution':

        this.isInstitution_numberInvalid =
          true;

        this.institutionNumberErrorMessage =
          message;

        break;


      case 'transit':

        this.isTransit_numberInvalid =
          true;

        this.transitNumberErrorMessage =
          message;

        break;


      case 'account':

        this.isAccount_numberInvalid =
          true;

        this.accountNumberErrorMessage =
          message;

        break;


      case 'voidCheque':

        this.isVoid_chequeInvoice =
          true;

        this.voidChequeErrorMessage =
          message;

        break;

    }


    this.validationTimer =
      setTimeout(() => {

        this.clearAllFieldErrors();

      }, this.errorDisplayTime);

  }


  /* =====================================================
     CLEAR SPECIFIC ERROR
  ===================================================== */

  clearFieldError(
    field: ValidationField
  ): void {

    switch (field) {

      case 'accountHolderName':

        if (
          this.isAccount_holder_nameInvalid
        ) {

          this.clearAllFieldErrors();

        }

        break;


      case 'institution':

        if (
          this.isInstitution_numberInvalid
        ) {

          this.clearAllFieldErrors();

        }

        break;


      case 'transit':

        if (
          this.isTransit_numberInvalid
        ) {

          this.clearAllFieldErrors();

        }

        break;


      case 'account':

        if (
          this.isAccount_numberInvalid
        ) {

          this.clearAllFieldErrors();

        }

        break;


      case 'voidCheque':

        if (
          this.isVoid_chequeInvoice
        ) {

          this.clearAllFieldErrors();

        }

        break;

    }

  }


  /* =====================================================
     CLEAR FIELD ERRORS
  ===================================================== */

  private clearAllFieldErrors(): void {

    if (this.validationTimer) {

      clearTimeout(
        this.validationTimer
      );


      this.validationTimer =
        undefined;

    }


    this.isAccount_holder_nameInvalid =
      false;

    this.isInstitution_numberInvalid =
      false;

    this.isTransit_numberInvalid =
      false;

    this.isAccount_numberInvalid =
      false;

    this.isVoid_chequeInvoice =
      false;


    this.accountHolderNameErrorMessage =
      '';

    this.institutionNumberErrorMessage =
      '';

    this.transitNumberErrorMessage =
      '';

    this.accountNumberErrorMessage =
      '';

    this.voidChequeErrorMessage =
      '';

  }


  /* =====================================================
     GENERAL ERROR
  ===================================================== */

  private showGeneralError(
    message: string
  ): void {

    this.clearAllFieldErrors();
    this.clearGeneralError();


    this.generalError =
      message;


    this.generalErrorTimer =
      setTimeout(() => {

        this.generalError = '';

      }, this.errorDisplayTime);

  }


  private clearGeneralError(): void {

    if (this.generalErrorTimer) {

      clearTimeout(
        this.generalErrorTimer
      );


      this.generalErrorTimer =
        undefined;

    }


    this.generalError =
      '';

  }

}