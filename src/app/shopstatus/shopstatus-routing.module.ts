import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { ShopstatusPage } from './shopstatus.page';

const routes: Routes = [
  {
    path: '',
    component: ShopstatusPage
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class ShopstatusPageRoutingModule {}
