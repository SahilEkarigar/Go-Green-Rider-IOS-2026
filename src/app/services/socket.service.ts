import { Injectable } from '@angular/core';
import io from 'socket.io-client';
import { Observable, Subject, BehaviorSubject, take } from 'rxjs';
import { AuthserviceService } from './authservice.service';
import { Storage } from '@ionic/storage-angular';
type SocketType = ReturnType<typeof io>;



@Injectable({
  providedIn: 'root'
})
export class SocketService {
  private isConnecting = false;
  private socket: SocketType | null = null;
  private readonly SOCKET_URL = 'https://cx.ekarigar.com';
  private readonly SOCKET_PATH = '/delievery-api/socket.io';

  private buzzerStopSubject = new Subject<{ orderId: string }>();
  private orderAcceptedSubject = new Subject<{ success: boolean; error?: string }>();
  private connected$ = new BehaviorSubject<boolean>(false);
  private newOrderSubject = new BehaviorSubject<any>(null);
  newOrder$ = this.newOrderSubject.asObservable();

  constructor(private authservice: AuthserviceService, private storage: Storage) { }
  async ngOninit() {
    await this.storage.create();
  }
  async connect(riderId: string | number) {
    if (this.isConnecting) return;

    // ✅ socket exists but disconnected → reconnect instead of recreate
    if (this.socket) {
      if (!this.socket.connected) {
        console.log('🔁 Reconnecting existing socket...');
        this.isConnecting = true;
        this.socket.connect();
        return;
      }

      // already connected
      console.log('⚠️ Socket already connected');
      return;
    }

    // 👇 Create socket ONLY ONCE
    this.isConnecting = true;

    this.socket = io(this.SOCKET_URL, {
      transports: ['websocket'],
      path: this.SOCKET_PATH,
      query: { riderId: String(riderId) },
      reconnection: false, // important: let SocketManager handle retries
    });

    this.registerCoreListeners(riderId);
  }

  private registerCoreListeners(riderId: string | number) {
    if (!this.socket) return;

    this.socket.on('connect', () => {
      console.log('✅ Socket connected:', this.socket?.id);
      this.connected$.next(true);
      this.isConnecting = false;
      this.socket?.emit('join', { role: 'rider', id: String(riderId) });
    });

    // ✅ DEBUG: Log ALL incoming events to find the correct order event name
    (this.socket as any).onAny((event: any, ...args: any[]) => {
      console.log(`🔥 Socket Any Event: ${event}`, args);
    });

    // ✅ Listen for possible order events (provisional)
    this.socket.on('new_order', (data: any) => {
      console.log('📦 Socket received new-order:', data);
      this.newOrderSubject.next(data);
    });

    this.socket.on('disconnect', (reason: any) => {
      console.warn('❌ Socket disconnected:', reason);
      this.connected$.next(false);
      this.isConnecting = false;
    });

    this.socket.on('connect_error', (err: any) => {
      console.error('⚠️ Socket connect error:', err);
      this.connected$.next(false);
      this.isConnecting = false;
    });
  }



  disconnect() {
    if (!this.socket) return;

    console.log('🔌 Disconnecting socket...');

    this.socket.removeAllListeners();
    this.socket.disconnect();
    this.socket = null;

    this.connected$.next(false);
    this.isConnecting = false;
  }


  connectionStatus$() {
    return this.connected$.asObservable();
  }
  on<T>(eventName: string): Observable<T> {
    return new Observable(observer => {
      this.socket?.on(eventName, (data: T) => observer.next(data));
    });
  }
  isConnected(): boolean {
    return this.socket?.connected || false;
  }

  getSocketId(): string | undefined {
    return this.socket?.id;
  }

  joinRiderRoom(rider_id: string): void {
    if (!this.socket || !this.socket.connected) {
      this.connect(rider_id);
      return;
    }
    this.socket.emit("join_rider", { rider_id });
    console.log("🚴 Rider joined socket room rider_" + rider_id);
  }

  sendRiderLocation(data: { user_id: string | number; rider_lat: number; rider_lng: number }) {
    if (!this.socket || !this.socket.connected) {
      console.warn("⚠️ Cannot send location — socket not connected");
      return;
    }

    console.log("📡 Sending rider location via socket:", data);
    this.socket.emit("rider-location", data);
  }



