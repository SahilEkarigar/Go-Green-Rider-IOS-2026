import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { StoreDetailsPageRoutingModule } from './store-details-routing.module';

import { StoreDetailsPage } from './store-details.page';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    StoreDetailsPageRoutingModule,
    StoreDetailsPage
  ]
  // declarations: [StoreDetailsPage]
})
export class StoreDetailsPageModule {}
