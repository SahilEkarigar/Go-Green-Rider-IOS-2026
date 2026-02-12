import { Component, OnInit } from '@angular/core';


import { IonicModule } from '@ionic/angular';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { Location } from '@angular/common';
import { PostService } from '../services/post.service';
import { AuthserviceService } from '../services/authservice.service';

@Component({
  selector: 'app-reset-password',
  templateUrl: './reset-password.page.html',
  styleUrls: ['./reset-password.page.scss'],
  standalone: true,
  imports: [IonicModule, CommonModule, FormsModule]
})
export class ResetPasswordPage implements OnInit {


  email: string = '';
  otp: number = 0;
  password: string = '';
  new_password: string = '';
  isPasswordVisible: boolean = false;
  loading: boolean = false;
  constructor(
    private router: Router,
    private route: ActivatedRoute,
    private location: Location,
    private authService: AuthserviceService
  ) { }

  goHome() {
    this.router.navigate(['/']);
  }
  togglePasswordVisibility() {
    this.isPasswordVisible = !this.isPasswordVisible;
  }
  goBack(): void {
    this.location.back();
  }

  ngOnInit() {
    this.route.queryParams.subscribe(params => {
      this.email = params['email'] || '';
      this.otp = +params['otp'] || 0; // convert to number
    });
  }

  async onResetPassword() {
    if (!this.password || !this.new_password) {
      alert('Please enter all required fields!');
      return;
    }
    if (this.password !== this.new_password) {
      alert('Passwords do not match!');
      return;
    }

    this.loading = true; // Show loader
    const data = {
      email: this.email,
      otp: this.otp,
      new_password: this.new_password
    }
    try {
      const response = await (await this.authService.ResetRiderPwd(data)).toPromise();
      console.log('Password changed successfully! please login', response);
      this.router.navigate(['/login']);
    } catch (err: any) {
      console.error('Error changing password. Please try again.', err);
      const errMsg = err?.error?.message || err.message || 'Unknown error';
      console.log("Error Msg", errMsg)
    } finally {
      this.loading = false;
    }

  }

}
