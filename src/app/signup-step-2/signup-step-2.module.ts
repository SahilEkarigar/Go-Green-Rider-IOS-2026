import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { SignupStep2PageRoutingModule } from './signup-step-2-routing.module';

import { SignupStep2Page } from './signup-step-2.page';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    SignupStep2PageRoutingModule
  ],
  // declarations: [SignupStep2Page]
})
export class SignupStep2PageModule {}
