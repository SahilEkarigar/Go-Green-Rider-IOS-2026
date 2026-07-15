import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { VehicelDetailsPage } from './vehicel-details.page';

const routes: Routes = [
  {
    path: '',
    component: VehicelDetailsPage
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class VehicelDetailsPageRoutingModule {}
