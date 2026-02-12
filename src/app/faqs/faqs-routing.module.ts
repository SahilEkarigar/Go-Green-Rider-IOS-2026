import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { FAQsPage } from './faqs.page';

const routes: Routes = [
  {
    path: '',
    component: FAQsPage
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class FAQsPageRoutingModule {}
