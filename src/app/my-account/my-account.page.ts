import { Component, OnInit } from '@angular/core';
import { IonicModule } from '@ionic/angular';
import { FormsModule } from '@angular/forms';
import { FooterTabsComponent } from "../components/footer-tabs/footer-tabs.component"; // <-- Import FormsModule

@Component({
  selector: 'app-my-account',
  templateUrl: './my-account.page.html',
  styleUrls: ['./my-account.page.scss'],
    standalone: true,
    imports: [IonicModule, FormsModule, FooterTabsComponent], // Import IonicModule here
})
export class MyAccountPage implements OnInit {

  constructor() { }

  ngOnInit() {
  }

}
