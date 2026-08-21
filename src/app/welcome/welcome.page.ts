import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { IonicModule } from '@ionic/angular';

@Component({
  selector: 'app-welcome',
  templateUrl: './welcome.page.html',
  styleUrls: ['./welcome.page.scss'],
  standalone: true,
  imports: [
    IonicModule
  ]
})
export class WelcomePage {

  constructor(
    private router: Router
  ) {}

  doRefresh(event: any): void {
    setTimeout(() => {
      event.target.complete();
    }, 800);
  }

  loginPage(): void {
    this.router.navigate(['/login']);
  }

  signUpPage(): void {
    this.router.navigate(['/signup']);
  }

}