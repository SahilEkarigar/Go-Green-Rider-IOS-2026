import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { BankinfoPageRoutingModule } from './bankinfo-routing.module';

import { BankinfoPage } from './bankinfo.page';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    BankinfoPageRoutingModule
  ],
  // declarations: [BankinfoPage]
})
export class BankinfoPageModule {}
