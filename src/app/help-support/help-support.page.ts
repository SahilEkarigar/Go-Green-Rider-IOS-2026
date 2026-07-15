import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { IonicModule, NavController } from '@ionic/angular';
import { FormsModule } from '@angular/forms';
import { Location } from '@angular/common';
@Component({
  selector: 'app-help-support',
  templateUrl: './help-support.page.html',
  styleUrls: ['./help-support.page.scss'],
  standalone: true,
  imports: [IonicModule, FormsModule, CommonModule],
})
export class HelpSupportPage {
  constructor(private location: Location, private navCtrl: NavController) { }

  showChat = false;
  userMessage = '';
  chatState = 0;
  firstMessageSent = false;
  role_id = 3;

  messages: Array<{ from: 'user' | 'bot'; text: string; options?: string[] }> =
    [{ from: 'bot', text: 'Hi! How can I help you today?' }];

  toggleChat() {
    this.showChat = !this.showChat;
  }
  // goBackToScreen() {
  //   this.navCtrl.navigateBack('/setting-screen');
  // }
  sendMessage() {
    const message = this.userMessage.trim();
    if (!message) return;

    this.messages.push({ from: 'user', text: message });

    // Simulate API bot reply
    setTimeout(() => {
      const reply = this.getMockReply(message);
      this.messages.push(reply);
    }, 600);

    this.userMessage = '';
  }

  selectOption(option: string) {
    this.messages.push({ from: 'user', text: option });

    // Simulate API reply with selected option
    setTimeout(() => {
      const reply = this.getMockReply(option);
      this.messages.push(reply);
    }, 600);
  }

  getMockReply(message: string): {
    from: 'user' | 'bot';
    text: string;
    options?: string[];
  } {
    const lower = message.toLowerCase();

    if (lower.includes('order')) {
      return {
        from: 'bot',
        text: 'You can track your order in the "Orders" section of the app.',
        options: ['Track Order', 'Cancel Order'],
      };
    }

    if (lower.includes('refund')) {
      return {
        from: 'bot',
        text: 'Refunds are processed in 5–7 business days. Do you want help with a refund?',
        options: ['Start Refund', 'Policy Info'],
      };
    }

    return {
      from: 'bot',
      text: 'I didn’t understand that. You can ask about orders or refunds.',
      options: ['Orders', 'Refunds'],
    };
  }


  goBack(): void {
    this.location.back();
  }
}
