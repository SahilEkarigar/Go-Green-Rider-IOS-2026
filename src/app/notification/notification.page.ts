import {
  Component,
  OnInit
} from '@angular/core';

import {
  CommonModule
} from '@angular/common';

import {
  IonicModule,
  NavController
} from '@ionic/angular';

import {
  FooterTabsComponent
} from '../components/footer-tabs/footer-tabs.component';

import {
  AuthserviceService
} from '../services/authservice.service';


@Component({
  selector: 'app-notification',
  templateUrl: './notification.page.html',
  styleUrls: ['./notification.page.scss'],
  standalone: true,
  imports: [
    IonicModule,
    CommonModule,
    FooterTabsComponent
  ]
})
export class NotificationPage implements OnInit {

  selectedNotification: {
    day: string;
    idx: number;
  } | null = null;


  selectedNotificationItem:
    any | null = null;


  notifications:
    Array<{
      day: string;
      items: any[];
    }> = [];


  loadingNotifications:
    boolean = true;


  constructor(
    private auth: AuthserviceService,
    private navCtrl: NavController
  ) {}


  /* =====================================================
     INIT
  ===================================================== */

  ngOnInit(): void {

    this.loadNotifications();

  }


  doRefresh(event: any): void {
    this.loadNotifications(event);
  }


  /* =====================================================
     LOAD NOTIFICATIONS
  ===================================================== */

  private loadNotifications(refresherEvent?: any): void {

    const userId =
      localStorage.getItem(
        'user_id'
      ) || '';


    if (!userId) {

      this.notifications = [];

      this.loadingNotifications =
        false;

      if (refresherEvent) refresherEvent.target.complete();
      return;

    }


    if (!refresherEvent) {
      this.loadingNotifications =
        true;
    }


    this.auth
      .getUserNotifications(
        userId
      )
      .subscribe({

        next: (
          response: any
        ) => {

          const list =
            this.normalizeNotifications(
              response
            );


          this.notifications =
            this.groupNotifications(
              list
            );


          this.loadingNotifications =
            false;

          if (refresherEvent) refresherEvent.target.complete();
        },


        error: (
          error: any
        ) => {

          console.error(
            'Failed to load notifications:',
            error
          );


          this.notifications = [];


          this.loadingNotifications =
            false;

          if (refresherEvent) refresherEvent.target.complete();
        }

      });

  }


  /* =====================================================
     NORMALIZE API RESPONSE
  ===================================================== */

  private normalizeNotifications(
    response: any
  ): any[] {

    let list: any[] = [];


    if (
      Array.isArray(
        response
      )
    ) {

      list =
        response;

    } else if (
      Array.isArray(
        response?.data
      )
    ) {

      list =
        response.data;

    } else if (
      Array.isArray(
        response?.data?.notifications
      )
    ) {

      list =
        response.data.notifications;

    }


    /*
     * Newest notifications first.
     */
    return [
      ...list
    ].sort(
      (
        first: any,
        second: any
      ) => {

        return (
          this.getNotificationTime(
            second
          ) -
          this.getNotificationTime(
            first
          )
        );

      }
    );

  }


  /* =====================================================
     GROUP NOTIFICATIONS
  ===================================================== */

  private groupNotifications(
    list: any[]
  ): Array<{
    day: string;
    items: any[];
  }> {

    const now =
      new Date();


    const startOfToday =
      new Date(
        now.getFullYear(),
        now.getMonth(),
        now.getDate()
      ).getTime();


    const startOfYesterday =
      startOfToday -
      (
        24 *
        60 *
        60 *
        1000
      );


    const todayItems:
      any[] = [];


    const yesterdayItems:
      any[] = [];


    const olderItems:
      any[] = [];


    for (
      const notification
      of list
    ) {

      const timestamp =
        this.getNotificationTime(
          notification
        );


      if (
        timestamp >=
        startOfToday
      ) {

        todayItems.push(
          notification
        );

      } else if (
        timestamp >=
        startOfYesterday
      ) {

        yesterdayItems.push(
          notification
        );

      } else {

        olderItems.push(
          notification
        );

      }

    }


    const grouped:
      Array<{
        day: string;
        items: any[];
      }> = [];


    if (
      todayItems.length
    ) {

      grouped.push({
        day: 'Today',
        items: todayItems
      });

    }


    if (
      yesterdayItems.length
    ) {

      grouped.push({
        day: 'Yesterday',
        items: yesterdayItems
      });

    }


    if (
      olderItems.length
    ) {

      grouped.push({
        day: 'Earlier',
        items: olderItems
      });

    }


    return grouped;

  }


  /* =====================================================
     NOTIFICATION TIME
  ===================================================== */

  private getNotificationTime(
    notification: any
  ): number {

    const value =
      notification?.created_at ||
      notification?.timestamp ||
      notification?.date;


    if (!value) {

      return 0;

    }


    const timestamp =
      new Date(
        value
      ).getTime();


    if (
      Number.isNaN(
        timestamp
      )
    ) {

      return 0;

    }


    return timestamp;

  }


  /* =====================================================
     UNREAD CHECK
  ===================================================== */

  isUnread(
    value: any
  ): boolean {

    return (
      Number(value) === 0
    );

  }


  /* =====================================================
     SHOW DETAILS
  ===================================================== */

  showDetails(
    day: string,
    idx: number
  ): void {

    const group =
      this.notifications.find(
        notificationGroup =>
          notificationGroup.day === day
      );


    if (
      !group ||
      !group.items ||
      !group.items[idx]
    ) {

      return;

    }


    this.selectedNotification = {
      day,
      idx
    };


    this.selectedNotificationItem =
      group.items[idx];


    const item =
      this.selectedNotificationItem;


    /*
     * Mark unread notification as read.
     */
    if (
      item &&
      this.isUnread(
        item.is_read
      ) &&
      item.id
    ) {

      /*
       * Update immediately in UI.
       */
      item.is_read = 1;


      this.auth
        .markNotificationRead(
          item.id
        )
        .subscribe({

          next: (
            response: any
          ) => {

            // console.log(
            //   'Notification marked as read:',
            //   response
            // );

          },


          error: (
            error: any
          ) => {

            console.error(
              'Unable to mark notification as read:',
              error
            );


            /*
             * Restore unread state
             * if API request fails.
             */
            item.is_read = 0;

          }

        });

    }

  }


  /* =====================================================
     CLOSE DETAILS
  ===================================================== */

  closeDetails(): void {

    this.selectedNotification =
      null;


    this.selectedNotificationItem =
      null;

  }


  /* =====================================================
     BACK
  ===================================================== */

  goBack(): void {

    /*
     * If detail is open,
     * return to notification list first.
     */
    if (
      this.selectedNotification
    ) {

      this.closeDetails();

      return;

    }


    /*
     * Otherwise return to Home.
     */
    this.navCtrl.navigateBack(
      '/home'
    );

  }


  /* =====================================================
     TRACK GROUP
  ===================================================== */

  trackByGroup(
    index: number,
    group: {
      day: string;
      items: any[];
    }
  ): string {

    if (
      group &&
      group.day
    ) {

      return group.day;

    }


    return String(
      index
    );

  }


  /* =====================================================
     TRACK NOTIFICATION
  ===================================================== */

  trackByNotification(
    index: number,
    notification: any
  ): any {

    if (
      notification?.id !==
      undefined &&
      notification?.id !==
      null
    ) {

      return notification.id;

    }


    if (
      notification?.notification_id !==
      undefined &&
      notification?.notification_id !==
      null
    ) {

      return notification.notification_id;

    }


    return (
      `${notification?.created_at || 'notification'}-${index}`
    );

  }

}