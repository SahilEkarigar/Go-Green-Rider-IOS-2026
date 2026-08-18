import { CommonModule, Location } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { IonicModule, NavController } from '@ionic/angular';
import { addIcons } from 'ionicons';
import {
  star,
  starHalf,
  starOutline,
  chevronBackOutline,
  bicycleOutline,
  phonePortraitOutline,
  funnelOutline,
  chatboxEllipsesOutline,
  thumbsUpOutline,
  refreshOutline,
  personOutline
} from 'ionicons/icons';

export interface ReviewItem {
  id: string;
  user: string;
  rating: number;
  category: 'rider' | 'app';
  categoryLabel: string;
  orderId?: string;
  text: string;
  profile: string;
  date: string;
}

@Component({
  selector: 'app-ratings',
  templateUrl: './ratings.page.html',
  styleUrls: ['./ratings.page.scss'],
  standalone: true,
  imports: [IonicModule, FormsModule, CommonModule],
})
export class RatingsPage implements OnInit {

  // Active Category Filter: 'rider' (default) | 'app' | 'all'
  selectedCategory: 'rider' | 'app' | 'all' = 'rider';
  
  // Star Rating Filter: 0 (all) | 5 | 4 | 3 | 2 | 1
  selectedStar: number = 0;

  // Reviews Dataset categorized by Rider Delivery Service vs App Platform Feedback
  reviews: ReviewItem[] = [
    {
      id: 'REV-101',
      user: 'Joan Perkins',
      rating: 5.0,
      category: 'rider',
      categoryLabel: 'Rider Service',
      orderId: '#12345',
      text: 'Super fast delivery! Rider was extremely polite, followed drop-off instructions, and handled food with care.',
      profile: 'https://randomuser.me/api/portraits/women/3.jpg',
      date: '2 days ago'
    },
    {
      id: 'REV-102',
      user: 'Frank Garrett',
      rating: 5.0,
      category: 'rider',
      categoryLabel: 'Rider Service',
      orderId: '#12344',
      text: 'Arrived 10 minutes earlier than estimated. Great communication and courteous behavior.',
      profile: 'https://randomuser.me/api/portraits/men/4.jpg',
      date: '3 days ago'
    },
    {
      id: 'REV-103',
      user: 'Randy Palmer',
      rating: 5.0,
      category: 'rider',
      categoryLabel: 'Rider Service',
      orderId: '#12340',
      text: 'Excellent delivery service! Kept the order hot and delivered directly to my apartment door.',
      profile: 'https://randomuser.me/api/portraits/men/5.jpg',
      date: '5 days ago'
    },
    {
      id: 'REV-104',
      user: 'Ashley Moore',
      rating: 4.0,
      category: 'rider',
      categoryLabel: 'Rider Service',
      orderId: '#12338',
      text: 'Good delivery service. Driver found the address quickly without any hassle.',
      profile: 'https://randomuser.me/api/portraits/women/6.jpg',
      date: '1 week ago'
    },
    {
      id: 'REV-105',
      user: 'Liam Rogers',
      rating: 5.0,
      category: 'rider',
      categoryLabel: 'Rider Service',
      orderId: '#12335',
      text: 'Friendly rider, very professional and quick turnaround. Highly satisfied!',
      profile: 'https://randomuser.me/api/portraits/men/7.jpg',
      date: '1 week ago'
    },
    {
      id: 'REV-106',
      user: 'Emily Foster',
      rating: 4.0,
      category: 'rider',
      categoryLabel: 'Rider Service',
      orderId: '#12330',
      text: 'Prompt delivery and food was kept safe in thermal bag.',
      profile: 'https://randomuser.me/api/portraits/women/8.jpg',
      date: '2 weeks ago'
    },

    // App & Platform UI Feedback (Separated so it does NOT affect Rider score)
    {
      id: 'REV-201',
      user: 'Michael Scott',
      rating: 2.0,
      category: 'app',
      categoryLabel: 'App Feedback',
      text: 'Interface is confusing and checkout screen takes too long to load. App needs UI improvement.',
      profile: 'https://randomuser.me/api/portraits/men/12.jpg',
      date: '3 days ago'
    },
    {
      id: 'REV-202',
      user: 'Carlos Diaz',
      rating: 1.0,
      category: 'app',
      categoryLabel: 'App Feedback',
      text: 'App crashed on payment step. Tried reinstalling but still slow.',
      profile: 'https://randomuser.me/api/portraits/men/9.jpg',
      date: '3 weeks ago'
    },
    {
      id: 'REV-203',
      user: 'Sarah Jenkins',
      rating: 3.0,
      category: 'app',
      categoryLabel: 'App Feedback',
      text: 'App runs fine overall but would love dark mode support in future updates.',
      profile: 'https://randomuser.me/api/portraits/women/14.jpg',
      date: '1 month ago'
    }
  ];

  constructor(
    private navCtrl: NavController,
    private location: Location
  ) {
    addIcons({
      star,
      starHalf,
      starOutline,
      chevronBackOutline,
      bicycleOutline,
      phonePortraitOutline,
      funnelOutline,
      chatboxEllipsesOutline,
      thumbsUpOutline,
      refreshOutline,
      personOutline
    });
  }

  ngOnInit() {}

  goBack(): void {
    this.location.back();
  }

  // Rider Service Average Rating (ONLY Rider delivery reviews)
  get riderAverageRating(): number {
    const riderRevs = this.reviews.filter(r => r.category === 'rider');
    if (riderRevs.length === 0) return 5.0;
    const total = riderRevs.reduce((acc, curr) => acc + curr.rating, 0);
    return Number((total / riderRevs.length).toFixed(1));
  }

  // Total count for active category
  get totalCategoryReviewsCount(): number {
    if (this.selectedCategory === 'all') return this.reviews.length;
    return this.reviews.filter(r => r.category === this.selectedCategory).length;
  }

  // Star breakdown percentages for active category
  get starBreakdown(): { stars: number; count: number; percent: number }[] {
    const catList = this.selectedCategory === 'all'
      ? this.reviews
      : this.reviews.filter(r => r.category === this.selectedCategory);

    const total = catList.length || 1;
    const result = [5, 4, 3, 2, 1].map(stars => {
      const count = catList.filter(r => Math.floor(r.rating) === stars).length;
      return {
        stars,
        count,
        percent: Number((count / total).toFixed(2))
      };
    });

    return result;
  }

  // Filtered Reviews list based on active category & star filter
  get filteredReviews(): ReviewItem[] {
    let list = [...this.reviews];

    if (this.selectedCategory !== 'all') {
      list = list.filter(r => r.category === this.selectedCategory);
    }

    if (this.selectedStar !== 0) {
      list = list.filter(r => Math.floor(r.rating) === this.selectedStar);
    }

    return list;
  }

  setCategory(category: 'rider' | 'app' | 'all') {
    this.selectedCategory = category;
    this.selectedStar = 0; // reset star filter when switching category
  }

  setStarFilter(stars: number) {
    this.selectedStar = this.selectedStar === stars ? 0 : stars;
  }

  resetFilters() {
    this.selectedCategory = 'rider';
    this.selectedStar = 0;
  }
}
