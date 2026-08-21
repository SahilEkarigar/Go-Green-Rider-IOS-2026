import { Component, OnInit } from '@angular/core';
import { IonicModule } from '@ionic/angular';
import { Router } from '@angular/router';
import { Location } from '@angular/common';
import { Storage } from '@ionic/storage-angular';

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
export class ApplicationReviewPage implements OnInit {

  constructor(
    private router: Router,
    private location: Location,
    private storage: Storage
  ) {
    addIcons({
      chevronBackOutline,
      informationCircleOutline
    });
  }

  async ngOnInit(): Promise<void> {
    await this.storage.create();
    const token = (await this.storage.get('user_token')) || (await this.storage.get('token'));
    if (!token) {
      this.router.navigate(['/welcome'], { replaceUrl: true });
    }
  }


  goHome(): void {

    this.router.navigate([
      '/welcome'
    ]);

  }


  doRefresh(event: any): void {
    setTimeout(() => {
      event.target.complete();
    }, 800);
  }

  goBack(): void {

    this.location.back();

  }

}