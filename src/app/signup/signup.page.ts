import {
  Component,
  OnInit,
  ViewChild,
  ElementRef,
  OnDestroy
} from '@angular/core';

import {
  IonicModule,
  Platform,
  LoadingController,
  AlertController
} from '@ionic/angular';

import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { CommonModule, Location } from '@angular/common';

import { AuthserviceService } from '../services/authservice.service';
import { Storage } from '@ionic/storage-angular';

import { jwtDecode } from 'jwt-decode';

import { GoogleAuthService } from '@app/services/google-auth.service';

import {
  SignInWithApple,
  ASAuthorizationAppleIDRequest
} from '@ionic-native/sign-in-with-apple/ngx';


import { addIcons } from 'ionicons';
import { chevronDownOutline } from 'ionicons/icons';

@Component({
  selector: 'app-signup',
  templateUrl: './signup.page.html',
  styleUrls: ['./signup.page.scss'],
  standalone: true,
  imports: [
    IonicModule,
    FormsModule,
    CommonModule
  ],
})
export class SignupPage implements OnInit, OnDestroy {

  fname = '';
  lname = '';
  email = '';
  phone = '';
  password = '';
  cpassword = '';

  showPassword: boolean = false;
  showCPassword: boolean = false;

  isFnameInvalid: boolean = false;
  isLnameInvalid: boolean = false;
  isEmailInvalid: boolean = false;
  isPhoneInvalid: boolean = false;
  isPSWInvalid: boolean = false;
  isCPSWInvalid: boolean = false;

  prefix = '+1';
  role_id = 4;

  isIos = false;

  riderImagePreview: string | ArrayBuffer | null = null;
  proofImagePreview: string | ArrayBuffer | null = null;

  googleAuthToken = '';

  generalError: string = '';
  errorField: string = '';

  loading: boolean = false;
  isAppleAvailable = false;
  emailTouched: boolean = false;

  isKeyboardActive: boolean = false;

  private errorTimer: ReturnType<typeof setTimeout> | null = null;

  constructor(
    private platform: Platform,
    private router: Router,
    private location: Location,
    private authservice: AuthserviceService,
    private storage: Storage,
    private googleAuthService: GoogleAuthService,
    private signInWithApple: SignInWithApple,
    private loadingController: LoadingController,
    private alertController: AlertController
  ) {
    addIcons({ chevronDownOutline });
    this.init();
  }

