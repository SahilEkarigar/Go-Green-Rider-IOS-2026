import { Component } from '@angular/core';
import { IonicModule } from '@ionic/angular';
import { Router } from '@angular/router';
import { Location } from '@angular/common';

import { addIcons } from 'ionicons';
import {
  chevronBackOutline,
  informationCircleOutline
} from 'ionicons/icons';


@Component({
  selector: 'app-application-review',
  templateUrl: './application-review.page.html',
  styleUrls: ['./application-review.page.scss'],
  standalone: true,
  imports: [
    IonicModule
  ]
})
export class ApplicationReviewPage {

  constructor(
    private router: Router,
    private location: Location
  ) {
    addIcons({
      chevronBackOutline,
      informationCircleOutline
    });
  }


  goHome(): void {

    this.router.navigate([
      '/login'
    ]);

  }


  goBack(): void {

    this.location.back();

  }

}