  /** Listen to OTP events safely, auto-connects if needed */
  listenToOtp(
    orderId: string
  ): Observable<{ orderId: string; riderId: string; otp: string }> {

    console.log("listenToOtp called for orderId:", orderId);

    return new Observable(subscriber => {
      // ❌ Do NOT connect here
      if (!this.socket || !this.socket.connected) {
        subscriber.error('Socket not connected. Ensure socket is connected before listening to OTP.');
        return;
      }

      console.log("✅ Socket already connected, subscribing to OTP event");
      this.subscribeToOtpEvent(orderId, subscriber);
    });
  }



  private subscribeToOtpEvent(orderId: string, subscriber: any) {
    if (!this.socket) return;

    const eventName = `otp-generated-${orderId}`;
    console.log("Listening to socket event:", eventName);

    const listener = (data: { orderId: string; riderId: string; otp: string }) => {
      console.log("Socket event received:", eventName, data);
      subscriber.next(data);
    };

    this.socket.on(eventName, listener);

    // Cleanup when unsubscribed
    subscriber.add(() => {
      console.log("Unsubscribing from socket event:", eventName);
      this.socket?.off(eventName, listener);
    });
  }



  // Example: listen for stop-buzzer event
  listenForStopBuzzer(orderId: string): Observable<{ orderId: string }> {
    return new Observable(observer => {
      if (!this.socket || !this.socket.connected) {
        console.warn('Socket not connected for stop-buzzer listener');
        return;
      }

      const eventName = `stop-buzzer-${orderId}`;
      const listener = (data: { orderId: string }) => {
        console.log(`Stop buzzer event received for ${orderId}:`, data);
        observer.next(data);
      };

      this.socket.on(eventName, listener);

      // Cleanup on unsubscribe
      return () => {
        this.socket?.off(eventName, listener);
      };
    });
  }

  onOrderAccepted(): Observable<{ success: boolean; error?: string }> {
    return this.orderAcceptedSubject.asObservable();
  }

  joinOrderRoom(orderId: string): void {
    if (!this.socket || !this.socket.connected) {
      console.warn('Socket not connected, cannot join order room');
      return;
    }

    console.log(`Joining order room: ${orderId}`);
    this.socket.emit('joinOrderRoom', orderId);
  }


  leaveOrderRoom(orderId: string): void {
    if (!this.socket || !this.socket.connected) {
      console.warn('Socket not connected, cannot leave order room');
      return;
    }

    console.log(`Leaving order room: ${orderId}`);
    this.socket.emit('leaveOrderRoom', orderId);
  }

  async handleOrder(data: { orderId: string; riderId: string; status: number }): Promise<void> {
    if (!this.socket || !this.socket.connected) {
      console.warn('Socket not connected, cannot handle order');
      return;
    }

    console.log(`Handling order: ${data.orderId} by rider: ${data.riderId}, status: ${data.status}`);
    this.socket.emit('handleOrder', data);

    if (data.status === 2) {
      (await this.authservice.handleOrderByRider(data)).subscribe((response) => {
        console.log('Order handled:', response);
      });
    }
  }

  listenToOtpVerified(orderId: string) {
    return new Observable<any>((subscriber) => {
      this.socket?.on(`otp-verified-${orderId}`, (data: any) => {
        subscriber.next(data);
      });
    });
  }
  listen(eventName: string): Observable<any> {
    return new Observable((subscriber) => {
      if (!this.socket) return;

      this.socket.on(eventName, (data: any) => {
        subscriber.next(data);
      });

      return () => {
        this.socket?.off(eventName);
      };
    });
  }

  // --- CHAT FEATURE ---

  /** Send chat message */
  sendMessage(data: any) {
    if (!this.socket || !this.socket.connected) {
      console.warn("⚠️ Cannot send message — socket not connected");
      return;
    }

    console.log("📤 Sending chat message:", data);
    this.socket.emit("send_message", data);
  }

  /** Listen for incoming messages */
  listenForMessages(chatId: string | number) {
    return new Observable((subscriber) => {
      if (!this.socket) return;

      const eventName = `chat_message_${chatId}`;
      console.log("👂 Listening for:", eventName);

      this.socket.on(eventName, (data: any) => {
        subscriber.next(data);
      });

      return () => {
        this.socket?.off(eventName);
      };
    });
  }

  /** Let backend know user is typing */
  sendTyping(chatId: string, userId: string) {
    this.socket?.emit("typing", { chatId, userId });
  }

  /** Listen for typing indicator */
  listenTyping(chatId: string): Observable<any> {
    return this.listen(`typing_${chatId}`);
  }

}
