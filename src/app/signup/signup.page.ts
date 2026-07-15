// import { Storage } from '@ionic/storage-angular';
import { Component, OnInit, ViewChild, ElementRef } from '@angular/core';
import { IonicModule, ToastController, Platform, LoadingController } from '@ionic/angular';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { catchError, throwError, timeout } from 'rxjs';


import { Location } from '@angular/common';
import { AuthserviceService } from '../services/authservice.service';
// import { LoaderService } from '../services/loader.service';
import { Storage } from '@ionic/storage-angular';
import { jwtDecode } from 'jwt-decode';
import { GoogleAuthService } from '@app/services/google-auth.service';
import { SignInWithApple, ASAuthorizationAppleIDRequest } from '@ionic-native/sign-in-with-apple/ngx';

@Component({
  selector: 'app-signup',
  templateUrl: './signup.page.html',
  styleUrls: ['./signup.page.scss'],
  standalone: true,
  imports: [IonicModule, FormsModule, CommonModule],
})
export class SignupPage implements OnInit {
  fname = '';
  lname = '';
  email = '';
  phone = '';
  password = '';
  cpassword = '';
  errorMsg = '';
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
  loading: boolean = false;
  isAppleAvailable = false;


  emailTouched: boolean = false;

  constructor(
    private platform: Platform,
    private router: Router,
    private toastController: ToastController,
    private location: Location,
    private authservice: AuthserviceService,
    private storage: Storage,
    private googleAuthService: GoogleAuthService,
    private signInWithApple: SignInWithApple,
    private loadingController: LoadingController
  ) {
    this.init();
  }


  @ViewChild('fileInput') fileInput!: ElementRef<HTMLInputElement>;
  @ViewChild('cameraInput') cameraInput!: ElementRef<HTMLInputElement>;
  @ViewChild('proofFileInput') proofFileInput!: ElementRef<HTMLInputElement>;
  @ViewChild('proofCameraInput') proofCameraInput!: ElementRef<HTMLInputElement>;

  async ngOnInit() {
    this.isIos = this.platform.is('ios');
    this.isAppleAvailable = this.platform.is('ios') && (this.platform.is('hybrid') || this.platform.is('capacitor') || this.platform.is('cordova'));
  }


  async init() {
    await this.storage.create();
  }
  private async presentLoading(message: string = 'Please wait...') {
    const loading = await this.loadingController.create({ message });
    await loading.present();
  }

  private async dismissLoading() {
    try { await this.loadingController.dismiss(); } catch {}
  }

  goBack(): void {
    this.location.back();
  }
  togglePassword() {
    this.showPassword = !this.showPassword;
  }
  toggleCPassword() {
    this.showCPassword = !this.showCPassword;
  }

  private async handleSuccessfulLogin(response: any) {
    try {
      const decoded: any = jwtDecode(response.token);
      const user_id = decoded?.user_id;
      await this.storage.set('user_id', user_id);
      await this.storage.set('role_id', this.role_id);
      localStorage.setItem('user_id', user_id);

      if (response.is_verified === 0) {
        this.router.navigate(['application-review']);
        return;
      }
      if (response.verification_Done === 0) {
        this.router.navigate(['signup-step-2']);
        return;
      }
      if (response.is_verified === 2) {
        this.generalError = 'Rider Rejected';
        setTimeout(() => { this.generalError = ''; }, 2000);
        return;
      }
      if (response.is_verified === 3) {
        this.router.navigate(['application-review']);
        return;
      }

      if (response.is_verified === 1) {
        await this.storage.set('token', response.token);
        this.router.navigate(['home']).then(async () => {
          const data = {
            user_id: user_id,
            fcmToken: await this.storage.get('FCM_TOKEN')
          };
          await this.presentLoading('Syncing device...');
          (await this.authservice.sendFCMToken(data)).subscribe(
            async (sendTokenResponse) => {
              if (sendTokenResponse && sendTokenResponse.success) {
                console.log(sendTokenResponse.message);
              } else {
                console.log(sendTokenResponse?.message || 'Submission failed');
              }
              await this.dismissLoading();
            },
            async (error) => {
              console.error('API error:', error);
              this.generalError = error?.error?.message || 'An error occurred. Please try again later.';
              setTimeout(() => { this.generalError = ''; }, 2000);
              await this.dismissLoading();
            }
          );
        });
      }
    } catch (e) {
      console.error('Post-login handling failed:', e);
      this.generalError = 'An error occurred after login.';
      setTimeout(() => { this.generalError = ''; }, 2000);
    }
  }


