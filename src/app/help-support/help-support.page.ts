import { Component, ElementRef, ViewChild } from '@angular/core';
import { CommonModule, Location } from '@angular/common';
import { IonicModule, NavController } from '@ionic/angular';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-help-support',
  templateUrl: './help-support.page.html',
  styleUrls: ['./help-support.page.scss'],
  standalone: true,
  imports: [IonicModule, FormsModule, CommonModule],
})
export class HelpSupportPage {

  @ViewChild('chatBody') chatBody!: ElementRef;

  constructor(
    private location: Location,
    private navCtrl: NavController
  ) {
    this.messages = [
      {
        from: 'bot',
        text: this.getGreeting(),
        options: [
          'Track Order',
          'Refund',
          'Payment',
          'Contact Support'
        ]
      }
    ];
  }

  showChat = false;
  userMessage = '';
  role_id = 3;

  supportMessage: string = '';
  isSupportOpen: boolean = false;

  supportEmail = 'contact@gogreentechca.com';

  messages: Array<{
    from: 'user' | 'bot';
    text: string;
    options?: string[];
  }> = [];

  ngOnInit() {
    this.updateSupportStatus();
  }

  updateSupportStatus() {
    const now = new Date();
    const day = now.getDay(); // 0 = Sunday
    const hour = now.getHours();

    // Monday to Saturday, 9 AM - 8 PM
    this.isSupportOpen =
      day >= 1 &&
      day <= 6 &&
      hour >= 9 &&
      hour < 20;

    if (this.isSupportOpen) {
      this.supportMessage =
        'Our support team is currently online. Feel free to email us, and we will respond as soon as possible during business hours.';
    } else {
      this.supportMessage =
        'Our support team is currently offline. Please email us at contact@gogreentechca.com, and we will respond on the next business day.';
    }
  }

  toggleChat() {
    this.showChat = !this.showChat;

    setTimeout(() => this.scrollToBottom(), 100);
  }

  sendMessage() {
    const message = this.userMessage.trim();

    if (!message) {
      return;
    }

    this.messages.push({
      from: 'user',
      text: message
    });

    this.userMessage = '';

    setTimeout(() => {
      this.messages.push(this.getMockReply(message));
      this.scrollToBottom();
    }, 500);
  }

  selectOption(option: string) {
    this.messages.push({
      from: 'user',
      text: option
    });

    setTimeout(() => {
      this.messages.push(this.getMockReply(option));
      this.scrollToBottom();
    }, 500);
  }

  getGreeting(): string {

    const hour = new Date().getHours();

    if (hour < 12) {
      return '🌞 Good Morning! How can we help you today?';
    }

    if (hour < 17) {
      return '☀️ Good Afternoon! How can we help you today?';
    }

    return '🌙 Good Evening! How can we help you today?';
  }

  getMockReply(message: string): {
    from: 'bot';
    text: string;
    options?: string[];
  } {

    const text = message.toLowerCase();

    if (text.includes('order') || text.includes('track')) {
      return {
        from: 'bot',
        text: 'You can track your order from the Orders section of the app.',
        options: ['Track Order', 'Cancel Order']
      };
    }

    if (text.includes('refund')) {
      return {
        from: 'bot',
        text: 'Refunds are usually processed within 5–7 business days.',
        options: ['Refund Status', 'Refund Policy']
      };
    }

    if (text.includes('payment')) {
      return {
        from: 'bot',
        text: 'If your payment failed, please verify your card or payment method and try again.',
        options: ['Retry Payment', 'Payment Failed']
      };
    }

    if (text.includes('account')) {
      return {
        from: 'bot',
        text: 'For account-related issues, please ensure your profile information is up to date.',
        options: ['Update Profile', 'Reset Password']
      };
    }

    if (text.includes('support') ||
      text.includes('contact') ||
      text.includes('email')) {

      return {
        from: 'bot',
        text:
          `You can contact our support team at ${this.supportEmail}.\n\nSupport Hours:\nMonday - Saturday\n9:00 AM - 8:00 PM`
      };
    }

    if (text.includes('cancel')) {
      return {
        from: 'bot',
        text:
          'Orders can only be cancelled before the vendor starts preparing them.'
      };
    }

    return {
      from: 'bot',
      text:
        'I can help you with Orders, Refunds, Payments, Account issues, or Contact Support.',
      options: [
        'Track Order',
        'Refund',
        'Payment',
        'Contact Support'
      ]
    };
  }

  scrollToBottom() {

    setTimeout(() => {

      if (this.chatBody) {
        this.chatBody.nativeElement.scrollTop =
          this.chatBody.nativeElement.scrollHeight;
      }

    }, 100);
  }

  goBack() {
    this.location.back();
  }

}