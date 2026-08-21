import { Component } from '@angular/core';

import {
  CommonModule
} from '@angular/common';

import {
  FormsModule
} from '@angular/forms';

import {
  Router
} from '@angular/router';

import {
  Location
} from '@angular/common';

import {
  IonicModule
} from '@ionic/angular';

import {
  AuthserviceService
} from '../services/authservice.service';


@Component({
  selector: 'app-forgot-password',
  templateUrl: './forgot-password.page.html',
  styleUrls: ['./forgot-password.page.scss'],
  standalone: true,
  imports: [
    IonicModule,
    FormsModule,
    CommonModule
  ],
})
export class ForgotPasswordPage {

  email: string = '';
  loading: boolean = false;
  generalError: string = '';

  private errorTimer?:
    ReturnType<typeof setTimeout>;


  constructor(
    private router: Router,
    private location: Location,
    private authService: AuthserviceService
  ) {}


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

  clearError(): void {

    if (!this.generalError) {
      return;
    }


    this.generalError = '';


    if (this.errorTimer) {

      clearTimeout(
        this.errorTimer
      );


      this.errorTimer =
        undefined;

    }

  }


  /* =====================================================
     SHOW ERROR
  ===================================================== */

  private showError(
    message: string
  ): void {

    if (this.errorTimer) {

      clearTimeout(
        this.errorTimer
      );

    }


    this.generalError =
      message;


    this.errorTimer =
      setTimeout(() => {

        this.generalError = '';

        this.errorTimer =
          undefined;

      }, 2000);

  }


  /* =====================================================
     VALIDATE EMAIL
  ===================================================== */

  private isValidEmail(
    email: string
  ): boolean {

    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(
      email
    );

  }


  /* =====================================================
     SEND OTP
  ===================================================== */

  async sendOtp(): Promise<void> {

    if (this.loading) {
      return;
    }


    this.email =
      this.email.trim().toLowerCase();


    if (!this.email) {

      this.showError(
        'Email address is required.'
      );

      return;

    }


    if (
      !this.isValidEmail(
        this.email
      )
    ) {

      this.showError(
        'Please enter a valid email address.'
      );

      return;

    }


    this.clearError();


    this.loading =
      true;


    const data = {
      email: this.email
    };


    try {

      const response =
        await (
          await this.authService.sendOtp(
            data
          )
        ).toPromise();


      // console.log(
      //   'OTP sent successfully:',
      //   response
      // );


      this.router.navigate(
        ['/otp'],
        {
          queryParams: {
            email: this.email
          }
        }
      );

    } catch (err: any) {

      console.error(
        'Failed to send OTP:',
        err
      );


      this.showError(
        err?.error?.message ||
        err?.message ||
        'Unable to send the verification code. Please try again.'
      );

    } finally {

      this.loading =
        false;

    }

  }

}