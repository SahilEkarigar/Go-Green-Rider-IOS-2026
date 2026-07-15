import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { SignupStep3PageRoutingModule } from './signup-step-3-routing.module';

import { SignupStep3Page } from './signup-step-3.page';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    SignupStep3PageRoutingModule,
    SignupStep3Page
  ],
  // declarations: [SignupStep3Page]
})
export class SignupStep3PageModule {}
