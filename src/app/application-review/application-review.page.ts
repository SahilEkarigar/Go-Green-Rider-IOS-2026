import { Component } from '@angular/core';
import { IonicModule } from '@ionic/angular';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { Location } from '@angular/common';

@Component({
  selector: 'app-application-review',
  templateUrl: './application-review.page.html',
  styleUrls: ['./application-review.page.scss'],
  standalone: true,
  imports: [IonicModule, CommonModule, FormsModule]
})
export class ApplicationReviewPage {
  constructor(private router: Router,private location: Location,) {}

  goHome() {
    this.router.navigate(['/login']);
  }
  goBack(): void {
    this.location.back();
  }
}
