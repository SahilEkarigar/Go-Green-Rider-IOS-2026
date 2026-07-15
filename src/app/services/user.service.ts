import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { HttpClient } from '@angular/common/http';
import { AuthserviceService } from './authservice.service';
import { Storage } from '@ionic/storage-angular';
import {jwtDecode} from 'jwt-decode';
import { Router } from '@angular/router';

@Injectable({
  providedIn: 'root',
})
export class UserService {
  private userSubject = new BehaviorSubject<any>(null);
  user$ = this.userSubject.asObservable();

  constructor(
    private router: Router,
    private http: HttpClient,
    private authService: AuthserviceService,
    private storage: Storage
  ) {
    this.init();
  }

  async init() {
    this.storage = await this.storage.create();
    const token = await this.storage.get('token');
    if (token) {
      this.fetchUserInfo(token);
    } else {
      console.log('⚠️ No token found in storage');
    }
  }

  async fetchUserInfo(token: any) {
    if (!token) return console.log('❌ No valid token available');

    try {
      const decoded: any = jwtDecode(token);
      const user_id = decoded.user_id;
      const requestBody = { user_id, role_id: 4 };
      console.log('RequestBody:', requestBody);

      (await this.authService.riderProfileDetails(requestBody)).subscribe({
        next: (user) => {
          this.userSubject.next(user);
          console.log('✅ User Data Fetched:', user);
        },
        error: (err) => {
          console.error('❌ Failed to fetch user', err);
        },
      });
    } catch (err) {
      console.error('❌ Token decode failed', err);
    }
  }

  // 🔹 Force refresh user data from backend
  async refreshUserData(): Promise<void> {
    const token = await this.storage.get('token');
    if (!token) {
      console.log('⚠️ No token found for refresh');
      return;
    }
    await this.fetchUserInfo(token); // fetch fresh data and update BehaviorSubject
  }

  getCurrentUser() {
    return this.userSubject.getValue(); // optional sync access
  }

  setUser(user: any) {
    this.userSubject.next(user);
    console.log('✅ User manually set:', user);
  }

  clearUser() {
    this.userSubject.next(null);
    this.storage.remove('token');
    console.log('🚪 User logged out');
  }
}
