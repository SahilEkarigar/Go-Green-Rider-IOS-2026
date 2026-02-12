import { Component, OnInit, ElementRef, ViewChild } from '@angular/core';
import { IonicModule } from '@ionic/angular';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { PostService } from '../services/post.service';
import { Location } from '@angular/common';
import { CommonModule } from '@angular/common';
import { AuthserviceService } from '../services/authservice.service';

@Component({
  selector: 'app-otp',
  templateUrl: './otp.page.html',
  styleUrls: ['./otp.page.scss'],
  standalone: true,
  imports: [IonicModule, FormsModule, CommonModule],
})
export class OtpPage implements OnInit {

  @ViewChild('otpContainer', { static: true }) otpContainer!: ElementRef;
  email: string = '';
  timeLeft: number = 120; // 2 minutes in seconds
  timerDisplay: string = '02:00';
  timer: any;
  otpValue: string = '';
  otpLength = 4; // Or 6 if needed
  otpArray = Array(this.otpLength).fill(0);
  otpDigits: string[] = new Array(this.otpLength).fill('');
  canResend: boolean = false;
  resendLoading: boolean = false;
  generalError: string = '';

  constructor(
    private route: ActivatedRoute,
    private location: Location,
    private httpService: PostService,
    private router: Router,
    private authService: AuthserviceService
  ) {
    this.route.queryParams.subscribe(params => {
      this.email = params['email'] || '';
      console.log('Received email:', this.email);
      this.startTimer();
    });
  }
  ngOnInit() { }

  moveToNext(event: any) {
    const input = event.target;
    const value = input.value; 
    if (!/^\d$/.test(value)) {
      input.value = '';
      return;
    }  
    const otpInputs = document.querySelectorAll('.otp-input') as NodeListOf<HTMLInputElement>;
    otpInputs.forEach((inp, index) => {
      this.otpDigits[index] = inp.value;
    });    
    this.updateOtpValue();
    const nextInput = input.nextElementSibling;
    if (nextInput && value !== '') {
      nextInput.focus();
    }
  }

  handleBackspace(event: any) {
    const input = event.target;
    if (event.key === 'Backspace' && input.value === '') {
      const prevInput = input.previousElementSibling;
      if (prevInput) {
        prevInput.focus();
      }
    }  
    const otpInputs = document.querySelectorAll('.otp-input') as NodeListOf<HTMLInputElement>;
    otpInputs.forEach((inp, index) => {
      this.otpDigits[index] = inp.value;
    });
    this.updateOtpValue();
  }


  goBack(): void {
    this.location.back();
  }


  startTimer() {
    this.updateDisplay();
    this.canResend = false;
    this.timer = setInterval(() => {
      if (this.timeLeft > 0) {
        this.timeLeft--;
        this.updateDisplay();
      } else {
        this.canResend = true;
        clearInterval(this.timer);
      }
    }, 1000);
  }

  updateDisplay() {
    const minutes = Math.floor(this.timeLeft / 60);
    const seconds = this.timeLeft % 60;
    this.timerDisplay = `${this.pad(minutes)}:${this.pad(seconds)}`;
  }

  pad(num: number): string {
    return num < 10 ? '0' + num : num.toString();
  }

  resendOtp() {
    this.resendLoading = true;

    // this.authService.SendRiderOtp(this.email).subscribe({
    //   next: (res) => {
    //     console.log('Resend OTP successful:', res);
    //     this.resendLoading = false;
    //   },
    //   error: (err) => {
    //     console.error('Failed to resend OTP:', err);
    //     const errMsg = err?.error?.message || err.message || 'Unknown error';
    //     alert('Failed to resend OTP: ' + errMsg);
    //     this.resendLoading = false;
    //   }
    // });
  }
  async verifyOtp() {   
    const otpInputs = document.querySelectorAll('.otp-input') as NodeListOf<HTMLInputElement>;
    otpInputs.forEach((inp, index) => {
      this.otpDigits[index] = inp.value;
    });
    this.updateOtpValue();  
    console.log('OTP Digits:', this.otpDigits);    
    if (!this.otpValue || this.otpValue.length !== 4) {
      alert('Please enter a complete 4-digit OTP.');
      return;
    }
    if (!this.email || !this.email.trim()) {
      alert('Please enter a valid email.');
      return;
    }  
    console.log('Sending OTP to:', this.email);
    const data = {
      email: this.email,
      otp: this.otpValue
    }
    try {
      const response = await (await this.authService.riderVerifyOtp(data)).toPromise();
      console.log('OTP sent successfully:', response);
      this.router.navigate(['/reset-password'], { queryParams: { otp: this.otpValue, email: this.email } });
      // this.router.navigate(['/otp'], { queryParams: { email: this.email } });
    } catch (err: any) {
      this.generalError = 'Failed to send OTP';
      setTimeout(() => {
        this.generalError = '';
      }, 2000);
      // console.error('Failed to send OTP:', err);

      const errMsg = err?.error?.message || err.message || 'Unknown error';
      alert('Failed to send OTP: ' + errMsg);
    } finally {
      // this.loading = false; // Hide loader after response
    }
  }

  // this.authService.VerifyRiderOtp(this.email, +this.otpValue).subscribe({
  //   next: (res) => {
  //     console.log('otp verified succesfully:', res);
  //     this.router.navigate(['/reset-password'], { queryParams: { otp: this.otpValue, email: this.email } });
  //   },
  //   error: (err) => {
  //     console.error('Failed to veriffy OTP:', err);
  //     const errMsg = err?.error?.message || err.message || 'Unknown error';
  //     alert('Failed to resend OTP: ' + errMsg);
  //   }
  // });

  ngOnDestroy(): void {
    clearInterval(this.timer);
  }



  updateOtpValue() {
    this.otpValue = this.otpDigits.join('');
    console.log('OTP entered:', this.otpValue);
  }


}
