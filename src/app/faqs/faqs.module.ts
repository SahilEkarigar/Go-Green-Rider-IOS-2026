import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { FAQsPageRoutingModule } from './faqs-routing.module';

import { FAQsPage } from './faqs.page';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    FAQsPageRoutingModule
  ],
  // declarations: [FAQsPage]
})
export class FAQsPageModule {}
