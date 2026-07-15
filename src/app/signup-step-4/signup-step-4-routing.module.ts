import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { SignupStep4Page } from './signup-step-4.page';

const routes: Routes = [
  {
    path: '',
    component: SignupStep4Page
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class SignupStep4PageRoutingModule {}
