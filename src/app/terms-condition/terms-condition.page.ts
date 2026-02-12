import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common'; 
import { IonicModule, NavController } from '@ionic/angular';
import { Location } from '@angular/common';
import { FormsModule } from '@angular/forms';
@Component({
  selector: 'app-terms-condition',
  templateUrl: './terms-condition.page.html',
  styleUrls: ['./terms-condition.page.scss'],
  standalone: true,
    imports: [IonicModule, FormsModule, CommonModule],
})
export class TermsConditionPage implements OnInit {

  constructor(private location: Location,private navCtrl: NavController) { }

  ngOnInit() {
  }
  // goBackToScreen() {
  //   this.navCtrl.navigateBack('/setting-screen');
  // }

  goBack(): void {
    this.location.back();
  }
}
