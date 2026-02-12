import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { BankinfoPage } from './bankinfo.page';

const routes: Routes = [
  {
    path: '',
    component: BankinfoPage
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class BankinfoPageRoutingModule {}
