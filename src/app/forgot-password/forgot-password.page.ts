import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { Location } from '@angular/common';
import { AuthserviceService } from '../services/authservice.service';
import { IonicModule } from '@ionic/angular';

@Component({
  selector: 'app-forgot-password',
  templateUrl: './forgot-password.page.html',
  styleUrls: ['./forgot-password.page.scss'],
  standalone: true,
  imports: [IonicModule, FormsModule, CommonModule], // Import IonicModule here
})
export class ForgotPasswordPage implements OnInit {

  constructor(
    private router: Router,
    private location: Location,
    private authService: AuthserviceService
  ) { }

  email: string = '';
  loading: boolean = false;
  generalError: string = '';

  ngOnInit() {
  }



  goBack(): void {
    this.location.back();
  }


  // sendOtp() {
  //   if (!this.email || !this.email.trim()) {
  //     alert('Please enter a valid email.');
  //     return;
  //   }

  //   this.loading = true; // Show loader
  //   console.log('Sending OTP to:', this.email);

  //   this.httpService.SendRiderOtp(this.email).subscribe({
  //     next: (res: any) => {
  //       console.log('OTP sent successfully:', res);
  //       this.router.navigate(['/otp'], { queryParams: { email: this.email } });
  //     },
  //     error: (err: any) => {
  //       console.error('Failed to send OTP:', err);
  //       const errMsg = err?.error?.message || err.message || 'Unknown error';
  //       alert('Failed to send OTP: ' + errMsg);
  //     },
  //     complete: () => {
  //       this.loading = false; // Hide loader after response
  //     }
  //   });
  // }

  async sendOtp() {
    if (!this.email || !this.email.trim()) {      
      this.generalError = 'Please enter a valid email.';
      setTimeout(() => {
        this.generalError = '';
      }, 2000);
      return;
    }

    this.loading = true; // Show loader
    console.log('Sending OTP to:', this.email);
    const data = {
      email: this.email
    }
    try {
      const response = await (await this.authService.sendOtp(data)).toPromise();
      console.log('OTP sent successfully:', response);
      this.router.navigate(['/otp'], { queryParams: { email: this.email } });
    } catch (err: any) {
      this.generalError = err?.error?.message || err.message || 'Unknown error';
      setTimeout(() => {
        this.generalError = '';
      }, 2000);
    } finally {
      this.loading = false; // Hide loader after response
    }
  }
}
