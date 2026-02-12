import { NgModule } from '@angular/core';
import { PreloadAllModules, RouterModule, Routes } from '@angular/router';
import { LoginPage } from './login/login.page'; // Import SignupPage
import { SplashscreenPage } from './splashscreen/splashscreen.page';
import { WelcomePage } from './welcome/welcome.page';
import { SignupPage } from './signup/signup.page';
import { RegistrationPage } from './registration/registration.page';
import { OtpPage } from './otp/otp.page';
import { ChangepasswordPage } from './changepassword/changepassword.page';
import { HomePage } from './home/home.page';
import { ResendOtpPage } from './resend-otp/resend-otp.page';
import { MyAccountPage } from './my-account/my-account.page';
import { EditAccountPage } from './edit-account/edit-account.page';
import { MapPage } from './map/map.page';
import { OrderAcceptedComponent } from './components/order-accepted/order-accepted.component';
// import { authGuard } from './guards/auth.guard';


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
    loadChildren: () => import('./home/home.module').then(m => m.HomePageModule),

  },
  {
    path: 'login',
    loadChildren: () => import('./login/login.module').then(m => m.LoginPageModule)
  },
  // { path: 'login', component: LoginPage },
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
    loadChildren: () => import('./store-details/store-details.module').then(m => m.StoreDetailsPageModule),
    // canActivate: [authGuard]
  },
  {
    path: 'notification',
    loadChildren: () => import('./notification/notification.module').then(m => m.NotificationPageModule),
    // canActivate: [authGuard]
  },
  {
    path: 'signup-step-2',
    loadChildren: () => import('./signup-step-2/signup-step-2.module').then( m => m.SignupStep2PageModule)
  },
  {
    path: 'signup-step-3',
    loadChildren: () => import('./signup-step-3/signup-step-3.module').then( m => m.SignupStep3PageModule)
  },
  {
    path: 'application-review',
    loadChildren: () => import('./application-review/application-review.module').then( m => m.ApplicationReviewPageModule)
  },   {
    path: 'setting',
    loadChildren: () => import('./setting/setting.module').then( m => m.SettingPageModule),
    // canActivate: [authGuard]
  },
  {
    path: 'wallet',
    loadChildren: () => import('./wallet/wallet.module').then( m => m.WalletPageModule),
    // canActivate: [authGuard]
  },
  {
    path: 'ratings',
    loadChildren: () => import('./ratings/ratings.module').then( m => m.RatingsPageModule),
    // canActivate: [authGuard]
  },
  {
    path: 'privacy',
    loadChildren: () => import('./privacy/privacy.module').then( m => m.PrivacyPageModule),
    // canActivate: [authGuard]
  },
  {
    path: 'terms-condition',
    loadChildren: () => import('./terms-condition/terms-condition.module').then( m => m.TermsConditionPageModule),
    // canActivate: [authGuard]
  },
  {
    path: 'faqs',
    loadChildren: () => import('./faqs/faqs.module').then( m => m.FAQsPageModule),
    // canActivate: [authGuard]
  },
  {
    path: 'help-support',
    loadChildren: () => import('./help-support/help-support.module').then( m => m.HelpSupportPageModule),
    // canActivate: [authGuard]
  },
  {
    path: 'bankinfo',
    loadChildren: () => import('./bankinfo/bankinfo.module').then( m => m.BankinfoPageModule),
    // canActivate: [authGuard]
  },
  {
    path: 'riderstatus',
    loadChildren: () => import('./shopstatus/shopstatus.module').then( m => m.ShopstatusPageModule),
    // canActivate: [authGuard]
  },
  {
    path: 'withdrawal',
    loadChildren: () => import('./withdrawal/withdrawal.module').then( m => m.WithdrawalPageModule),
    // canActivate: [authGuard]
  },
  {
    path: 'codeanalytics',
    loadChildren: () => import('./codeanalytics/codeanalytics.module').then( m => m.CodeanalyticsPageModule),
    // canActivate: [authGuard]
  },
  {
    path: 'balance',
    loadChildren: () => import('./balance/balance.module').then( m => m.BalancePageModule),
    // canActivate: [authGuard]
  },
  {
    path: 'vehicel-details',
    loadChildren: () => import('./vehicel-details/vehicel-details.module').then( m => m.VehicelDetailsPageModule),
    // canActivate: [authGuard]
  },
  {
    path: 'rider-details',
    loadChildren: () => import('./rider-details/rider-details.module').then( m => m.RiderDetailsPageModule),
    // canActivate: [authGuard]
  },
  {
    path: 'signup-step-4',
    loadChildren: () => import('./signup-step-4/signup-step-4.module').then( m => m.SignupStep4PageModule)
  },
  {
    path: 'forgot-password',
    loadChildren: () => import('./forgot-password/forgot-password.module').then( m => m.ForgotPasswordPageModule)
  },
  {
    path: 'reset-password',
    loadChildren: () => import('./reset-password/reset-password.module').then( m => m.ResetPasswordPageModule)
  },
  {
    path: 'order-details',
    component: OrderAcceptedComponent,
  },  {
    path: 'chat-screen',
    loadChildren: () => import('./chat-screen/chat-screen.module').then( m => m.ChatScreenPageModule)
  },

 


  






  // No AuthGuard needed    
];

@NgModule({
  imports: [
    RouterModule.forRoot(routes, { preloadingStrategy: PreloadAllModules })
  ],
  exports: [RouterModule]
})
export class AppRoutingModule { }
