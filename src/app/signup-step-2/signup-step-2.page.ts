import {
  Component,
  OnDestroy,
  OnInit
} from '@angular/core';

import {
  IonicModule,
  ToastController,
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
  | 'licenseNumber'
  | 'licenseExpiry'
  | 'licenseImage'
  | 'ownerName'
  | 'registrationNumber'
  | 'vehicleType'
  | 'registrationExpiry'
  | 'registrationDocument';


@Component({
  selector: 'app-signup-step-2',
  templateUrl: './signup-step-2.page.html',
  styleUrls: ['./signup-step-2.page.scss'],
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    IonicModule
  ],
})
export class SignupStep2Page implements OnInit, OnDestroy {

  drivers_licenseNumber: string = '';
  licenseExpiryDate: string = '';
  licence_Image: File | null = null;

  vehicelOwnerName: string = '';
  vehicelRegistrationNumber: string = '';
  vehicelType: string = '';

  registrationExpiryDate: string = '';
  registrationDocument: File | null = null;

  minFutureDate: string = '';


  isDrivers_licenseNumberInvalid = false;
  isLicenseExpiryDateInvalid = false;
  isLicenceImageInvalid = false;

  isVehicelOwnerNameInvalid = false;
  isVehicelRegistrationNumberInvalid = false;
  isVehicelTypeInvalid = false;

  isRegistrationExpiryDateInvalid = false;
  isRegistrationDocumentInvalid = false;


  driversLicenseErrorMessage: string = '';
  licenseExpiryDateErrorMessage: string = '';
  licenceImageErrorMessage: string = '';

  vehicleOwnerNameErrorMessage: string = '';
  vehicleRegistrationErrorMessage: string = '';
  vehicleTypeErrorMessage: string = '';

  registrationExpiryDateErrorMessage: string = '';
  registrationDocumentErrorMessage: string = '';


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
    private toastController: ToastController,
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


    const tomorrow =
      new Date();


    tomorrow.setDate(
      tomorrow.getDate() + 1
    );


    this.minFutureDate =
      this.formatDate(tomorrow);

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


  goBack(): void {

    this.location.back();

  }


  private formatDate(
    date: Date
  ): string {

    const year =
      date.getFullYear();


    const month =
      String(
        date.getMonth() + 1
      ).padStart(
        2,
        '0'
      );


    const day =
      String(
        date.getDate()
      ).padStart(
        2,
        '0'
      );


    return `${year}-${month}-${day}`;

  }


  private getTodayDate(): string {

    return this.formatDate(
      new Date()
    );

  }


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


  private async presentToast(
    message: string
  ): Promise<void> {

    const previousToast =
      await this.toastController.getTop();


    if (previousToast) {

      await previousToast.dismiss();

    }


    const toast =
      await this.toastController.create({

        message,

        duration:
          this.errorDisplayTime,

        color:
          'danger',

        position:
          'bottom'

      });


    await toast.present();

  }


  onExpiryDateChange(
    type: 'license' | 'registration'
  ): void {

    this.clearAllFieldErrors();


    const today =
      this.getTodayDate();


    if (
      type === 'license' &&
      this.licenseExpiryDate &&
      this.licenseExpiryDate <= today
    ) {

      this.showSingleFieldError(
        'licenseExpiry',
        'License expiry date must be a future date.'
      );

      return;

    }


    if (
      type === 'registration' &&
      this.registrationExpiryDate &&
      this.registrationExpiryDate <= today
    ) {

      this.showSingleFieldError(
        'registrationExpiry',
        'Registration expiry date must be a future date.'
      );

    }

  }


  onRegistrationNumberInput(
    event: Event
  ): void {

    const input =
      event.target as HTMLInputElement;


    const cleanedValue =
      input.value
        .toUpperCase()
        .replace(
          /[^A-Z0-9 -]/g,
          ''
        );


    this.vehicelRegistrationNumber =
      cleanedValue;


    input.value =
      cleanedValue;


    this.clearFieldError(
      'registrationNumber'
    );

  }


