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
  selector: 'app-otp',
  templateUrl: './otp.page.html',
  styleUrls: ['./otp.page.scss'],
  standalone: true,
  imports: [
    IonicModule,
    CommonModule
  ],
})
export class OtpPage implements OnInit, OnDestroy {

  email: string = '';

  timeLeft: number = 120;

  timerDisplay: string = '02:00';

  timer: ReturnType<typeof setInterval> | null = null;

  otpValue: string = '';

  otpDigits: string[] = [
    '',
    '',
    '',
    ''
  ];

  generalError: string = '';

  loading: boolean = false;

  private errorTimer:
    ReturnType<typeof setTimeout> | null = null;


  constructor(
    private route: ActivatedRoute,
    private location: Location,
    private router: Router,
    private authService: AuthserviceService
  ) {}


  ngOnInit(): void {

    this.email =
      (
        this.route.snapshot
          .queryParamMap
          .get('email') || ''
      ).trim();


    this.startTimer();


    setTimeout(() => {

      const otpInputs =
        this.getOtpInputs();


      if (otpInputs.length > 0) {

        otpInputs[0].focus();

      }

    }, 200);

  }


  ngOnDestroy(): void {

    this.stopTimer();


    if (this.errorTimer) {

      clearTimeout(
        this.errorTimer
      );

      this.errorTimer = null;

    }

  }


  private getOtpInputs():
    NodeListOf<HTMLInputElement> {

    return document.querySelectorAll<HTMLInputElement>(
      'app-otp .otp-input'
    );

  }


  moveToNext(
    event: Event
  ): void {

    const input =
      event.target;


    if (!(input instanceof HTMLInputElement)) {

      return;

    }


    const cleanValue =
      input.value.replace(
        /\D/g,
        ''
      );


    if (!cleanValue) {

      input.value = '';

      this.updateOtpValue();

      return;

    }


    input.value =
      cleanValue.charAt(
        cleanValue.length - 1
      );


    this.clearError();

    this.updateOtpValue();


    const nextInput =
      input.nextElementSibling;


    if (
      nextInput instanceof HTMLInputElement &&
      nextInput.classList.contains('otp-input')
    ) {

      nextInput.focus();

      nextInput.select();

    }

  }


  handleBackspace(
    event: KeyboardEvent
  ): void {

    const input =
      event.target;


    if (!(input instanceof HTMLInputElement)) {

      return;

    }


    if (event.key !== 'Backspace') {

      return;

    }


    if (!input.value) {

      const previousInput =
        input.previousElementSibling;


      if (
        previousInput instanceof HTMLInputElement &&
        previousInput.classList.contains('otp-input')
      ) {

        previousInput.focus();

        previousInput.select();

      }

    }


    setTimeout(() => {

      this.updateOtpValue();

    }, 0);

  }


  updateOtpValue(): void {

    const otpInputs =
      this.getOtpInputs();


    this.otpDigits =
      Array.from(
        otpInputs
      ).map(
        (input: HTMLInputElement) => {

          return input.value.replace(
            /\D/g,
            ''
          );

        }
      );


    this.otpValue =
      this.otpDigits.join('');

  }


  startTimer(): void {

    this.stopTimer();


    this.timeLeft = 120;

    this.updateDisplay();


    this.timer =
      setInterval(() => {

        if (this.timeLeft > 0) {

          this.timeLeft--;

          this.updateDisplay();

        } else {

          this.stopTimer();

        }

      }, 1000);

  }


  private stopTimer(): void {

    if (this.timer) {

      clearInterval(
        this.timer
      );

      this.timer = null;

    }

  }


  updateDisplay(): void {

    const minutes =
      Math.floor(
        this.timeLeft / 60
      );


    const seconds =
      this.timeLeft % 60;


    this.timerDisplay =
      `${this.pad(minutes)}:${this.pad(seconds)}`;

  }


  pad(
    num: number
  ): string {

    return num < 10
      ? `0${num}`
      : num.toString();

  }


  goBack(): void {

    this.location.back();

  }


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

        this.errorTimer = null;

      }, 2000);

  }


  private clearError(): void {

    this.generalError = '';


    if (this.errorTimer) {

      clearTimeout(
        this.errorTimer
      );

      this.errorTimer = null;

    }

  }


  async verifyOtp(): Promise<void> {

    if (this.loading) {

      return;

    }


    this.updateOtpValue();


    if (
      !this.otpValue ||
      this.otpValue.length !== 4 ||
      !/^[0-9]{4}$/.test(
        this.otpValue
      )
    ) {

      this.showError(
        'Please enter the complete 4-digit verification code.'
      );

      return;

    }


    if (
      !this.email ||
      !this.email.trim()
    ) {

      this.showError(
        'Email address was not found. Please request a new verification code.'
      );

      return;

    }


    this.clearError();

    this.loading = true;


    const data = {
      email: this.email,
      otp: this.otpValue
    };


    try {

      const otpObservable =
        await this.authService.riderVerifyOtp(
          data
        );


      const response =
        await otpObservable.toPromise();


      console.log(
        'OTP verified successfully:',
        response
      );


      this.router.navigate(
        ['/reset-password'],
        {
          queryParams: {
            otp: this.otpValue,
            email: this.email
          }
        }
      );

    } catch (err: any) {

      console.error(
        'OTP verification failed:',
        err
      );


      this.showError(
        err?.error?.message ||
        err?.message ||
        'The verification code is incorrect or has expired.'
      );

    } finally {

      this.loading = false;

    }

  }

}