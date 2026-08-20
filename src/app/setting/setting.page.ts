import {
  Component,
  OnDestroy,
  OnInit
} from '@angular/core';

import {
  CommonModule
} from '@angular/common';

import {
  Router
} from '@angular/router';

import {
  IonicModule,
  NavController
} from '@ionic/angular';

import { addIcons } from 'ionicons';
import {
  personOutline,
  keyOutline,
  carOutline,
  statsChartOutline,
  documentTextOutline,
  timeOutline,
  swapHorizontalOutline,
  businessOutline,
  helpCircleOutline,
  chatbubblesOutline,
  documentAttachOutline,
  lockClosedOutline,
  starOutline,
  logOutOutline,
  chevronForwardOutline,
  chevronBackOutline,
  walletOutline
} from 'ionicons/icons';

import {
  Storage
} from '@ionic/storage-angular';

import {
  firstValueFrom,
  filter,
  Subject,
  takeUntil,
  timeout
} from 'rxjs';

import {
  Capacitor
} from '@capacitor/core';

import {
  AuthserviceService
} from '../services/authservice.service';

import {
  FooterTabsComponent
} from '../components/footer-tabs/footer-tabs.component';

import {
  UserService
} from '../services/user.service';


@Component({
  selector: 'app-setting',
  templateUrl: './setting.page.html',
  styleUrls: ['./setting.page.scss'],
  standalone: true,
  imports: [
    CommonModule,
    IonicModule,
    FooterTabsComponent
  ],
})
export class SettingPage implements OnInit, OnDestroy {

  user: any = {
    data: {}
  };


  defaultProfileImage:
    string =
    '../../assets/home/rider_profile.png';


  logoutLoading:
    boolean = false;


  private readonly destroy$ =
    new Subject<void>();


  constructor(
    private router: Router,
    private navCtrl: NavController,
    private storage: Storage,
    private authService: AuthserviceService,
    private userService: UserService
  ) {
    addIcons({
      personOutline,
      keyOutline,
      carOutline,
      statsChartOutline,
      documentTextOutline,
      timeOutline,
      swapHorizontalOutline,
      businessOutline,
      helpCircleOutline,
      chatbubblesOutline,
      documentAttachOutline,
      lockClosedOutline,
      starOutline,
      logOutOutline,
      chevronForwardOutline,
      chevronBackOutline,
      walletOutline
    });
  }


  /* =====================================================
     INIT
  ===================================================== */

  async ngOnInit():
    Promise<void> {

    await this.storage.create();


    this.userService.user$
      .pipe(
        filter(user => !!user),
        takeUntil(this.destroy$)
      )
      .subscribe(user => {

        this.user =
          user;

      });

  }


  /* =====================================================
     DESTROY
  ===================================================== */

  ngOnDestroy(): void {

    this.destroy$.next();

    this.destroy$.complete();

  }


  /* =====================================================
     IMAGE FALLBACK
  ===================================================== */

  onImageError(
    event: Event
  ): void {

    const image =
      event.target;


    if (
      image instanceof HTMLImageElement
    ) {

      image.onerror =
        null;


      image.src =
        this.defaultProfileImage;

    }

  }


  /* =====================================================
     PROFILE
  ===================================================== */

  goToEditProfile(): void {

    this.router.navigate([
      '/edit-account'
    ]);

  }


  changePassword(): void {

    this.router.navigate([
      '/changepassword'
    ]);

  }


  goToOrderHistory(): void {

    this.navCtrl.navigateForward([
      '/order-history'
    ]);

  }


  /* =====================================================
     HEADER BACK
  ===================================================== */

  goBackToHome(): void {

    this.navCtrl.navigateBack(
      '/home'
    );

  }


  /* =====================================================
     VEHICLE
  ===================================================== */

  goToVehicleDetails(): void {

    this.navCtrl.navigateForward(
      '/vehicel-details'
    );

  }


  goTostatus(): void {

    this.navCtrl.navigateForward(
      '/riderstatus'
    );

  }


  showRiderDetailPage(): void {

    this.navCtrl.navigateForward(
      '/rider-details'
    );

  }


  /* =====================================================
     WALLET / BANK
  ===================================================== */

  goToWallet(): void {

    this.navCtrl.navigateForward(
      '/wallet'
    );

  }


  goTohistory(): void {

    this.navCtrl.navigateForward(
      '/withdrawal'
    );

  }


  goTobank(): void {

    this.navCtrl.navigateForward(
      '/bankinfo'
    );

  }


  /* =====================================================
     SUPPORT
  ===================================================== */

  goTohelp(): void {

    this.navCtrl.navigateForward(
      '/help-support'
    );

  }


  goToFAQS(): void {

    this.navCtrl.navigateForward(
      '/faqs'
    );

  }


  goToTerms(): void {

    this.navCtrl.navigateForward(
      '/terms-condition'
    );

  }


  goToPrivacy(): void {

    this.navCtrl.navigateForward(
      '/privacy'
    );

  }


  /* =====================================================
     REVIEWS
  ===================================================== */

  goToRatings(): void {

    this.navCtrl.navigateForward(
      '/ratings'
    );

  }


  /* =====================================================
     LOGOUT
  ===================================================== */

  async logoutUser():
    Promise<void> {

    /*
     * Prevent multiple logout taps.
     */
    if (
      this.logoutLoading
    ) {

      return;

    }


    this.logoutLoading =
      true;


    try {

      const userId =
        await this.storage.get(
          'user_id'
        );


      const fcmToken =
        await this.storage.get(
          'FCM_TOKEN'
        );


      const platform =
        Capacitor.getPlatform();


      /*
       * Remove the registered device token only
       * on native Android/iOS devices.
       */
      if (
        (
          platform === 'android' ||
          platform === 'ios'
        ) &&
        userId &&
        fcmToken
      ) {

        try {

          const data = {
            user_id: userId,
            fcmToken: fcmToken
          };


          const removeTokenObservable =
            await this.authService
              .removeFCMToken(
                data
              );


          const response =
            await firstValueFrom(
              removeTokenObservable.pipe(
                timeout(5000)
              )
            );


          if (
            response?.success
          ) {

            // console.log(
            //   response.message
            // );

          } else {

            // console.log(
            //   response?.message ||
            //   'FCM token removal was not confirmed.'
            // );

          }

        } catch (error) {

          /*
           * A failure to remove the remote FCM token
           * should not prevent the user from logging out.
           */
          console.warn(
            'FCM token removal failed:',
            error
          );

        }

      }


      /*
       * Clear Ionic local storage.
       *
       * storage.clear() already removes:
       * token
       * user_token
       * user_id
       * FCM_TOKEN
       * and other session values.
       */
      await this.storage.clear();


      /*
       * user_id is also stored in browser localStorage
       * elsewhere in the Rider application.
       */
      localStorage.removeItem(
        'user_id'
      );


      this.router.navigate(
        ['/welcome'],
        {
          replaceUrl: true
        }
      );

    } catch (error) {

      console.error(
        'Logout failed:',
        error
      );


      /*
       * Even if storage cleanup encounters an issue,
       * make another safe attempt at session cleanup.
       */
      try {

        await this.storage.clear();

        localStorage.removeItem(
          'user_id'
        );

      } catch (storageError) {

        console.error(
          'Unable to clear local session:',
          storageError
        );

      }


      this.router.navigate(
        ['/welcome'],
        {
          replaceUrl: true
        }
      );

    } finally {

      this.logoutLoading =
        false;

    }

  }

}