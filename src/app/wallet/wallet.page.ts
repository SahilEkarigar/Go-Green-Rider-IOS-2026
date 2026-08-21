import { Component, OnInit } from '@angular/core';
import { CommonModule, Location } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IonicModule, NavController } from '@ionic/angular';
import { AuthserviceService } from '../services/authservice.service';
import { addIcons } from 'ionicons';
import {
  walletOutline,
  arrowDownCircleOutline,
  arrowUpCircleOutline,
  swapHorizontalOutline,
  funnelOutline,
  searchOutline,
  checkmarkCircle,
  time,
  closeCircle,
  chevronBackOutline,
  calendarOutline,
  cashOutline,
  cardOutline,
  addCircleOutline,
  chevronDownOutline,
  optionsOutline,
  refreshOutline,
  arrowDownOutline,
  arrowUpOutline,
  closeOutline
} from 'ionicons/icons';

export interface WalletTransaction {
  id: string;
  type: 'earning' | 'withdrawal';
  title: string;
  orderId?: string;
  amount: number;
  date: string;
  time: string;
  status: 'Completed' | 'Processing' | 'Failed';
  method?: string;
  rawDate: Date;
}

@Component({
  selector: 'app-wallet',
  templateUrl: './wallet.page.html',
  styleUrls: ['./wallet.page.scss'],
  standalone: true,
  imports: [IonicModule, FormsModule, CommonModule],
})
export class WalletPage implements OnInit {
  // Wallet Overview Data
  currentBalance: number = 1250.00;
  totalEarnings: number = 2480.00;
  totalWithdrawals: number = 1230.00;
  pendingAmount: number = 75.00;

  // Active Filter States
  selectedType: 'all' | 'earning' | 'withdrawal' = 'all';
  selectedStatus: 'all' | 'completed' | 'processing' | 'failed' = 'all';
  selectedPeriod: 'all' | 'today' | 'week' | 'month' = 'all';
  sortBy: 'newest' | 'oldest' | 'amount_high' | 'amount_low' = 'newest';
  searchQuery: string = '';

  // Modal / Payout State
  isPayoutModalOpen: boolean = false;
  payoutAmount: number | null = null;
  payoutLoading: boolean = false;

  // Transactions Data (Combined Earnings & Withdrawals)
  transactions: WalletTransaction[] = [
    {
      id: 'TX-1001',
      type: 'earning',
      title: 'Order Delivery Earnings #12345',
      orderId: '#12345',
      amount: 45.50,
      date: '18 Aug, 2026',
      time: '10:30 AM',
      status: 'Completed',
      method: 'Order Credit',
      rawDate: new Date('2026-08-18T10:30:00')
    },
    {
      id: 'TX-1002',
      type: 'withdrawal',
      title: 'Bank Transfer Payout',
      amount: 180.00,
      date: '17 Aug, 2026',
      time: '04:15 PM',
      status: 'Completed',
      method: 'Bank Account ****4321',
      rawDate: new Date('2026-08-17T16:15:00')
    },
    {
      id: 'TX-1003',
      type: 'earning',
      title: 'Order Delivery Earnings #12344',
      orderId: '#12344',
      amount: 62.00,
      date: '16 Aug, 2026',
      time: '02:40 PM',
      status: 'Completed',
      method: 'Order Credit',
      rawDate: new Date('2026-08-16T14:40:00')
    },
    {
      id: 'TX-1004',
      type: 'withdrawal',
      title: 'Instant Payout Request',
      amount: 75.00,
      date: '15 Aug, 2026',
      time: '11:00 AM',
      status: 'Processing',
      method: 'Bank Account ****4321',
      rawDate: new Date('2026-08-15T11:00:00')
    },
    {
      id: 'TX-1005',
      type: 'earning',
      title: 'Order Delivery Earnings #12340',
      orderId: '#12340',
      amount: 38.20,
      date: '14 Aug, 2026',
      time: '08:20 PM',
      status: 'Completed',
      method: 'Order Credit',
      rawDate: new Date('2026-08-14T20:20:00')
    },
    {
      id: 'TX-1006',
      type: 'withdrawal',
      title: 'Bank Transfer Payout',
      amount: 60.00,
      date: '12 Aug, 2026',
      time: '01:50 PM',
      status: 'Failed',
      method: 'Bank Account ****4321',
      rawDate: new Date('2026-08-12T13:50:00')
    },
    {
      id: 'TX-1007',
      type: 'earning',
      title: 'Order Delivery Earnings #12338',
      orderId: '#12338',
      amount: 95.00,
      date: '10 Aug, 2026',
      time: '06:10 PM',
      status: 'Completed',
      method: 'Order Credit',
      rawDate: new Date('2026-08-10T18:10:00')
    },
    {
      id: 'TX-1008',
      type: 'withdrawal',
      title: 'Monthly Payout',
      amount: 500.00,
      date: '01 Aug, 2026',
      time: '09:00 AM',
      status: 'Completed',
      method: 'Direct Deposit',
      rawDate: new Date('2026-08-01T09:00:00')
    }
  ];

