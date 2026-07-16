import { Component, OnInit } from '@angular/core';
import { IonicModule, NavController } from '@ionic/angular';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { FooterTabsComponent } from "../components/footer-tabs/footer-tabs.component"; // <-- Import FormsModule
import { AuthserviceService } from '../services/authservice.service';


@Component({
  selector: 'app-notification',
  templateUrl: './notification.page.html',
  styleUrls: ['./notification.page.scss'],
  standalone: true,

  imports: [IonicModule, CommonModule, FormsModule, FooterTabsComponent]
})
export class NotificationPage implements OnInit {
  selectedNotification: { day: string, idx: number } | null = null;
  selectedNotificationItem: any | null = null;
  notifications: Array<{ day: string, items: any[] }> = [];

  constructor(private auth: AuthserviceService, private navCtrl: NavController,) { }

  ngOnInit() {
    const userId = localStorage.getItem('user_id') || '';
    if (!userId) return;
    this.auth.getUserNotifications(userId).subscribe({
      next: (res: any) => {
        // Normalize response: support raw array or wrapped under data
        const list: any[] = Array.isArray(res)
          ? res
          : (Array.isArray(res?.data) ? res.data : (Array.isArray(res?.data?.notifications) ? res.data.notifications : []));
        console.log("notifications list", list)
        // Optional: group by date labels "Today" and "Yesterday"
        const today = new Date();
        const startOfToday = new Date(today.getFullYear(), today.getMonth(), today.getDate()).getTime();
        const startOfYesterday = startOfToday - 24 * 60 * 60 * 1000;

        const todayItems: any[] = [];
        const yesterdayItems: any[] = [];
        const olderItems: any[] = [];

        for (const n of list) {
          const ts = new Date(n.created_at || n.timestamp || n.date || Date.now()).getTime();
          if (ts >= startOfToday) todayItems.push(n);
          else if (ts >= startOfYesterday) yesterdayItems.push(n);
          else olderItems.push(n);
        }

        const grouped: Array<{ day: string, items: any[] }> = [];
        if (todayItems.length) grouped.push({ day: 'Today', items: todayItems });
        if (yesterdayItems.length) grouped.push({ day: 'Yesterday', items: yesterdayItems });
        if (olderItems.length) grouped.push({ day: 'Earlier', items: olderItems });
        this.notifications = grouped;
      },
      error: (err) => {
        console.error('Failed to load notifications', err);
        this.notifications = [];
      }
    });
  }

  showDetails(day: string, idx: number) {
    this.selectedNotification = { day, idx };
    const group = this.notifications.find(g => g.day === day);
    this.selectedNotificationItem = group && group.items ? group.items[idx] : null;

    // Optimistically mark as read in UI and notify backend
    const item = this.selectedNotificationItem;
    if (item && item.is_read === 0 && item.id) {
      item.is_read = 1;
      this.auth.markNotificationRead(item.id).subscribe({
        error: () => {
          // roll back if backend fails
          item.is_read = 0;
        }
      });
    }
  }

  closeDetails() {
    this.selectedNotification = null;
    this.selectedNotificationItem = null;
  }
  goBack() {
    this.navCtrl.navigateBack('/home');
  }
}
