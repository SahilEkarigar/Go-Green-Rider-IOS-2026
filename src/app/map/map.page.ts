import { Component, OnInit, ViewChild, Renderer2, ElementRef } from '@angular/core';
import { IonicModule } from '@ionic/angular';
import { FormsModule } from '@angular/forms';
import { FooterTabsComponent } from "../components/footer-tabs/footer-tabs.component"; // <-- Import FormsModule
import { CommonModule } from '@angular/common';
import { addIcons } from 'ionicons';
import { personCircle } from 'ionicons/icons';
import { IonModal } from '@ionic/angular';



@Component({
  selector: 'app-map',
  templateUrl: './map.page.html',
  styleUrls: ['./map.page.scss'],
      standalone: true,
      imports: [IonicModule, FormsModule,CommonModule], // Import IonicModule here
})
export class MapPage implements OnInit {

  @ViewChild('bottom_map', { static: false }) targetDiv!: ElementRef;
  // @ViewChild('targetDiv2', { static: false }) targetDiv2!: ElementRef;

  
  @ViewChild('modal', { static: true }) modal!: IonModal;

  isModalOpen = false; // Initially hidden

  isActive = false;
  

 
  activeIndexOrders: number | null = null; // For "orders" list

  constructor(private renderer: Renderer2) {
    addIcons({ personCircle });
   }


   
   openModal() {
    // Close the first modal
    this.modal.dismiss();

    // Show the second modal
    this.isModalOpen = true;
  }
  orders = [
    {
      orderid: 'OD117216332413925000',
      name: 'Harry Smith',
      price: '$250',
      time:'02:00',
      address: 'Abc. #21/4 3456',
      store_address: 'xyz Store. #13/4 4020',
      customer_name: 'Dhruv Sehgal',
      customer_address: '#23 xys 1234',
      distance: '5 Km'
    
    },
  
  ];
  ngOnInit() {
      // console.log(this.orders);
  }


  toggleAccordion(index: number) {
    this.activeIndexOrders = this.activeIndexOrders === index ? null : index; // Toggle logic for "orders"
}
add_select_loc() {
  if (this.targetDiv.nativeElement.classList.contains('select_loc')) {
    this.renderer.removeClass(this.targetDiv.nativeElement, 'select_loc');
  } else {
    this.renderer.addClass(this.targetDiv.nativeElement, 'select_loc');
  }
}
toggleOrderStatus() {
  const orderPickup = document.getElementById("orderPickup");
  const orderDelivered = document.getElementById("orderDelivered");
  const forhide = document.getElementById("forhide");
  const forshow = document.getElementById("forshow");
  const hidecounter = document.getElementById("hidecounter");

  if (orderPickup && orderDelivered && forhide && forshow &&hidecounter) {
    // Toggle button visibility
    orderPickup.style.display = "none"; // Hide Order Pickup
    orderDelivered.style.display = "block"; // Show Order Delivered

    // Toggle image visibility
    forhide.style.display = "none"; // Hide dotline.svg
    forshow.style.display = "block"; // Show line.svg
    hidecounter.style.display = "none"; // Show line.svg
  }
}


}
