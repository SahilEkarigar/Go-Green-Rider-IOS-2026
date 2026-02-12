import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { ShopstatusPageRoutingModule } from './shopstatus-routing.module';

import { ShopstatusPage } from './shopstatus.page';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    ShopstatusPageRoutingModule
  ],
  // declarations: [ShopstatusPage]
})
export class ShopstatusPageModule {}