  onFileSelected(
    event: Event,
    type: 'license' | 'registration'
  ): void {

    const input =
      event.target as HTMLInputElement;


    const selectedFile =
      input.files?.[0] || null;


    this.clearAllFieldErrors();


    if (!selectedFile) {

      if (
        type === 'license'
      ) {

        this.licence_Image = null;

      } else {

        this.registrationDocument = null;

      }


      return;

    }


    if (
      selectedFile.size >
      this.maximumFileSize
    ) {

      input.value = '';


      if (
        type === 'license'
      ) {

        this.licence_Image = null;


        this.showSingleFieldError(
          'licenseImage',
          'License image size must not exceed 5 MB.'
        );

      } else {

        this.registrationDocument = null;


        this.showSingleFieldError(
          'registrationDocument',
          'Registration document size must not exceed 5 MB.'
        );

      }


      return;

    }


    if (
      type === 'license'
    ) {

      const allowedImageTypes = [
        'image/jpeg',
        'image/png',
        'image/webp'
      ];


      if (
        !allowedImageTypes.includes(
          selectedFile.type
        )
      ) {

        this.licence_Image = null;

        input.value = '';


        this.showSingleFieldError(
          'licenseImage',
          'Please upload a JPG, PNG or WEBP license image.'
        );


        return;

      }


      this.licence_Image =
        selectedFile;

    }


    if (
      type === 'registration'
    ) {

      const allowedDocumentTypes = [
        'image/jpeg',
        'image/png',
        'image/webp',
        'application/pdf'
      ];


      if (
        !allowedDocumentTypes.includes(
          selectedFile.type
        )
      ) {

        this.registrationDocument = null;

        input.value = '';


        this.showSingleFieldError(
          'registrationDocument',
          'Please upload a JPG, PNG, WEBP or PDF document.'
        );


        return;

      }


      this.registrationDocument =
        selectedFile;

    }

  }


