import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { VehicelDetailsPageRoutingModule } from './vehicel-details-routing.module';

import { VehicelDetailsPage } from './vehicel-details.page';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    VehicelDetailsPageRoutingModule
  ],
  declarations: []
})
export class VehicelDetailsPageModule {}
