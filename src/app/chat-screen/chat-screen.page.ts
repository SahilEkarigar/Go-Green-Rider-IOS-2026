import { SocketService } from './../services/socket.service';
import { Component, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { IonicModule } from '@ionic/angular';
import { CommonModule } from '@angular/common';
import { Location } from '@angular/common';
import { AuthserviceService } from '@app/services/authservice.service';

@Component({
  selector: 'app-chat-screen',
  templateUrl: './chat-screen.page.html',
  styleUrls: ['./chat-screen.page.scss'],
  standalone: true,
  imports: [IonicModule, FormsModule, CommonModule],
})
export class ChatScreenPage implements OnInit {
  
  orderId: string = '';
  messages: any[] = [];
  customerName: string = '';
  customer_id: any;
  rider_id: any;

  constructor(
    private socketService: SocketService,
    private location: Location, 
    private authService: AuthserviceService
  ) {}

  ngOnInit() {
    const navigation = history.state;
    this.customerName = navigation.customerName || 'Customer';
    this.customer_id = navigation.customer_id;
    this.rider_id = navigation.rider_id;
    this.orderId = navigation.orderId;

    // ------------------------------
    // JOIN RIDER ROOM
    // ------------------------------
      // ⭐ JOIN RIDER ROOM ONLY AFTER SOCKET CONNECTS ⭐
    this.socketService.connectionStatus$().subscribe((isConnected: any) => {
      if (isConnected) {
        this.socketService.joinRiderRoom(this.rider_id);
        console.log("📌 Rider joined room:", this.rider_id);
      }
    });

    // ------------------------------
    // LISTEN FOR REAL-TIME MESSAGES
    // ------------------------------
    this.socketService.on<any>("receive_message").subscribe((msg: { ride_id: string; }) => {
        if (msg.ride_id == this.orderId) {
          this.messages.push(msg);
          this.scrollToBottom();
        }
      });

    // Load old messages
    this.getOldMessages();
  }

  // ------------------------------
  // FETCH OLD CHAT HISTORY
  // ------------------------------
  getOldMessages() {
    this.authService.getChatMessages({
      ride_id: this.orderId,
      rider_id: this.rider_id,
      customer_id: this.customer_id
    }).then(api => {
      api.subscribe((res: any) => {
        if (res.status) {
          this.messages = res.data;
          console.log("📜 Old messages:", this.messages);
        }
      });
    });
  }

  // ------------------------------
  // SEND MESSAGE
  // ------------------------------
  sendMessage(message: string) {
    if (!message.trim()) return;

    const data = {
      ride_id: this.orderId,
      sender_id: this.rider_id,
      receiver_id: this.customer_id,
      sender_type: "rider",
      message: message,
      sent_at: this.formatMySQLDate(new Date())
    };

    console.log("🟢 Rider sending:", data);

    this.socketService.sendMessage(data);
    this.messages.push(data);

    this.scrollToBottom();
  }

  // Format time
  formatMySQLDate(date: Date) {
    return date.toISOString().slice(0, 19).replace("T", " ");
  }

  // Scroll chat
  scrollToBottom() {
    const content = document.querySelector('#chatMessages');
    setTimeout(() => {
      content?.scrollTo({
        top: content.scrollHeight,
        behavior: "smooth"
      });
    }, 100);
  }

  goBack() {
    this.location.back();
  }
}
