import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IonicModule } from '@ionic/angular';
import { ApplicationReviewPageRoutingModule } from './application-review-routing.module';
import { ApplicationReviewPage } from './application-review.page'; // ✅ Import the standalone component

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    ApplicationReviewPageRoutingModule,
    ApplicationReviewPage // ✅ Import the standalone component here instead of declaring it
  ],
  schemas: []
})
export class ApplicationReviewPageModule {}
