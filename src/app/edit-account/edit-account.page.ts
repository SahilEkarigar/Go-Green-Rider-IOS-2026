import { Component, OnInit } from '@angular/core';
import { IonicModule, ToastController } from '@ionic/angular';
import { FormsModule } from '@angular/forms';
import { CommonModule, Location } from '@angular/common';
import { FooterTabsComponent } from "../components/footer-tabs/footer-tabs.component"; 
import { AuthserviceService } from '../services/authservice.service';
import { LoaderService } from '../services/loader.service';
import { Storage } from '@ionic/storage-angular';
import { jwtDecode } from 'jwt-decode';

@Component({
  selector: 'app-edit-account',
  templateUrl: './edit-account.page.html',
  styleUrls: ['./edit-account.page.scss'],
  standalone: true,
  imports: [IonicModule, FormsModule, CommonModule], 

})
export class EditAccountPage implements OnInit {

  riderProfilePicture: any = null;
  uploadFileRiderProfilePicture: File | null = null;

  userName = '';
  fname = '';
  lname = '';
  email = '';
  phone = '';
  otherPhone = '';
  dob = '';
  addressInfo = '';
  prefix = '+1';

  user_id = '';
  role_id = 4;
  isSkeleton: boolean = false;


  constructor(private location: Location,
    private storage: Storage,
    private authService: AuthserviceService,
    private toastController: ToastController,
    private loaderService: LoaderService
  ) { }

  async ngOnInit() {
    await this.storage.create();
    const token = await this.storage.get('token');
    this.riderProfileDetails(token);
  }
  goBack(): void {
    this.location.back();
  }

  onImageError(event: Event) {
    (event.target as HTMLImageElement).src = 'assets/home/rider_profile.png';
  }

  getProfileImage(): string {
    if (typeof this.riderProfilePicture === 'string' && this.riderProfilePicture) {
      if (this.riderProfilePicture.includes('maps.googleapis.com')) {
        return 'assets/home/rider_profile.png';
      }
      return this.riderProfilePicture;
    }
    return 'assets/home/rider_profile.png';
  }

  onImageSelected(event: any) {
    const file: File = event.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e: any) => {
        this.riderProfilePicture = e.target.result;
        this.uploadFileRiderProfilePicture = file;
        // console.log("riderProfilePicture", this.riderProfilePicture)
      };
      reader.readAsDataURL(file);
    }

  }
  async riderProfileDetails(token: any) {
    const decoded: any = jwtDecode(token);
    const user_id = decoded.user_id;

    const requestBody = {
      user_id: user_id,
      role_id: this.role_id
    };

    const profileObservable = await this.authService.riderProfileDetails(requestBody);
    profileObservable.subscribe(
      (response) => {
        if (response.success && response.data) {
          const data = response.data;
          this.userName = data.username || '';
          this.fname = data.firstname || '';
          this.lname = data.lastname || '';
          this.email = data.email || '';
          this.phone = data.phonenumber || '';
          this.otherPhone = data.other_phone_number || '';
          this.dob = data.dob || '';
          this.addressInfo = data.address || '';
          this.prefix = data.prefix || '+1';
          this.riderProfilePicture = data.profile_pic || '';
        }
      },
      (error) => {
        console.error('Failed to fetch profile details', error);
      }
    );
  }

  async updateProfile() {  
    await this.loaderService.showLoader('Updating profile...');    
    // this.isSkeleton = true;
    // return;
    try {
      const token = await this.storage.get('token');
      const decoded: any = jwtDecode(token);
      const user_id = decoded.user_id;
     
      const formData = new FormData();
      formData.append('user_id', user_id);
      formData.append('role_id', this.role_id.toString());
      formData.append('username', this.userName);
      formData.append('firstname', this.fname);
      formData.append('lastname', this.lname);
      formData.append('email', this.email);
      formData.append('phonenumber', this.phone);
      formData.append('other_phone_number', this.otherPhone);
      formData.append('dob', this.dob);
      formData.append('address', this.addressInfo);
      formData.append('prefix', this.prefix);
      if (this.uploadFileRiderProfilePicture) {
        formData.append('profile_pic', this.uploadFileRiderProfilePicture);
      }
      const updateObservable = await this.authService.updateRiderProfileDetails(formData);
      updateObservable.subscribe(
        async (response) => {          
          await this.loaderService.hideLoader();          
          if (response.success) {
            await this.showSuccessToast('Profile updated successfully!');           
            await this.riderProfileDetails(token);            
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
      cssClass: 'custom-toast', // 👈 add custom class
      buttons: [
        {
          text: '✖',
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
