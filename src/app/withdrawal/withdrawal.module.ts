import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { WithdrawalPageRoutingModule } from './withdrawal-routing.module';

import { WithdrawalPage } from './withdrawal.page';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    WithdrawalPageRoutingModule
  ],
  // declarations: [WithdrawalPage]
})
export class WithdrawalPageModule {}
