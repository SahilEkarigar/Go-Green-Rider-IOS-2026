import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { ApplicationReviewPage } from './application-review.page';

const routes: Routes = [
  {
    path: '',
    component: ApplicationReviewPage
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class ApplicationReviewPageRoutingModule {}
