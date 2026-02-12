import { Component, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { IonicModule } from '@ionic/angular';
import { Storage } from '@ionic/storage-angular';

@Component({
  selector: 'app-splashscreen',
  templateUrl: './splashscreen.page.html',
  styleUrls: ['./splashscreen.page.scss'],
  standalone: true,
  imports: [IonicModule, FormsModule],
})
export class SplashscreenPage implements OnInit {
  private openedByNotification = false;

  constructor(
    private router: Router,
    private storage: Storage,
  ) {}

  async ngOnInit() {
    await this.storage.create();
    const token = await this.storage.get('token');
    console.log('✅ User verified redirect to home page :', token);

    if (!this.openedByNotification) {
      if (token) {
        this.router.navigate(['home']);
      } else {
        setTimeout(() => {
          this.router.navigate(['/welcome']);
        }, 3000);
      }
    }
  }
}
