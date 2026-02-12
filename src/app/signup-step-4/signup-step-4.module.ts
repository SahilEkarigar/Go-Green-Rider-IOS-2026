import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { SignupStep4PageRoutingModule } from './signup-step-4-routing.module';

import { SignupStep4Page } from './signup-step-4.page';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    SignupStep4PageRoutingModule
  ],
  // declarations: [SignupStep4Page]
})
export class SignupStep4PageModule {}
