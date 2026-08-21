import { Component, OnInit } from '@angular/core';
import { IonicModule } from '@ionic/angular';
import { FormsModule } from '@angular/forms'; // <-- Import FormsModule

@Component({
  selector: 'app-registration',
  templateUrl: './registration.page.html',
  styleUrls: ['./registration.page.scss'],
   standalone: true,
    imports: [IonicModule, FormsModule], // Import IonicModule here
})
export class RegistrationPage implements OnInit {

  constructor() { }

  ngOnInit() {
  }

  doRefresh(event: any): void {
    setTimeout(() => {
      event.target.complete();
    }, 800);
  }

}
