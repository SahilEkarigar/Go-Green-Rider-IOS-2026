import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { ResendOtpPage } from './resend-otp.page';

const routes: Routes = [
  {
    path: '',
    component: ResendOtpPage
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class ResendOtpPageRoutingModule {}
