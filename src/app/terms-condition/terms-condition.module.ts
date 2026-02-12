import { CUSTOM_ELEMENTS_SCHEMA, NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { TermsConditionPageRoutingModule } from './terms-condition-routing.module';

import { TermsConditionPage } from './terms-condition.page';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    
    IonicModule,
    TermsConditionPageRoutingModule,
    TermsConditionPage
  ],
   schemas: [CUSTOM_ELEMENTS_SCHEMA]
})
export class TermsConditionPageModule {}
