import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { IonicModule, NavController } from '@ionic/angular';
import { Location } from '@angular/common';
@Component({
  selector: 'app-ratings',
  templateUrl: './ratings.page.html',
  styleUrls: ['./ratings.page.scss'],
  standalone: true,
  imports: [IonicModule, FormsModule, CommonModule],
})
export class RatingsPage implements OnInit {
  comments = [
    {
      user: 'Joan Perkins',
      rating: 5.0,
      text: 'This app is a fantastic addition! Intuitive, clean UI and everything just works. Highly recommended.',
      profile: 'https://randomuser.me/api/portraits/women/3.jpg',
      date: '2 days ago'
    },
    {
      user: 'Frank Garrett',
      rating: 4.0,
      text: 'Overall solid experience. Some features could use polish, but it’s definitely useful and fast.',
      profile: 'https://randomuser.me/api/portraits/men/4.jpg',
      date: '3 days ago'
    },
    {
      user: 'Randy Palmer',
      rating: 4.0,
      text: 'App runs smoothly and gets the job done. Would love dark mode in future updates!',
      profile: 'https://randomuser.me/api/portraits/men/5.jpg',
      date: '5 days ago'
    },
    {
      user: 'Ashley Moore',
      rating: 2.0,
      text: 'Interface is confusing and some screens take too long to load. Needs improvement.',
      profile: 'https://randomuser.me/api/portraits/women/6.jpg',
      date: '1 week ago'
    },
    {
      user: 'Liam Rogers',
      rating: 5.0,
      text: 'Simple, powerful, and effective. Love how easy it is to manage everything in one place.',
      profile: 'https://randomuser.me/api/portraits/men/7.jpg',
      date: '1 week ago'
    },
    {
      user: 'Emily Foster',
      rating: 3.0,
      text: 'The idea is great but execution needs a bit of work. Looking forward to updates.',
      profile: 'https://randomuser.me/api/portraits/women/8.jpg',
      date: '2 weeks ago'
    },
    {
      user: 'Carlos Diaz',
      rating: 1.0,
      text: 'Crashes on login. Tried reinstalling but still no luck. Needs urgent fix.',
      profile: 'https://randomuser.me/api/portraits/men/9.jpg',
      date: '3 weeks ago'
    }
  ];



  showReplyIndex: number | null = null;
  replyText: string[] = [];

  toggleReplyBox(index: number) {
    this.showReplyIndex = this.showReplyIndex === index ? null : index;
  }

  submitReply(index: number) {
    const reply = this.replyText[index];
    if (reply && reply.trim()) {
      console.log(`Reply to comment ${index}:`, reply);
      this.replyText[index] = '';
      this.showReplyIndex = null;
    }
  }

  ratings = [
    { stars: 5, percent: 0.9 },
    { stars: 4, percent: 0.7 },
    { stars: 3, percent: 0.4 },
    { stars: 2, percent: 0.3 },
    { stars: 1, percent: 0.1 },
  ];
  constructor(private navCtrl: NavController, private location: Location) { }

  ngOnInit() { }
  // goBackToScreen() {
  //   this.navCtrl.navigateBack('/setting-screen');
  // }

  goBack(): void {
    this.location.back();
  }
}
