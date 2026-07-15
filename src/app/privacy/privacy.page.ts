import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { IonicModule, NavController } from '@ionic/angular';
import { Location } from '@angular/common';

@Component({
  selector: 'app-privacy',
  templateUrl: './privacy.page.html',
  styleUrls: ['./privacy.page.scss'],
  standalone: true,
  imports: [IonicModule, FormsModule, CommonModule],
})
export class PrivacyPage implements OnInit {
  constructor(private location: Location, private navCtrl: NavController) {}

  ngOnInit() {}
  goBack(): void {
    this.location.back();
  }
  // goBackToScreen() {
  //   this.navCtrl.navigateBack('/setting-screen');
  // }
}
