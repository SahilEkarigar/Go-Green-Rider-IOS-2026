import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { IonTabBar, IonIcon } from '@ionic/angular/standalone';
import { addIcons } from 'ionicons';
import {
  homeOutline,
  homeSharp,
  notificationsOutline,
  notificationsSharp,
  settingsOutline,
  settingsSharp
} from 'ionicons/icons';

@Component({
  selector: 'app-footer-tabs',
  templateUrl: './footer-tabs.component.html',
  styleUrls: ['./footer-tabs.component.scss'],
  standalone: true,
  imports: [IonTabBar, IonIcon, CommonModule],
})
export class FooterTabsComponent {
  constructor(private router: Router) {
    addIcons({
      homeOutline,
      homeSharp,
      notificationsOutline,
      notificationsSharp,
      settingsOutline,
      settingsSharp
    });
  }

  navigateToHome() {
    this.router.navigate(['/home']);
  }

  navigateToNotification() {
    this.router.navigate(['/notification']);
  }

  navigateToAddProduct() {
    this.router.navigate(['/ordere-accepted']);
  }

  navigateTomyaccount() {
    this.router.navigate(['/setting']);
  }

  isActive(paths: string[]): boolean {
    const currentRoute = this.router.url;
    return paths.some(path => currentRoute.startsWith(path));
  }
}