  constructor(
    private navCtrl: NavController,
    private location: Location,
    private authservice: AuthserviceService
  ) {
    addIcons({
      walletOutline,
      arrowDownCircleOutline,
      arrowUpCircleOutline,
      swapHorizontalOutline,
      funnelOutline,
      searchOutline,
      checkmarkCircle,
      time,
      closeCircle,
      chevronBackOutline,
      calendarOutline,
      cashOutline,
      cardOutline,
      addCircleOutline,
      chevronDownOutline,
      optionsOutline,
      refreshOutline,
      arrowDownOutline,
      arrowUpOutline,
      closeOutline
    });
  }

  ngOnInit() {
    this.getOrderDetailsEarnings();
  }

  doRefresh(event: any): void {
    this.getOrderDetailsEarnings();
    setTimeout(() => {
      event.target.complete();
    }, 800);
  }

  goBack(): void {
    this.location.back();
  }

  async getOrderDetailsEarnings() {
    const rider_id = 4;
    try {
      const apiCall = await this.authservice.getOrderDetailsByRiderId(rider_id, 'month');
      apiCall.subscribe((response: any) => {
        // API response handling if needed
      });
    } catch (err) {
      console.warn('Earning details fetch fallback');
    }
  }

  // Filtered & Sorted Transactions Getter
  get filteredTransactions(): WalletTransaction[] {
    let list = [...this.transactions];

    // 1. Filter by Type
    if (this.selectedType !== 'all') {
      list = list.filter(tx => tx.type === this.selectedType);
    }

    // 2. Filter by Status
    if (this.selectedStatus !== 'all') {
      list = list.filter(tx => tx.status.toLowerCase() === this.selectedStatus);
    }

    // 3. Search Query
    if (this.searchQuery && this.searchQuery.trim() !== '') {
      const q = this.searchQuery.toLowerCase().trim();
      list = list.filter(tx =>
        tx.title.toLowerCase().includes(q) ||
        (tx.orderId && tx.orderId.toLowerCase().includes(q)) ||
        tx.date.toLowerCase().includes(q) ||
        tx.amount.toString().includes(q) ||
        tx.status.toLowerCase().includes(q)
      );
    }

    // 4. Sort
    list.sort((a, b) => {
      if (this.sortBy === 'newest') {
        return b.rawDate.getTime() - a.rawDate.getTime();
      } else if (this.sortBy === 'oldest') {
        return a.rawDate.getTime() - b.rawDate.getTime();
      } else if (this.sortBy === 'amount_high') {
        return b.amount - a.amount;
      } else if (this.sortBy === 'amount_low') {
        return a.amount - b.amount;
      }
      return 0;
    });

    return list;
  }

  setTypeFilter(type: 'all' | 'earning' | 'withdrawal') {
    this.selectedType = type;
  }

  setStatusFilter(status: 'all' | 'completed' | 'processing' | 'failed') {
    this.selectedStatus = status;
  }

  resetFilters() {
    this.selectedType = 'all';
    this.selectedStatus = 'all';
    this.selectedPeriod = 'all';
    this.sortBy = 'newest';
    this.searchQuery = '';
  }

  openPayoutModal() {
    this.isPayoutModalOpen = true;
  }

  closePayoutModal() {
    this.isPayoutModalOpen = false;
    this.payoutAmount = null;
  }

  submitPayoutRequest() {
    if (!this.payoutAmount || this.payoutAmount <= 0) return;

    this.payoutLoading = true;
    setTimeout(() => {
      const newTx: WalletTransaction = {
        id: `TX-${Math.floor(1000 + Math.random() * 9000)}`,
        type: 'withdrawal',
        title: 'Payout Request',
        amount: Number(this.payoutAmount),
        date: 'Today',
        time: 'Just now',
        status: 'Processing',
        method: 'Bank Account ****4321',
        rawDate: new Date()
      };

      this.transactions.unshift(newTx);
      this.currentBalance -= Number(this.payoutAmount);
      this.pendingAmount += Number(this.payoutAmount);
      this.payoutLoading = false;
      this.closePayoutModal();
    }, 800);
  }

  getStatusIcon(status: string): string {
    switch (status.trim().toLowerCase()) {
      case 'completed':
        return 'checkmark-circle';
      case 'processing':
        return 'time';
      case 'failed':
        return 'close-circle';
      default:
        return 'help-circle';
    }
  }
}
