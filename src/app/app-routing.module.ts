import { NgModule } from '@angular/core';
import { PreloadAllModules, RouterModule, Routes } from '@angular/router';
import { SplashscreenPage } from './splashscreen/splashscreen.page';
import { WelcomePage } from './welcome/welcome.page';
import { SignupPage } from './signup/signup.page';
import { RegistrationPage } from './registration/registration.page';
import { OtpPage } from './otp/otp.page';
import { ChangepasswordPage } from './changepassword/changepassword.page';
import { ResendOtpPage } from './resend-otp/resend-otp.page';
import { MyAccountPage } from './my-account/my-account.page';
import { EditAccountPage } from './edit-account/edit-account.page';
import { MapPage } from './map/map.page';
import { OrderAcceptedComponent } from './components/order-accepted/order-accepted.component';

const routes: Routes = [
  {
    path: '',
    redirectTo: 'splashscreen',
    pathMatch: 'full'
  },
  {
    path: 'folder/:id',
    loadChildren: () => import('./folder/folder.module').then(m => m.FolderPageModule)
  },
  {
    path: 'home',
    loadChildren: () => import('./home/home.module').then(m => m.HomePageModule)
  },
  {
    path: 'login',
    loadChildren: () => import('./login/login.module').then(m => m.LoginPageModule)
  },
  { path: 'splashscreen', component: SplashscreenPage },
  { path: 'welcome', component: WelcomePage },
  { path: 'signup', component: SignupPage },
  { path: 'registration', component: RegistrationPage },
  { path: 'otp', component: OtpPage },
  { path: 'changepassword', component: ChangepasswordPage },
  { path: 'resend-otp', component: ResendOtpPage },
  { path: 'my-account', component: MyAccountPage },
  { path: 'edit-account', component: EditAccountPage },
  { path: 'map', component: MapPage },
  {
    path: 'store-details',
    loadChildren: () => import('./store-details/store-details.module').then(m => m.StoreDetailsPageModule)
  },
  {
    path: 'notification',
    loadChildren: () => import('./notification/notification.module').then(m => m.NotificationPageModule)
  },
  {
    path: 'signup-step-2',
    loadChildren: () => import('./signup-step-2/signup-step-2.module').then(m => m.SignupStep2PageModule)
  },
  {
    path: 'signup-step-3',
    loadChildren: () => import('./signup-step-3/signup-step-3.module').then(m => m.SignupStep3PageModule)
  },
  {
    path: 'application-review',
    loadChildren: () => import('./application-review/application-review.module').then(m => m.ApplicationReviewPageModule)
  },
  {
    path: 'setting',
    loadChildren: () => import('./setting/setting.module').then(m => m.SettingPageModule)
  },
  {
    path: 'order-history',
    loadChildren: () => import('./order-history/order-history.module').then(m => m.OrderHistoryPageModule)
  },
  {
    path: 'wallet',
    loadChildren: () => import('./wallet/wallet.module').then(m => m.WalletPageModule)
  },
  {
    path: 'ratings',
    loadChildren: () => import('./ratings/ratings.module').then(m => m.RatingsPageModule)
  },
  {
    path: 'privacy',
    loadChildren: () => import('./privacy/privacy.module').then(m => m.PrivacyPageModule)
  },
  {
    path: 'terms-condition',
    loadChildren: () => import('./terms-condition/terms-condition.module').then(m => m.TermsConditionPageModule)
  },
  {
    path: 'faqs',
    loadChildren: () => import('./faqs/faqs.module').then(m => m.FAQsPageModule)
  },
  {
    path: 'help-support',
    loadChildren: () => import('./help-support/help-support.module').then(m => m.HelpSupportPageModule)
  },
  {
    path: 'bankinfo',
    loadChildren: () => import('./bankinfo/bankinfo.module').then(m => m.BankinfoPageModule)
  },
  {
    path: 'riderstatus',
    loadChildren: () => import('./shopstatus/shopstatus.module').then(m => m.ShopstatusPageModule)
  },
  {
    path: 'withdrawal',
    loadChildren: () => import('./withdrawal/withdrawal.module').then(m => m.WithdrawalPageModule)
  },
  {
    path: 'codeanalytics',
    loadChildren: () => import('./codeanalytics/codeanalytics.module').then(m => m.CodeanalyticsPageModule)
  },
  {
    path: 'balance',
    loadChildren: () => import('./balance/balance.module').then(m => m.BalancePageModule)
  },
  {
    path: 'vehicel-details',
    loadChildren: () => import('./vehicel-details/vehicel-details.module').then(m => m.VehicelDetailsPageModule)
  },
  {
    path: 'rider-details',
    loadChildren: () => import('./rider-details/rider-details.module').then(m => m.RiderDetailsPageModule)
  },
  {
    path: 'signup-step-4',
    loadChildren: () => import('./signup-step-4/signup-step-4.module').then(m => m.SignupStep4PageModule)
  },
  {
    path: 'forgot-password',
    loadChildren: () => import('./forgot-password/forgot-password.module').then(m => m.ForgotPasswordPageModule)
  },
  {
    path: 'reset-password',
    loadChildren: () => import('./reset-password/reset-password.module').then(m => m.ResetPasswordPageModule)
  },
  {
    path: 'order-details',
    component: OrderAcceptedComponent
  },
  {
    path: 'chat-screen',
    loadChildren: () => import('./chat-screen/chat-screen.module').then(m => m.ChatScreenPageModule)
  }
];

@NgModule({
  imports: [
    RouterModule.forRoot(routes, { preloadingStrategy: PreloadAllModules })
  ],
  exports: [RouterModule]
})
export class AppRoutingModule {}
