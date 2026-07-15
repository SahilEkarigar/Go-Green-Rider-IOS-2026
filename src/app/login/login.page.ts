import { Component, OnInit } from '@angular/core';
import { IonicModule, Platform } from '@ionic/angular';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { AuthserviceService } from '../services/authservice.service';
import { Storage } from '@ionic/storage-angular';
import { jwtDecode } from 'jwt-decode';
import { SignInWithApple, ASAuthorizationAppleIDRequest } from '@ionic-native/sign-in-with-apple/ngx';

import { GoogleAuthService } from '../services/google-auth.service';
import { UserService } from '@app/services/user.service';
import { Capacitor } from '@capacitor/core';
import { FCM } from '@capacitor-community/fcm';
import { PushNotifications } from '@capacitor/push-notifications';

@Component({
  selector: 'app-login',
  templateUrl: './login.page.html',
  styleUrls: ['./login.page.scss'],
  standalone: true,
  imports: [IonicModule, FormsModule, CommonModule],
})
export class LoginPage implements OnInit {
  email: string = '';
  password: string = '';
  isEmailInvalid = false;
  isPasswordInvalid = false;
  userIdError: string = '';
  passwordError: string = '';
  generalError: string = '';
  role_id = 4;
  googleAuthToken = '';
  isIos = false;
  isAppleAvailable = false;
  fcmToken: string = '';

  constructor(
    private platform: Platform,
    private router: Router,
    private authservice: AuthserviceService,
    private storage: Storage,
    private googleAuthService: GoogleAuthService,
    private signInWithApple: SignInWithApple,
    private userService: UserService
  ) {

  }

  async ngOnInit() {
    await this.storage.create();
    this.isIos = this.platform.is('ios');
    this.isAppleAvailable =
      this.platform.is('ios') &&
      (this.platform.is('hybrid') ||
        this.platform.is('capacitor') ||
        this.platform.is('cordova'));
    this.requestPermissionAndToken();
  }

  async requestPermissionAndToken() {
    try {
      if (Capacitor.getPlatform() === 'web') return;
      let perm = await PushNotifications.checkPermissions();
      if (perm.receive === 'prompt') {
        perm = await PushNotifications.requestPermissions();
      }
      if (perm.receive === 'granted') {
        await PushNotifications.register();
        const { token } = await FCM.getToken();
        this.fcmToken = token;
        console.log('✅ FCM Token:', this.fcmToken);
      }
    } catch (err) {
      console.error('❌ Error getting FCM token:', err);
    }
  }

  private async handleSuccessfulLogin(response: any) {
    try {
      const decoded: any = jwtDecode(response.token);
      const user_id = decoded?.user_id;

      await this.storage.set('user_id', user_id);
      await this.storage.set('role_id', this.role_id);
      await this.storage.set('token', response.token);
      localStorage.setItem('user_id', user_id);
      console.log('user id:',user_id)
      // fetch user profile
      this.userService.fetchUserInfo(response.token);

      if (response.is_verified === 0) {
        this.router.navigate(['application-review']);
        return;
      }
      if (response.is_verified === 2) {
        this.generalError = 'Rider Rejected';
        setTimeout(() => {
          this.generalError = '';
        }, 2000);
        return;
      }
      if (response.is_verified === 3) {
        this.router.navigate(['application-review']);
        return;
      }

      if (response.is_verified === 1) {
        const fcmToken = this.fcmToken;
        if (Capacitor.getPlatform() === 'android' || Capacitor.getPlatform() === 'ios') {
          if (fcmToken) {
            console.log("📱 fcmToken", fcmToken);
            this.authservice
              .sendFCMToken({ user_id, fcmToken: fcmToken })
              .subscribe({
                next: (res) => console.log('✅ FCM token sent successfully', res),
                error: (err) => console.error('❌ Failed to send FCM token', err),
              });
          }
        } else {
          console.log("🌐 Web platform — skipping FCM token send.");
        }
        // ✅ Navigate after token send request started
        this.router.navigate(['home']);
      }

    } catch (e) {
      console.error('Post-login handling failed:', e);
      this.generalError = 'An error occurred after login.';
      setTimeout(() => {
        this.generalError = '';
      }, 2000);
    }
  }

  goSignupPage() {
    this.router.navigate(['/signup']);
  }

  validateInput(): boolean {
    this.isEmailInvalid = false;
    this.isPasswordInvalid = false;
    this.userIdError = '';
    this.passwordError = '';
    this.generalError = '';
    let isValid = true;

    if (!this.email && !this.password) {
      this.generalError = 'Fill all data';
      this.isEmailInvalid = true;
      this.isPasswordInvalid = true;
      isValid = false;
    } else if (!this.email) {
      this.generalError = 'ID is required.';
      this.isEmailInvalid = true;
      isValid = false;
      setTimeout(() => {
        this.generalError = '';
      }, 2000);
    } else if (!this.password) {
      this.generalError = 'Password is required.';
      this.isPasswordInvalid = true;
      isValid = false;
      setTimeout(() => {
        this.generalError = '';
      }, 2000);
    }
    return isValid;
  }

  async loginApi() {
    if (!this.validateInput()) {
      return;
    }
    const data = {
      email: this.email,
      password: this.password,
      role_id: this.role_id,
    };
    this.authservice.login(data).subscribe(
      async (response) => {
        if (response && response.success) {
          await this.handleSuccessfulLogin(response);
        } else {
          this.generalError =
            response?.message || 'Login failed. Please check your credentials.';
          setTimeout(() => {
            this.generalError = '';
          }, 2000);
        }
      },
      async (error) => {
        this.generalError =
          error?.error?.message || 'An error occurred. Please try again later.';
        setTimeout(() => {
          this.generalError = '';
        }, 2000);
      }
    );
  }

  forgetPassword() {
    this.router.navigate(['forgot-password']);
  }

  async loginOrSignupWithGoogle() {
    try {
      const result = await this.googleAuthService.googleAuth();
      this.googleAuthToken = result.token;
      const data = {
        role_id: this.role_id,
        googleauthToken: this.googleAuthToken,
      };
      this.authservice.login(data).subscribe(async (response) => {
        if (response && response.success) {
          await this.handleSuccessfulLogin(response);
        } else {
          this.generalError =
            response?.message || 'Login failed. Please try again later.';
          setTimeout(() => {
            this.generalError = '';
          }, 2000);
        }
      });
    } catch (error) {
      console.error('Google Auth Failed:', error);
    }
  }

  async appleSignIn() {
    try {
      const result = await this.signInWithApple.signin({
        requestedScopes: [
          ASAuthorizationAppleIDRequest.ASAuthorizationScopeFullName,
          ASAuthorizationAppleIDRequest.ASAuthorizationScopeEmail,
        ],
      });

      const appleAuthToken = result.identityToken;

      const data = {
        role_id: this.role_id,
        appleAuthToken: appleAuthToken,
      };

      this.authservice.login(data).subscribe(async (response) => {
        if (response && response.success) {
          await this.handleSuccessfulLogin(response);
        } else {
          this.generalError =
            response?.message || 'Login failed. Please try again later.';
          setTimeout(() => {
            this.generalError = '';
          }, 2000);
        }
      });
    } catch (err) {
      console.error('Apple Sign-In error:', err);
    }
  }
}
