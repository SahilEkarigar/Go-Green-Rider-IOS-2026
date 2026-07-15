import { Component, OnInit, ElementRef, ViewChild } from '@angular/core';
import { IonicModule } from '@ionic/angular';
import { FormsModule } from '@angular/forms'; 

@Component({
  selector: 'app-resend-otp',
  templateUrl: './resend-otp.page.html',
  styleUrls: ['./resend-otp.page.scss'],
  standalone: true,
  imports: [IonicModule, FormsModule], 
})
export class ResendOtpPage implements OnInit {

  @ViewChild('otpContainer', { static: true }) otpContainer!: ElementRef;

  constructor() { }

  ngOnInit() {}

  moveToNext(event: any) {
    const input = event.target;
    const value = input.value;
    
    // Allow only numbers
    if (!/^\d$/.test(value)) {
      input.value = ''; // Clear if not a number
      return;
    }

    const nextInput = input.nextElementSibling;
    if (nextInput && value !== '') {
      nextInput.focus();
    }
  }

  handleBackspace(event: any) {
    const input = event.target;

    if (event.key === 'Backspace' && input.value === '') {
      const prevInput = input.previousElementSibling;
      if (prevInput) {
        prevInput.focus();
      }
    }
  }
}
