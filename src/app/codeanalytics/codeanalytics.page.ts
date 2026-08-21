import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { IonicModule, NavController } from '@ionic/angular';
import { FormsModule } from '@angular/forms';
import { Location } from '@angular/common';
import { AuthserviceService } from '../services/authservice.service';
import { Storage } from '@ionic/storage-angular';

type TimeFrame = 'today' | 'week' | 'month';

@Component({
  selector: 'app-codeanalytics',
  templateUrl: './codeanalytics.page.html',
  styleUrls: ['./codeanalytics.page.scss'],
  standalone: true,
  imports: [IonicModule, CommonModule, FormsModule],
})
export class CodeAnalyticsPage implements OnInit {
  constructor(
    private location: Location,
    private navCtrl: NavController,
    private authservice: AuthserviceService,
    private storage: Storage,
  ) {}

  selectedTab: TimeFrame = 'today';
  currentData: any;
  user_id: any;
  topDay: { day: string; orders: number } | null = null;
  repeatCustomerPercentage: string | null = null;

  stats: Record<TimeFrame, any> = {
    today: { labels: [], dailyOrders: [], totalOrders: 0, completionRate: 0 },
    week: { labels: [], dailyOrders: [], totalOrders: 0, completionRate: 0 },
    month: { labels: [], dailyOrders: [], totalOrders: 0, completionRate: 0 },
  };

  async ngOnInit() {
    await this.storage.create();
    this.user_id = await this.storage.get('user_id');
    this.loadAnalytics();
  }

  doRefresh(event: any) {
    this.loadAnalytics(event);
  }

  loadAnalytics(refresherEvent?: any) {
    this.authservice.getRiderAnalytics(this.user_id).subscribe({
      next: (res: any) => {
        if (refresherEvent) refresherEvent.target.complete();
        if (res.success) {
        const data = res.data;
        // console.log("received data", data);

        // 👉 Today data from API
        this.stats.today = {
          labels: data.ordersByHour.map((o: any) => `${o.order_hour}:00`),
          dailyOrders: data.ordersByHour.map((o: any) => o.order_count),
          totalOrders: data.totalOrdersToday,
          completionRate: parseFloat(data.completionRate),
        };

        // 👉 Week data from API
        this.stats.week = {
          labels: data.dayOfWeekOrders.map((o: any) => o.day),
          dailyOrders: data.dayOfWeekOrders.map((o: any) => o.orders),
          totalOrders: data.totalOrdersWeek,
          completionRate: parseFloat(data.completionRate),
        };

        // 👉 Month data from API
        this.stats.month = {
          labels: data.weekOfMonthOrders.map((o: any) => `Week ${o.week_of_month}`),
          dailyOrders: data.weekOfMonthOrders.map((o: any) => o.order_count),
          totalOrders: data.totalOrdersMonth,
          completionRate: parseFloat(data.completionRate),
        };

        // 👉 extra fields for cards
        this.topDay = data.topDay;
        this.repeatCustomerPercentage = data.repeatCustomerPercentage;

        // set default tab data
        this.currentData = this.stats[this.selectedTab];
      }
    },
    error: () => {
      if (refresherEvent) refresherEvent.target.complete();
    }
    });
  }


  selectTab(tab: TimeFrame) {
    this.selectedTab = tab;
    this.currentData = this.stats[tab];
    this.updateCharts();
  }

  // your initCharts & updateCharts stay the same
  initCharts() {}
  updateCharts() {}

  goBack(): void {
    this.location.back();
  }

  goBackToScreen() {
    this.navCtrl.navigateBack('/setting-screen');
  }
}
