import { Component, OnInit } from '@angular/core';
import { IonicModule, NavController } from '@ionic/angular';
import { FormsModule } from '@angular/forms';
import { CommonModule, Location } from '@angular/common';
import { Router } from '@angular/router';
import { AuthserviceService } from '../services/authservice.service';
import { Storage } from '@ionic/storage-angular';
import { jwtDecode } from 'jwt-decode';

@Component({
  selector: 'app-changepassword',
  templateUrl: './changepassword.page.html',
  styleUrls: ['./changepassword.page.scss'],
  standalone: true,
  imports: [IonicModule, FormsModule, CommonModule],
})

export class ChangepasswordPage implements OnInit {

  previous_password: string = '';
  password: string = '';
  role_id = 3;
  user_id = '';
  isPrevPasswordVisible: boolean = false;
  isNewPasswordVisible = false;
  isConfirmPasswordVisible = false;
  confirm_password: string = '';

  constructor(
    private router: Router,
    private location: Location,
    private navCtrl: NavController,
    private authService: AuthserviceService,
    private storage: Storage,
  ) { }

  async ngOnInit() {
    await this.storage.create();
    const token = await this.storage.get('token');
    const decoded: any = jwtDecode(token);
    this.user_id = decoded.user_id;  
  }

  goBack(): void {
    this.location.back();
  }

  togglePassword() {
    this.isPrevPasswordVisible = !this.isPrevPasswordVisible;
  }

  async onChangePassword() {
    if (!this.password || !this.previous_password) {
      alert('Please enter all required fields!');
      return;
    }

    if (this.password !== this.confirm_password) {
      alert('Passwords do not match!');
      // setTimeout(() => {
      //   this.errorMsg = '';
      // }, 2000);
      return;
    } else {
      // this.errorMsg = '';
    }

    (
      await this.authService.updatePasswordSetting({
        old_password: this.previous_password,
        new_password: this.password,
        user_id: this.user_id,
      })
    ).subscribe({
      next: (response) => {
        alert('Password changed successfully!');
        this.router.navigate(['/new-home']);
      },
      error: (error) => {
        alert('Error changing password. Please try again.');
        console.error(error);
      },
    });
  }

  togglePrevPasswordVisibility() {
    this.isPrevPasswordVisible = !this.isPrevPasswordVisible;
  }

  toggleNewPasswordVisibility() {
    this.isNewPasswordVisible = !this.isNewPasswordVisible;
  }

  toggleConfirmPasswordVisibility() {
    this.isConfirmPasswordVisible = !this.isConfirmPasswordVisible;
  }
  goBackToScreen() {
    this.navCtrl.navigateBack('/setting-screen');
  }

}
