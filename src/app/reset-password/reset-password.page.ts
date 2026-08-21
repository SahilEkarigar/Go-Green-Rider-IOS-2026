import {
  Component,
  OnDestroy,
  OnInit
} from '@angular/core';

import {
  CommonModule,
  Location
} from '@angular/common';

import {
  FormsModule
} from '@angular/forms';

import {
  ActivatedRoute,
  Router
} from '@angular/router';

import {
  IonicModule
} from '@ionic/angular';

import {
  AuthserviceService
} from '../services/authservice.service';


@Component({
  selector: 'app-reset-password',
  templateUrl: './reset-password.page.html',
  styleUrls: ['./reset-password.page.scss'],
  standalone: true,
  imports: [
    IonicModule,
    CommonModule,
    FormsModule
  ]
})
export class ResetPasswordPage implements OnInit, OnDestroy {

  email: string = '';

  otp: number = 0;

  password: string = '';

  new_password: string = '';

  loading: boolean = false;


  generalError: string = '';


  isPasswordInvalid: boolean = false;

  isConfirmPasswordInvalid: boolean = false;


  passwordErrorMessage: string = '';

  confirmPasswordErrorMessage: string = '';


  private errorTimer:
    ReturnType<typeof setTimeout> | null = null;


  constructor(
    private router: Router,
    private route: ActivatedRoute,
    private location: Location,
    private authService: AuthserviceService
  ) {}


  /* =====================================================
     INIT
  ===================================================== */

  ngOnInit(): void {

    this.email =
      (
        this.route.snapshot
          .queryParamMap
          .get('email') || ''
      ).trim();


    const otpValue =
      this.route.snapshot
        .queryParamMap
        .get('otp');


    this.otp =
      otpValue
        ? Number(otpValue)
        : 0;

  }


  /* =====================================================
     DESTROY
  ===================================================== */

  ngOnDestroy(): void {

    if (this.errorTimer) {

      clearTimeout(
        this.errorTimer
      );


      this.errorTimer = null;

    }

  }


  /* =====================================================
     BACK
  ===================================================== */

  doRefresh(event: any): void {
    setTimeout(() => {
      event.target.complete();
    }, 800);
  }

  goBack(): void {

    this.location.back();

  }


  /* =====================================================
     CLEAR ERROR
  ===================================================== */

  clearError(
    field:
      | 'password'
      | 'confirmPassword'
  ): void {

    if (field === 'password') {

      this.isPasswordInvalid =
        false;


      this.passwordErrorMessage =
        '';

    }


    if (
      field === 'confirmPassword'
    ) {

      this.isConfirmPasswordInvalid =
        false;


      this.confirmPasswordErrorMessage =
        '';

    }


    this.generalError = '';


    if (this.errorTimer) {

      clearTimeout(
        this.errorTimer
      );


      this.errorTimer = null;

    }

  }


  /* =====================================================
     FIELD ERROR
  ===================================================== */

  private showFieldError(
    field:
      | 'password'
      | 'confirmPassword',
    message: string
  ): void {

    this.clearAllErrors();


    if (
      field === 'password'
    ) {

      this.isPasswordInvalid =
        true;


      this.passwordErrorMessage =
        message;

    }


    if (
      field === 'confirmPassword'
    ) {

      this.isConfirmPasswordInvalid =
        true;


      this.confirmPasswordErrorMessage =
        message;

    }


    this.startErrorTimer();

  }


  /* =====================================================
     GENERAL ERROR
  ===================================================== */

  private showGeneralError(
    message: string
  ): void {

    this.clearAllErrors();


    this.generalError =
      message;


    this.startErrorTimer();

  }


  /* =====================================================
     ERROR TIMER
  ===================================================== */

  private startErrorTimer(): void {

    if (this.errorTimer) {

      clearTimeout(
        this.errorTimer
      );

    }


    this.errorTimer =
      setTimeout(() => {

        this.clearAllErrors();

      }, 2500);

  }


  /* =====================================================
     CLEAR ALL ERRORS
  ===================================================== */

  private clearAllErrors(): void {

    if (this.errorTimer) {

      clearTimeout(
        this.errorTimer
      );


      this.errorTimer = null;

    }


    this.isPasswordInvalid =
      false;


    this.isConfirmPasswordInvalid =
      false;


    this.passwordErrorMessage =
      '';


    this.confirmPasswordErrorMessage =
      '';


    this.generalError =
      '';

  }


  /* =====================================================
     RESET PASSWORD
  ===================================================== */

  async onResetPassword():
    Promise<void> {

    if (this.loading) {

      return;

    }


    this.clearAllErrors();


    if (
      !this.password
    ) {

      this.showFieldError(
        'password',
        'Please enter your new password.'
      );


      return;

    }


    if (
      !this.new_password
    ) {

      this.showFieldError(
        'confirmPassword',
        'Please confirm your new password.'
      );


      return;

    }


    if (
      this.password !==
      this.new_password
    ) {

      this.showFieldError(
        'confirmPassword',
        'New password and confirm password do not match.'
      );


      return;

    }


    if (
      !this.email
    ) {

      this.showGeneralError(
        'Email information was not found. Please restart the password reset process.'
      );


      return;

    }


    if (!this.otp) {

      this.showGeneralError(
        'OTP verification information was not found. Please request a new OTP.'
      );


      return;

    }


    this.loading = true;


    const data = {

      email:
        this.email,

      otp:
        this.otp,

      new_password:
        this.new_password

    };


    try {

      const resetObservable =
        await this.authService.ResetRiderPwd(
          data
        );


      const response =
        await resetObservable.toPromise();


      // console.log(
      //   'Password changed successfully:',
      //   response
      // );


      this.router.navigate([
        '/login'
      ]);

    } catch (err: any) {

      console.error(
        'Password reset failed:',
        err
      );


      this.showGeneralError(
        err?.error?.message ||
        err?.message ||
        'Unable to reset your password. Please try again.'
      );

    } finally {

      this.loading =
        false;

    }

  }

}