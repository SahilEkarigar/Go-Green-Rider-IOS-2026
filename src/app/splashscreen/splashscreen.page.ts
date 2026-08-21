import { Component, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { IonicModule } from '@ionic/angular';
import { Storage } from '@ionic/storage-angular';
import { jwtDecode } from 'jwt-decode';

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

  doRefresh(event: any): void {
    setTimeout(() => {
      event.target.complete();
    }, 800);
  }

  async ngOnInit() {
    await this.storage.create();
    const token = (await this.storage.get('user_token')) || (await this.storage.get('token'));

    if (!this.openedByNotification) {
      if (token) {
        try {
          const decoded: any = jwtDecode(token);
          if (decoded && decoded.user_id) {
            const isVerified = decoded?.is_verified ?? decoded?.verification_Done;
            if (Number(isVerified) === 1) {
              this.router.navigate(['home'], { replaceUrl: true });
            } else {
              this.router.navigate(['application-review'], { replaceUrl: true });
            }
          } else {
            await this.storage.clear();
            localStorage.removeItem('user_id');
            this.router.navigate(['/welcome'], { replaceUrl: true });
          }
        } catch (e) {
          console.error('Invalid token on splashscreen:', e);
          await this.storage.clear();
          localStorage.removeItem('user_id');
          this.router.navigate(['/welcome'], { replaceUrl: true });
        }
      } else {
        setTimeout(() => {
          this.router.navigate(['/welcome'], { replaceUrl: true });
        }, 1500);
      }
    }
  }
}
