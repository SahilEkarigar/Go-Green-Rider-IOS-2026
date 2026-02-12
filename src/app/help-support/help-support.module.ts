import { CUSTOM_ELEMENTS_SCHEMA, NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { HelpSupportPageRoutingModule } from './help-support-routing.module';

import { HelpSupportPage } from './help-support.page';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    HelpSupportPageRoutingModule,
    HelpSupportPage
  ],
   schemas: [CUSTOM_ELEMENTS_SCHEMA]
})
export class HelpSupportPageModule {}