  onEmailBlur() {
    this.emailTouched = true;
  }
  // isValidEmail(email: string): boolean {    
  //   return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  // }
  isValidEmail(email: string): boolean {
    // const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
    // return emailRegex.test(email);
    const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9-]+(?:\.[a-zA-Z]{2,})+$/;
    return emailRegex.test(email);
  }


  // for check valid password bottom

  // isValidPassword(password: string): boolean {   
  //   const passwordRegex = /^(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]).{6,}$/;
  //   return passwordRegex.test(password);
  // }

  private async presentToast(message: string) {
    const toast = await this.toastController.create({
      message: message,
      duration: 3000,
      color: 'danger',
      position: 'bottom'
    });
    await toast.present();
  }

  async NextStep() {
    this.isFnameInvalid = !this.fname.trim();
    this.isLnameInvalid = !this.lname.trim();
    this.isEmailInvalid = !this.email.trim();
    this.isPhoneInvalid = !this.phone.trim();
    this.isPSWInvalid = !this.password.trim();
    this.isCPSWInvalid = !this.cpassword.trim();

    setTimeout(() => {
      if (this.isFnameInvalid) {
        (document.getElementById('fname') as HTMLInputElement).focus();
      } else if (this.isLnameInvalid) {
        (document.getElementById('lname') as HTMLInputElement).focus();
      } else if (this.isEmailInvalid) {
        (document.getElementById('email') as HTMLInputElement).focus();
      } else if (this.isPhoneInvalid) {
        (document.getElementById('phone') as HTMLInputElement).focus();
      } else if (this.isPSWInvalid) {
        (document.getElementById('password') as HTMLInputElement).focus();
      } else if (this.isCPSWInvalid) {
        (document.getElementById('cpassword') as HTMLInputElement).focus();
      }
    });

    const hasAnyInvalid =
      this.isFnameInvalid ||
      this.isLnameInvalid ||
      this.isEmailInvalid ||
      this.isPhoneInvalid ||
      this.isPSWInvalid ||
      this.isCPSWInvalid;

    if (hasAnyInvalid) {
      this.presentToast('All fields are required.');
      return;
    }


    // Email validation
    if (!this.isValidEmail(this.email)) {
      this.isEmailInvalid = true;
      this.presentToast('Please enter a valid email address.');
      (document.getElementById('email') as HTMLInputElement).focus();
      return;
    } else {
      this.isEmailInvalid = false;
    }

    if (this.password !== this.cpassword) {
      this.isCPSWInvalid = true;
      this.presentToast('Passwords do not match!');
      return;
    }

    const data = {
      firstname: this.fname,
      lastname: this.lname,
      email: this.email,
      password: this.password,
      role_id: this.role_id,
      phonenumber: this.phone,
      prefix: "+1"
    };

    await this.presentLoading('Signing up...');
    this.authservice.registerRider(data).subscribe(
      async (response) => {
        await this.dismissLoading();
        if (response && response.token) {
          await this.storage.set('token', response.token);
          await this.handleSignUpSuccess(response);
          this.fname = '';
          this.lname = '';
          this.email = '';
          this.phone = '';
          this.password = '';
          this.cpassword = '';
          this.prefix = '+1';
          this.router.navigate(['signup-step-4']);
        } else {
          console.log(response.message);
          this.generalError = response?.message || 'Registration failed. Please try again.';
          this.presentToast(this.generalError);
        }
      },
      async (error) => {
        await this.dismissLoading();
        console.error('Registration API error:', error);
        this.generalError = error?.error?.message || 'An error occurred during registration. Please try again.';
        this.presentToast(this.generalError);
      }
    );
  }

  async handleSignUpSuccess(response: any) {
    if (response?.token) {
      try {
        const decoded: any = jwtDecode(response.token);
        const user_id = decoded?.user_id;
        await this.storage.set('user_token', response.token);
        await this.storage.set('user_id', user_id);
        localStorage.setItem('user_id', user_id);
        await this.storage.set('user_details', JSON.stringify({
          name: `${this.fname} ${this.lname}`,
          email: this.email,
          user_id: user_id
        }));
        console.log("user_id", user_id)
      } catch (error) {
        console.error('Invalid token received:', error);
      }
    } else {
      console.warn('Signup response does not contain a valid token.');
    }
  }

  async loginOrSignupWithGoogle() {
    try {
      const result = await this.googleAuthService.googleAuth();

      console.log('result : '+result);
      
      this.googleAuthToken = result.token;
      console.log(this.googleAuthToken)
      const data = {
        role_id: this.role_id,
        googleauthToken: this.googleAuthToken
      };
      this.authservice.registerRider(data).subscribe(async (response: any) => {
        if (response && response.success) {
          await this.handleSuccessfulLogin(response);
        } else {
          this.generalError = response?.message || 'Login failed. Please try again later.';
          setTimeout(() => { this.generalError = ''; }, 2000);
        }
      })
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

      console.log('Apple Sign-In success:', result);

      const appleAuthToken = result.identityToken; // <-- JWT from Apple

      const data = {
        role_id: this.role_id,
        appleAuthToken: appleAuthToken,
      };

      this.authservice.login(data).subscribe(async (response: any) => {
        if (response && response.success) {
          await this.handleSuccessfulLogin(response);
        } else {
          console.error('Apple login failed:', response);
          this.generalError = response?.message || 'Login failed. Please try again later.';
          setTimeout(() => { this.generalError = ''; }, 2000);
        }
      });

    } catch (err) {
      console.error('Apple Sign-In error:', err);
    }
  }


}
