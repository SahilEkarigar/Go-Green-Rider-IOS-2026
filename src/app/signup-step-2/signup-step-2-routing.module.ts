import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { SignupStep2Page } from './signup-step-2.page';

const routes: Routes = [
  {
    path: '',
    component: SignupStep2Page
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class SignupStep2PageRoutingModule {}