  private async showUnverifiedUserPopup(message: string): Promise<void> {
    const alert = await this.alertController.create({
      header: 'Account Notice',
      message: message || 'User already exists but not verified. Complete profile.',
      buttons: ['OK'],
      cssClass: 'unverified-user-alert'
    });
    await alert.present();
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


  @ViewChild('fileInput')
  fileInput!: ElementRef<HTMLInputElement>;

  @ViewChild('cameraInput')
  cameraInput!: ElementRef<HTMLInputElement>;

  @ViewChild('proofFileInput')
  proofFileInput!: ElementRef<HTMLInputElement>;

  @ViewChild('proofCameraInput')
  proofCameraInput!: ElementRef<HTMLInputElement>;


  async ngOnInit(): Promise<void> {

    this.isIos =
      this.platform.is('ios');


    this.isAppleAvailable =
      this.platform.is('ios') &&
      (
        this.platform.is('hybrid') ||
        this.platform.is('capacitor') ||
        this.platform.is('cordova')
      );

  }


  doRefresh(event: any): void {
    setTimeout(() => {
      event.target.complete();
    }, 800);
  }

  ngOnDestroy(): void {

    if (this.errorTimer) {

      clearTimeout(
        this.errorTimer
      );

      this.errorTimer = null;

    }

  }


  async init(): Promise<void> {

    await this.storage.create();

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


  private async dismissLoading(): Promise<void> {

    try {

      await this.loadingController.dismiss();

    } catch {

      // Loader may already be dismissed.

    }

  }


  goBack(): void {

    this.location.back();

  }


  togglePassword(): void {

    this.showPassword =
      !this.showPassword;

  }


  toggleCPassword(): void {

    this.showCPassword =
      !this.showCPassword;

  }


  private resetValidationFlags(): void {

    this.isFnameInvalid = false;
    this.isLnameInvalid = false;
    this.isEmailInvalid = false;
    this.isPhoneInvalid = false;
    this.isPSWInvalid = false;
    this.isCPSWInvalid = false;

  }


  private showSingleError(
    field: string,
    message: string,
    shouldFocus: boolean = true
  ): void {

    if (this.errorTimer) {

      clearTimeout(
        this.errorTimer
      );

      this.errorTimer = null;

    }


    this.resetValidationFlags();


    this.errorField =
      field;


    this.generalError =
      message;


    switch (field) {

      case 'fname':

        this.isFnameInvalid = true;

        break;


      case 'lname':

        this.isLnameInvalid = true;

        break;


      case 'email':

        this.isEmailInvalid = true;

        break;


      case 'phone':

        this.isPhoneInvalid = true;

        break;


      case 'password':

        this.isPSWInvalid = true;

        break;


      case 'cpassword':

        this.isCPSWInvalid = true;

        break;

    }


    if (
      shouldFocus &&
      field !== 'general'
    ) {

      this.focusField(
        field
      );

    }


    this.errorTimer =
      setTimeout(() => {

        this.clearAllErrors();

      }, 8000);

  }


  private focusField(
    field: string
  ): void {

    setTimeout(() => {

      const element =
        document.getElementById(
          field
        ) as HTMLInputElement | null;


      if (element) {

        element.focus();

      }

    }, 100);

  }


  private clearAllErrors(): void {

    if (this.errorTimer) {

      clearTimeout(
        this.errorTimer
      );

      this.errorTimer = null;

    }


    this.generalError = '';
    this.errorField = '';


    this.resetValidationFlags();

  }


  clearFieldError(
    field: string
  ): void {

    if (
      this.errorField !== field
    ) {

      return;

    }


    this.clearAllErrors();

  }


  private async handleSuccessfulLogin(
    response: any
  ): Promise<void> {

    try {

      const decoded: any =
        jwtDecode(
          response.token
        );


      const user_id =
        decoded?.user_id;


      await this.storage.set(
        'user_id',
        user_id
      );


      await this.storage.set(
        'role_id',
        this.role_id
      );


      localStorage.setItem(
        'user_id',
        String(user_id)
      );


      if (
        response.is_verified === 0
      ) {

        this.router.navigate([
          'application-review'
        ]);

        return;

      }


      if (
        response.verification_Done === 0
      ) {

        this.router.navigate([
          'signup-step-2'
        ]);

        return;

      }


      if (
        response.is_verified === 2
      ) {

        this.showSingleError(
          'general',
          'Your rider application has been rejected.',
          false
        );

        return;

      }


      if (
        response.is_verified === 3
      ) {

        this.router.navigate([
          'application-review'
        ]);

        return;

      }


      if (
        response.is_verified === 1
      ) {

        await this.storage.set(
          'token',
          response.token
        );


        this.router
          .navigate([
            'home'
          ])
          .then(async () => {

            const data = {

              user_id: user_id,

              fcmToken:
                await this.storage.get(
                  'FCM_TOKEN'
                )

            };


            await this.presentLoading(
              'Syncing device...'
            );


            this.authservice
              .sendFCMToken(data)
              .subscribe({

                next: async (
                  sendTokenResponse: any
                ) => {

                  if (
                    sendTokenResponse?.success
                  ) {

                    // console.log(
                    //   sendTokenResponse.message
                    // );

                  } else {

                    // console.log(
                    //   sendTokenResponse?.message ||
                    //   'Submission failed'
                    // );

                  }


                  await this.dismissLoading();

                },


                error: async (
                  error: any
                ) => {

                  console.error(
                    'API error:',
                    error
                  );


                  await this.dismissLoading();


                  this.showSingleError(
                    'general',
                    error?.error?.message ||
                    'An error occurred while syncing the device.',
                    false
                  );

                }

              });

          });

      }

    } catch (error) {

      console.error(
        'Post-login handling failed:',
        error
      );


      this.showSingleError(
        'general',
        'An error occurred after login.',
        false
      );

    }

  }


  onEmailBlur(): void {

    this.emailTouched =
      true;


    const trimmedEmail =
      this.email.trim();


    if (!trimmedEmail) {

      this.showSingleError(
        'email',
        'Email address is required.',
        false
      );

      return;

    }


    if (
      !this.isValidEmail(
        trimmedEmail
      )
    ) {

      this.showSingleError(
        'email',
        'Please enter a valid email address.',
        false
      );

    }

  }


  isValidEmail(
    email: string
  ): boolean {

    const emailRegex =
      /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9-]+(?:\.[a-zA-Z]{2,})+$/;


    return emailRegex.test(
      email.trim()
    );

  }


  async NextStep(): Promise<void> {

    if (this.loading) {

      return;

    }


    this.clearAllErrors();


    this.fname =
      this.fname.trim();

    this.lname =
      this.lname.trim();

    this.email =
      this.email.trim();

    this.phone =
      this.phone.trim();


    if (!this.fname) {

      this.showSingleError(
        'fname',
        'First name is required.'
      );

      return;

    }


    if (!this.lname) {

      this.showSingleError(
        'lname',
        'Last name is required.'
      );

      return;

    }


    if (!this.email) {

      this.showSingleError(
        'email',
        'Email address is required.'
      );

      return;

    }


    if (
      !this.isValidEmail(
        this.email
      )
    ) {

      this.showSingleError(
        'email',
        'Please enter a valid email address.'
      );

      return;

    }


    if (!this.phone) {

      this.showSingleError(
        'phone',
        'Mobile number is required.'
      );

      return;

    }


    if (
      !this.isValidPhone(
        this.phone
      )
    ) {

      this.showSingleError(
        'phone',
        'Mobile number must be exactly 10 digits.'
      );

      return;

    }


    if (
      !this.password.trim()
    ) {

      this.showSingleError(
        'password',
        'Password is required.'
      );

      return;

    }


    if (
      !this.cpassword.trim()
    ) {

      this.showSingleError(
        'cpassword',
        'Confirm password is required.'
      );

      return;

    }


    if (
      this.password !==
      this.cpassword
    ) {

      this.showSingleError(
        'cpassword',
        'Password and confirm password do not match.'
      );

      return;

    }


    const data = {

      firstname:
        this.fname,

      lastname:
        this.lname,

      email:
        this.email,

      password:
        this.password,

      role_id:
        this.role_id,

      phonenumber:
        this.phone,

      prefix:
        this.prefix

    };


    this.loading = true;


    await this.presentLoading(
      'Signing up...'
    );


    this.authservice
      .registerRider(data)
      .subscribe({

        next: async (
          response: any
        ) => {

          this.loading = false;


          await this.dismissLoading();


          if (
            response?.token
          ) {

            await this.storage.set(
              'token',
              response.token
            );


            await this.handleSignUpSuccess(
              response
            );


            this.fname = '';
            this.lname = '';
            this.email = '';
            this.phone = '';
            this.password = '';
            this.cpassword = '';

            this.prefix = '+1';


            this.router.navigate([
              'signup-step-4'
            ]);

          } else {

            const responseMsg =
              response?.message || '';

            const normalizedMsg =
              String(responseMsg).toLowerCase();


            if (
              normalizedMsg.includes('user already exists but not verified') ||
              normalizedMsg.includes('complete profile')
            ) {

              await this.showUnverifiedUserPopup(
                responseMsg || 'User already exists but not verified. Complete profile.'
              );

              return;

            }


            this.showSingleError(
              'general',
              responseMsg ||
              'Registration failed. Please try again.',
              false
            );

          }

        },


        error: async (
          error: any
        ) => {

          this.loading = false;


          await this.dismissLoading();


          console.error(
            'Registration API error:',
            error
          );


          const apiErrorMessage =

            error?.error?.error ||

            error?.error?.message ||

            error?.message ||

            '';


          const normalizedError =
            String(
              apiErrorMessage
            ).toLowerCase();


          if (
            normalizedError.includes('user already exists but not verified') ||
            normalizedError.includes('complete profile')
          ) {

            await this.showUnverifiedUserPopup(
              apiErrorMessage || 'User already exists but not verified. Complete profile.'
            );

            return;

          }


          if (
            normalizedError.includes(
              'phone already exist'
            ) ||
            normalizedError.includes(
              'phone number already exist'
            ) ||
            normalizedError.includes(
              'phone number already registered'
            )
          ) {

            this.showSingleError(
              'phone',
              'This mobile number is already registered. Please use another number.'
            );

            return;

          }


          if (
            normalizedError.includes(
              'email already exist'
            ) ||
            normalizedError.includes(
              'email already registered'
            )
          ) {

            this.showSingleError(
              'email',
              'This email address is already registered. Please use another email.'
            );

            return;

          }


          this.showSingleError(
            'general',
            apiErrorMessage ||
            'An error occurred during registration. Please try again.',
            false
          );

        }

      });

  }


  async handleSignUpSuccess(
    response: any
  ): Promise<void> {

    if (
      response?.token
    ) {

      try {

        const decoded: any =
          jwtDecode(
            response.token
          );


        const user_id =
          decoded?.user_id;


        await this.storage.set(
          'user_token',
          response.token
        );


        await this.storage.set(
          'user_id',
          user_id
        );


        localStorage.setItem(
          'user_id',
          String(user_id)
        );


        await this.storage.set(
          'user_details',
          JSON.stringify({

            name:
              `${this.fname} ${this.lname}`,

            email:
              this.email,

            user_id:
              user_id

          })
        );


        // console.log(
        //   'user_id',
        //   user_id
        // );

      } catch (error) {

        console.error(
          'Invalid token received:',
          error
        );


        this.showSingleError(
          'general',
          'A valid user token was not received.',
          false
        );

      }

    } else {

      console.warn(
        'Signup response does not contain a valid token.'
      );

    }

  }


  async loginOrSignupWithGoogle(): Promise<void> {

    try {

      const result =
        await this.googleAuthService.googleAuth();


      // console.log(
      //   'Google authentication result:',
      //   result
      // );


      this.googleAuthToken =
        result.token;


      const data = {

        role_id:
          this.role_id,

        googleauthToken:
          this.googleAuthToken

      };


      this.authservice
        .registerRider(data)
        .subscribe({

          next: async (
            response: any
          ) => {

            if (
              response?.success
            ) {

              await this.handleSuccessfulLogin(
                response
              );

            } else {

              this.showSingleError(
                'general',
                response?.message ||
                'Google login failed. Please try again.',
                false
              );

            }

          },


          error: (
            error: any
          ) => {

            console.error(
              'Google registration error:',
              error
            );


            this.showSingleError(
              'general',
              error?.error?.message ||
              'Google login failed. Please try again.',
              false
            );

          }

        });

    } catch (error) {

      console.error(
        'Google Auth Failed:',
        error
      );


      this.showSingleError(
        'general',
        'Google authentication could not be completed.',
        false
      );

    }

  }


  async appleSignIn(): Promise<void> {

    try {

      const result =
        await this.signInWithApple.signin({

          requestedScopes: [

            ASAuthorizationAppleIDRequest
              .ASAuthorizationScopeFullName,

            ASAuthorizationAppleIDRequest
              .ASAuthorizationScopeEmail

          ]

        });


      // console.log(
      //   'Apple Sign-In success:',
      //   result
      // );


      const appleAuthToken =
        result.identityToken;


      const data = {

        role_id:
          this.role_id,

        appleAuthToken:
          appleAuthToken

      };


      this.authservice
        .login(data)
        .subscribe({

          next: async (
            response: any
          ) => {

            if (
              response?.success
            ) {

              await this.handleSuccessfulLogin(
                response
              );

            } else {

              console.error(
                'Apple login failed:',
                response
              );


              this.showSingleError(
                'general',
                response?.message ||
                'Apple login failed. Please try again.',
                false
              );

            }

          },


          error: (
            error: any
          ) => {

            console.error(
              'Apple login API error:',
              error
            );


            this.showSingleError(
              'general',
              error?.error?.message ||
              'Apple login failed. Please try again.',
              false
            );

          }

        });

    } catch (error) {

      console.error(
        'Apple Sign-In error:',
        error
      );


      this.showSingleError(
        'general',
        'Apple Sign-In could not be completed.',
        false
      );

    }

  }


  onPhoneInput(
    event: Event
  ): void {

    const input =
      event.target as HTMLInputElement;


    let value =
      input.value.replace(
        /\D/g,
        ''
      );


    if (
      value.length > 10
    ) {

      value =
        value.substring(
          0,
          10
        );

    }


    input.value =
      value;


    this.phone =
      value;


    this.clearFieldError(
      'phone'
    );

  }


  allowOnlyNumbers(
    event: KeyboardEvent
  ): void {

    const allowedKeys = [

      'Backspace',
      'Delete',
      'Tab',
      'ArrowLeft',
      'ArrowRight',
      'ArrowUp',
      'ArrowDown',
      'Home',
      'End',
      'Enter'

    ];


    if (
      allowedKeys.includes(
        event.key
      )
    ) {

      return;

    }


    if (
      event.ctrlKey ||
      event.metaKey
    ) {

      return;

    }


    if (
      !/^[0-9]$/.test(
        event.key
      )
    ) {

      event.preventDefault();

    }

  }


  isValidPhone(
    phone: string
  ): boolean {

    return /^[0-9]{10}$/.test(
      phone.trim()
    );

  }

}