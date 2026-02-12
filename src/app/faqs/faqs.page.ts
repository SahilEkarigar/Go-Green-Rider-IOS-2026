import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { IonicModule, NavController } from '@ionic/angular';
import { Location } from '@angular/common';

@Component({
  selector: 'app-faqs',
  templateUrl: './faqs.page.html',
  styleUrls: ['./faqs.page.scss'],
  standalone: true,
  imports: [IonicModule, FormsModule, CommonModule],
})
export class FAQsPage implements OnInit {
  constructor(private navCtrl: NavController,private location: Location) { }
  goBackToScreen() {
    this.navCtrl.navigateBack('/setting-screen');
  }

  ngOnInit() { }

  goBack(): void {
    this.location.back();
  }
}
