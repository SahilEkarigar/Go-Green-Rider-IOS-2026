import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { ResendOtpPageRoutingModule } from './resend-otp-routing.module';

import { ResendOtpPage } from './resend-otp.page';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    ResendOtpPageRoutingModule
  ],
  declarations: []
})
export class ResendOtpPageModule {}
