import { Component, OnInit } from '@angular/core';
import { IonicModule } from '@ionic/angular';
import { FormsModule } from '@angular/forms';
import { CommonModule, Location } from '@angular/common';
import { jwtDecode } from 'jwt-decode';
import { AuthserviceService } from '../services/authservice.service';
import { Storage } from '@ionic/storage-angular';
import { ToastController } from '@ionic/angular';
import { LoaderService } from '../services/loader.service';
import { LoadingController } from '@ionic/angular';


@Component({
  selector: 'app-vehicel-details',
  templateUrl: './vehicel-details.page.html',
  styleUrls: ['./vehicel-details.page.scss'],
  standalone: true,
  imports: [IonicModule, FormsModule, CommonModule], // Import IonicModule here
})
export class VehicelDetailsPage implements OnInit {
  // store = {
  //   addressLine1: '',
  //   addressLine2: '',
  //   pincode: '',
  //   landmark: ''
  // };
  // storeName = '';
  // startTime = '';
  // endTime = '';
  // businessRegNumber = '';
  // sincode = '';
  // storeAddress = '';
  storeImageFile: File | null = null;
  storeProfilePicture: string = '';


  vehicleOwnerName: string = '';
  vehicleRegNumber: any = '';
  vehicleType = '';
  regExpiryDate = '';
  regDocument = '';
  regDocumentName: File | null = null;
  regDocumentPreview: any = null;
  // regDocumentPreview='';

  role_id = 4;

  constructor(
    private location: Location,
    private storage: Storage,
    private authService: AuthserviceService,
    private toastController: ToastController,
    private loaderService: LoaderService,
    private loadingCtrl: LoadingController
  ) { }

  async ngOnInit() {
    const loading = await this.loadingCtrl.create({
      message: 'Please wait...',
      spinner: 'bubbles', // or 'dots', 'bubbles', 'crescent'
    });
    await loading.present();
    await this.storage.create();
    const token = await this.storage.get('token');
    this.vehicleDetailsData(token);
    loading.dismiss();
  }


  goBack(): void {
    this.location.back();
  }

  onImageError(event: Event) {
    (event.target as HTMLImageElement).src = 'assets/home/shop.jpeg';
  }

  onImageSelected(event: any) {
    const file = event.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e: any) => {
        this.storeProfilePicture = e.target.result;
      };
      reader.readAsDataURL(file);
    }
  }


  triggerFileInput() {
    const input = document.getElementById('regDocument') as HTMLInputElement;
    if (input) {
      input.click();
    }
  }

  // onFileChange(event: any) {
  //   const input = event.target as HTMLInputElement;
  //   if (input.files && input.files[0]) {
  //     const file = input.files[0];
  //     this.regDocumentName = file.name;

  //     const reader = new FileReader();
  //     reader.onload = () => {
  //       this.regDocumentPreview = file;
  //     };
  //     reader.readAsDataURL(file);
  //   }
  // }

  onFileChange(event: any) {
    const file: File = event.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e: any) => {
        this.regDocumentPreview = e.target.result;
        this.regDocumentName = file;
        console.log("regDocumentName", this.regDocumentName)
      };
      reader.readAsDataURL(file);
    }

  }

  removeImage() {
    this.regDocumentName = null;
    this.regDocumentPreview = null;
    // Optionally, also clear the file input
    const input = document.getElementById('regDocument') as HTMLInputElement;
    if (input) {
      input.value = '';
    }
  }

  // 
  // regDocumentName: string = '';

  async vehicleDetailsData(token: any) {
    const decoded: any = jwtDecode(token);
    const user_id = decoded.user_id;

    console.log("vehicel details ", user_id)

    const requestBody = {
      user_id: user_id,
      role_id: this.role_id
    };

    const profileObservable = await this.authService.vehicleDetailsData(requestBody);
    profileObservable.subscribe(
      (response) => {
        if (response.success && response.data) {
          const data = response.data;
          this.vehicleOwnerName = data.vehicle_owner_name || '';
          this.vehicleRegNumber = data.vehicle_registration_number || '';
          this.vehicleType = data.vehicle_type || '';
          this.regExpiryDate = data.registraion_expiry_date || '';
          this.regDocumentPreview = data.registration_doc || '';
        }
      },
      (error) => {
        console.error('Failed to fetch profile details', error);
      }
    );
  }



  async updateVehicleDetails() {  
    await this.loaderService.showLoader('Updating profile...');   
    try {
      const token = await this.storage.get('token');
      const decoded: any = jwtDecode(token);
      const user_id = decoded.user_id;
     
      const formData = new FormData();
      formData.append('user_id', user_id);
      formData.append('role_id', this.role_id.toString());
      formData.append('vehicle_owner_name', this.vehicleOwnerName);
      formData.append('vehicle_registration_number', this.vehicleRegNumber);
      formData.append('vehicle_type', this.vehicleType);
      formData.append('registraion_expiry_date', this.regExpiryDate);     
      if (this.regDocumentName) {
        formData.append('registration_doc', this.regDocumentName);
      }
      const updateObservable = await this.authService.updateVehicleDetailsData(formData);
      updateObservable.subscribe(
        async (response) => {          
          await this.loaderService.hideLoader();          
          if (response.success) {
            await this.showSuccessToast('Profile updated successfully!');           
            await this.vehicleDetailsData(token);            
            setTimeout(() => {
              window.location.reload();
            }, 1500); 
          } else {
            await this.showErrorToast('Update Failed: ' + (response.message || 'Failed to update profile'));
          }
        },
        async (error) => {          
          await this.loaderService.hideLoader();
          console.error('Update profile error:', error);
          await this.showErrorToast('An error occurred while updating your profile. Please try again.');
        }
      );
    } catch (error) {      
      await this.loaderService.hideLoader();
      console.error('Update profile error:', error);
      await this.showErrorToast('An error occurred while updating your profile. Please try again.');
    }
  }



  private async showSuccessToast(message: string) {
    const toast = await this.toastController.create({
      message: message,
      duration: 3000,
      position: 'top',
      color: 'success',
      buttons: [
        {
          text: 'Close',
          role: 'cancel'
        }
      ]
    });
    await toast.present();
  }

  private async showErrorToast(message: string) {
    const toast = await this.toastController.create({
      message: message,
      duration: 4000,
      position: 'top',
      color: 'danger',
      buttons: [
        {
          text: 'Close',
          role: 'cancel'
        }
      ]
    });
    await toast.present();
  }
}