  async NextStep(): Promise<void> {

    this.clearAllFieldErrors();
    this.clearGeneralError();


    this.drivers_licenseNumber =
      this.drivers_licenseNumber.trim();


    this.vehicelOwnerName =
      this.vehicelOwnerName.trim();


    this.vehicelRegistrationNumber =
      this.vehicelRegistrationNumber.trim();


    this.vehicelType =
      this.vehicelType.trim();


    /* Driver license number */

    if (
      !this.drivers_licenseNumber
    ) {

      this.showSingleFieldError(
        'licenseNumber',
        'Please enter the driver’s license number.'
      );


      return;

    }


    if (
      !/^[A-Za-z0-9 -]{4,30}$/.test(
        this.drivers_licenseNumber
      )
    ) {

      this.showSingleFieldError(
        'licenseNumber',
        'Please enter a valid driver’s license number.'
      );


      return;

    }


    /* License expiry */

    if (
      !this.licenseExpiryDate
    ) {

      this.showSingleFieldError(
        'licenseExpiry',
        'Please select the license expiry date.'
      );


      return;

    }


    const today =
      this.getTodayDate();


    if (
      this.licenseExpiryDate <= today
    ) {

      this.showSingleFieldError(
        'licenseExpiry',
        'License expiry date must be a future date.'
      );


      return;

    }


    /* License image */

    if (
      !this.licence_Image
    ) {

      this.showSingleFieldError(
        'licenseImage',
        'Please upload the license image.'
      );


      return;

    }


    /* Vehicle owner */

    if (
      !this.vehicelOwnerName
    ) {

      this.showSingleFieldError(
        'ownerName',
        'Please enter the vehicle owner name.'
      );


      return;

    }


    if (
      this.vehicelOwnerName.length < 2 ||
      !/^[A-Za-zÀ-ÿ.' -]+$/.test(
        this.vehicelOwnerName
      )
    ) {

      this.showSingleFieldError(
        'ownerName',
        'Please enter a valid vehicle owner name.'
      );


      return;

    }


    /* Registration number */

    if (
      !this.vehicelRegistrationNumber
    ) {

      this.showSingleFieldError(
        'registrationNumber',
        'Please enter the vehicle registration number.'
      );


      return;

    }


    if (
      !/^[A-Z0-9 -]{4,25}$/.test(
        this.vehicelRegistrationNumber
      )
    ) {

      this.showSingleFieldError(
        'registrationNumber',
        'Please enter a valid vehicle registration number.'
      );


      return;

    }


    /* Vehicle type */

    if (
      !this.vehicelType
    ) {

      this.showSingleFieldError(
        'vehicleType',
        'Please enter the vehicle type.'
      );


      return;

    }


    if (
      this.vehicelType.length < 2
    ) {

      this.showSingleFieldError(
        'vehicleType',
        'Please enter a valid vehicle type.'
      );


      return;

    }


    /* Registration expiry */

    if (
      !this.registrationExpiryDate
    ) {

      this.showSingleFieldError(
        'registrationExpiry',
        'Please select the registration expiry date.'
      );


      return;

    }


    if (
      this.registrationExpiryDate <= today
    ) {

      this.showSingleFieldError(
        'registrationExpiry',
        'Registration expiry date must be a future date.'
      );


      return;

    }


    /* Registration document */

    if (
      !this.registrationDocument
    ) {

      this.showSingleFieldError(
        'registrationDocument',
        'Please upload the registration document.'
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

      await this.showGeneralError(
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


      await this.showGeneralError(
        'Your session is invalid. Please log in again.'
      );


      return;

    }


    const user_id =
      decoded?.user_id;


    if (!user_id) {

      await this.showGeneralError(
        'User information was not found. Please log in again.'
      );


      return;

    }


    /* API Form Data */

    const formData =
      new FormData();


    formData.append(
      'role_id',
      this.role_id.toString()
    );


    formData.append(
      'user_id',
      user_id.toString()
    );


    formData.append(
      'license_number',
      this.drivers_licenseNumber
    );


    formData.append(
      'license_expiry_date',
      this.licenseExpiryDate
    );


    formData.append(
      'rider_license_image',
      this.licence_Image,
      this.licence_Image.name
    );


    formData.append(
      'vehicle_owner_name',
      this.vehicelOwnerName
    );


    formData.append(
      'vehicle_registration_number',
      this.vehicelRegistrationNumber
    );


    formData.append(
      'vehicle_type',
      this.vehicelType
    );


    /*
     * Existing backend spelling retained intentionally.
     * Do not rename unless the API is also changed.
     */
    formData.append(
      'registraion_expiry_date',
      this.registrationExpiryDate
    );


    formData.append(
      'registration_doc',
      this.registrationDocument,
      this.registrationDocument.name
    );


    await this.presentLoading(
      'Saving details...'
    );


    try {

      const riderStepObservable =
        await this.authservice.registerRiderStep2(
          formData
        );


      riderStepObservable.subscribe({

        next: async (
          response: any
        ) => {

          await this.dismissLoading();


          if (
            response &&
            response.success
          ) {

            // console.log(
            //   'Step 2 API response:',
            //   response.message
            // );


            this.router.navigate([
              'signup-step-3'
            ]);

          } else {

            await this.showGeneralError(
              response?.message ||
              'Unable to save the details. Please try again.'
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


          await this.showGeneralError(
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


      await this.showGeneralError(
        error?.error?.message ||
        'Something went wrong. Please try again later.'
      );

    }

  }


  private showSingleFieldError(
    field: ValidationField,
    message: string
  ): void {

    this.clearAllFieldErrors();
    this.clearGeneralError();


    switch (field) {

      case 'licenseNumber':

        this.isDrivers_licenseNumberInvalid =
          true;

        this.driversLicenseErrorMessage =
          message;

        break;


      case 'licenseExpiry':

        this.isLicenseExpiryDateInvalid =
          true;

        this.licenseExpiryDateErrorMessage =
          message;

        break;


      case 'licenseImage':

        this.isLicenceImageInvalid =
          true;

        this.licenceImageErrorMessage =
          message;

        break;


      case 'ownerName':

        this.isVehicelOwnerNameInvalid =
          true;

        this.vehicleOwnerNameErrorMessage =
          message;

        break;


      case 'registrationNumber':

        this.isVehicelRegistrationNumberInvalid =
          true;

        this.vehicleRegistrationErrorMessage =
          message;

        break;


      case 'vehicleType':

        this.isVehicelTypeInvalid =
          true;

        this.vehicleTypeErrorMessage =
          message;

        break;


      case 'registrationExpiry':

        this.isRegistrationExpiryDateInvalid =
          true;

        this.registrationExpiryDateErrorMessage =
          message;

        break;


      case 'registrationDocument':

        this.isRegistrationDocumentInvalid =
          true;

        this.registrationDocumentErrorMessage =
          message;

        break;

    }


    this.validationTimer =
      setTimeout(() => {

        this.clearAllFieldErrors();

      }, this.errorDisplayTime);

  }


  clearFieldError(
    field: ValidationField
  ): void {

    switch (field) {

      case 'licenseNumber':

        if (
          this.isDrivers_licenseNumberInvalid
        ) {
          this.clearAllFieldErrors();
        }

        break;


      case 'licenseExpiry':

        if (
          this.isLicenseExpiryDateInvalid
        ) {
          this.clearAllFieldErrors();
        }

        break;


      case 'licenseImage':

        if (
          this.isLicenceImageInvalid
        ) {
          this.clearAllFieldErrors();
        }

        break;


      case 'ownerName':

        if (
          this.isVehicelOwnerNameInvalid
        ) {
          this.clearAllFieldErrors();
        }

        break;


      case 'registrationNumber':

        if (
          this.isVehicelRegistrationNumberInvalid
        ) {
          this.clearAllFieldErrors();
        }

        break;


      case 'vehicleType':

        if (
          this.isVehicelTypeInvalid
        ) {
          this.clearAllFieldErrors();
        }

        break;


      case 'registrationExpiry':

        if (
          this.isRegistrationExpiryDateInvalid
        ) {
          this.clearAllFieldErrors();
        }

        break;


      case 'registrationDocument':

        if (
          this.isRegistrationDocumentInvalid
        ) {
          this.clearAllFieldErrors();
        }

        break;

    }

  }


  private clearAllFieldErrors(): void {

    if (
      this.validationTimer
    ) {

      clearTimeout(
        this.validationTimer
      );


      this.validationTimer =
        undefined;

    }


    this.isDrivers_licenseNumberInvalid =
      false;

    this.isLicenseExpiryDateInvalid =
      false;

    this.isLicenceImageInvalid =
      false;

    this.isVehicelOwnerNameInvalid =
      false;

    this.isVehicelRegistrationNumberInvalid =
      false;

    this.isVehicelTypeInvalid =
      false;

    this.isRegistrationExpiryDateInvalid =
      false;

    this.isRegistrationDocumentInvalid =
      false;


    this.driversLicenseErrorMessage = '';
    this.licenseExpiryDateErrorMessage = '';
    this.licenceImageErrorMessage = '';

    this.vehicleOwnerNameErrorMessage = '';
    this.vehicleRegistrationErrorMessage = '';
    this.vehicleTypeErrorMessage = '';

    this.registrationExpiryDateErrorMessage = '';
    this.registrationDocumentErrorMessage = '';

  }


  private async showGeneralError(
    message: string
  ): Promise<void> {

    this.clearAllFieldErrors();
    this.clearGeneralError();


    this.generalError =
      message;


    this.generalErrorTimer =
      setTimeout(() => {

        this.generalError = '';

      }, this.errorDisplayTime);


    await this.presentToast(
      message
    );

  }


  private clearGeneralError(): void {

    if (
      this.generalErrorTimer
    ) {

      clearTimeout(
        this.generalErrorTimer
      );


      this.generalErrorTimer =
        undefined;

    }


    this.generalError = '';

  }

}