import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { CodeAnalyticsPage } from './codeanalytics.page';

const routes: Routes = [
  {
    path: '',
    component: CodeAnalyticsPage,
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class CodeanalyticsPageRoutingModule {}
