import { Component, OnInit } from '@angular/core';
import { IonicModule, ToastController } from '@ionic/angular';
import { FormsModule } from '@angular/forms';
import { CommonModule, Location } from '@angular/common';
import { LoaderService } from '../services/loader.service';
import { Storage } from '@ionic/storage-angular';
import { AuthserviceService } from '../services/authservice.service';
import { jwtDecode } from 'jwt-decode';

interface Document {
  id: number;
  file: File | null;
  preview: string | ArrayBuffer | null;
  name: string | null;
}

@Component({
  selector: 'app-rider-details',
  templateUrl: './rider-details.page.html',
  styleUrls: ['./rider-details.page.scss'],
  standalone: true,
  imports: [IonicModule, FormsModule, CommonModule],
})
export class RiderDetailsPage implements OnInit {
  vehicleOwnerName: string = '';
  vehicleRegNumber: any = '';
  vehicleType = '';
  regExpiryDate = '';

  // For dynamic documents
  documents: Document[] = [];
  nextId = 0;

  // Driving Licence Properties
  drivingLicenceFile: File | null = null;
  drivingLicencePreview: string | ArrayBuffer | null = 'assets/home/submitimage.svg';
  drivingLicenceName: string | null = null;

  // Registration Document Properties
  regDocumentFile: File | null = null;
  regDocumentPreview: string | ArrayBuffer | null = 'assets/home/submitimage.svg';
  regDocumentName: string | null = null;

  user_id = '';
  role_id = 4;

  constructor(
    private location: Location,
    private storage: Storage,
    private authService: AuthserviceService,
    private toastController: ToastController,
    private loaderService: LoaderService
  ) { }

  async ngOnInit() {

    await this.storage.create();
    const token = await this.storage.get('token');
    // Initialize with one empty document

    this.riderDocDetails(token);
  }

  async riderDocDetails(token: any) {
    const decoded: any = jwtDecode(token);
    const user_id = decoded.user_id;

    const requestBody = {
      user_id: user_id,
      role_id: this.role_id
    };

    const profileObservable = await this.authService.riderDocumentDetails(requestBody);
    profileObservable.subscribe(
      (response) => {
        if (response.success && response.data) {
          const data = response.data;

          let rider_license_image = data.rider_license_image;
          let registration_doc = data.registration_doc;

          this.drivingLicencePreview =
            rider_license_image && rider_license_image.trim() !== ''
              ? rider_license_image
              : 'assets/home/submitimage.svg';

          this.regDocumentPreview =
            registration_doc && registration_doc.trim() !== ''
              ? registration_doc
              : 'assets/home/submitimage.svg';
        }
      },
      (error) => {
        console.error('Failed to fetch profile details', error);
      }
    );
  }

  // async saveUpdateRiderDocDetails(token: any) {
  //   const decoded: any = jwtDecode(token);
  //   const user_id = decoded.user_id;

  //   const requestBody = {
  //     user_id: user_id,
  //     role_id: this.role_id
  //   };

  //   const profileObservable = await this.authService.updateRiderDocumentDetails(requestBody);
  //   profileObservable.subscribe(
  //     (response) => {
  //       if (response.success && response.data) {
  //         const data = response.data;

  //         let rider_license_image = data.rider_license_image;
  //         let registration_doc = data.registration_doc;

  //         this.drivingLicencePreview = rider_license_image;
  //         this.regDocumentPreview = registration_doc;
  //       }
  //     },
  //     (error) => {
  //       console.error('Failed to fetch profile details', error);
  //     }
  //   );
  // }

  async saveUpdateRiderDocDetails() {

    const token = await this.storage.get('token');

    const decoded: any = jwtDecode(token);

    const user_id = decoded.user_id;

    const formData = new FormData();

    formData.append('user_id', user_id);
    formData.append('role_id', this.role_id.toString());

    if (this.drivingLicenceFile) {
      formData.append(
        'rider_license_image',
        this.drivingLicenceFile,
        this.drivingLicenceFile.name
      );
    }

    if (this.regDocumentFile) {
      formData.append(
        'registration_doc',
        this.regDocumentFile,
        this.regDocumentFile.name
      );
    }

    this.loaderService.showLoader();

    const observable = await this.authService.updateRiderDocumentDetails(formData);

    observable.subscribe(
      async (response: any) => {

        this.loaderService.hideLoader();

        if (response.success) {

          const toast = await this.toastController.create({
            message: 'Documents updated successfully.',
            duration: 2000,
            color: 'success'
          });

          await toast.present();

          // Refresh latest images
          this.riderDocDetails(token);

        } else {

          const toast = await this.toastController.create({
            message: response.message,
            duration: 3000,
            color: 'danger'
          });

          await toast.present();
        }

      },
      async error => {

        this.loaderService.hideLoader();

        const toast = await this.toastController.create({
          message: 'Failed to update documents.',
          duration: 3000,
          color: 'danger'
        });

        await toast.present();

        console.log(error);

      }
    );
  }



  goBack(): void {
    this.location.back();
  }

  async saveDocumentation() {
    await this.saveUpdateRiderDocDetails();
  }

  onImageError(event: Event) {
    (event.target as HTMLImageElement).src = 'assets/home/shop.jpeg';
  }




  // Handle document upload for dynamic documents
  onDocumentChange(event: any, documentId: number) {
    const input = event.target as HTMLInputElement;
    if (input.files && input.files[0]) {
      const file = input.files[0];
      const documentIndex = this.documents.findIndex(doc => doc.id === documentId);

      if (documentIndex !== -1) {
        this.documents[documentIndex].name = file.name;
        this.documents[documentIndex].file = file;

        const reader = new FileReader();
        reader.onload = () => {
          this.documents[documentIndex].preview = reader.result;
        };
        reader.readAsDataURL(file);
      }
    }
  }

  // Remove specific document
  removeDocument(documentId: number) {
    this.documents = this.documents.filter(doc => doc.id !== documentId);
  }

  // // Driving Licence Handlers
  // onDrivingLicenceChange(event: any) {
  //   const input = event.target as HTMLInputElement;
  //   if (input.files && input.files[0]) {
  //     const file = input.files[0];
  //     this.drivingLicenceName = file.name;
  //     this.drivingLicenceFile = file;

  //     const reader = new FileReader();
  //     reader.onload = () => {
  //       this.drivingLicencePreview = reader.result;
  //     };
  //     reader.readAsDataURL(file);
  //   }
  // }

  onDrivingLicenceChange(event: any) {
    const file = event.target.files[0];

    if (!file) return;

    this.drivingLicenceFile = file;
    this.drivingLicenceName = file.name;

    const reader = new FileReader();

    reader.onload = () => {
      this.drivingLicencePreview = reader.result;
    };

    reader.readAsDataURL(file);
  }

  removeDrivingLicence() {
    this.drivingLicenceName = null;
    this.drivingLicencePreview = 'assets/home/submitimage.svg';
    this.drivingLicenceFile = null;
    const input = document.getElementById('drivingLicence') as HTMLInputElement;
    if (input) {
      input.value = '';
    }
  }

  // // Registration Document Handlers
  // onRegDocumentChange(event: any) {
  //   const input = event.target as HTMLInputElement;
  //   if (input.files && input.files[0]) {
  //     const file = input.files[0];
  //     this.regDocumentName = file.name;
  //     this.regDocumentFile = file;

  //     const reader = new FileReader();
  //     reader.onload = () => {
  //       this.regDocumentPreview = reader.result;
  //     };
  //     reader.readAsDataURL(file);
  //   }
  // }

  onRegDocumentChange(event: any) {
    const file = event.target.files[0];

    if (!file) return;

    this.regDocumentFile = file;
    this.regDocumentName = file.name;

    const reader = new FileReader();

    reader.onload = () => {
      this.regDocumentPreview = reader.result;
    };

    reader.readAsDataURL(file);
  }



  removeRegDocument() {
    this.regDocumentName = null;
    this.regDocumentPreview = 'assets/home/submitimage.svg';
    this.regDocumentFile = null;
    const input = document.getElementById('regDocument') as HTMLInputElement;
    if (input) {
      input.value = '';
    }
  }


  nextDocId = 1;
  uploadedDocs: any[] = [];

  // Called when a file is selected from the main input
  handleInitialFileUpload(event: any) {
    const file = event.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e: any) => {
        this.uploadedDocs.push({
          id: this.nextDocId++,
          file: file,
          preview: e.target.result,
          name: file.name
        });
      };
      reader.readAsDataURL(file);
    }
  }

  // Called when user edits (replaces) an existing file
  updateExistingDocument(event: any, docId: number) {
    const file = event.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e: any) => {
        const index = this.uploadedDocs.findIndex(doc => doc.id === docId);
        if (index > -1) {
          this.uploadedDocs[index].file = file;
          this.uploadedDocs[index].preview = e.target.result;
          this.uploadedDocs[index].name = file.name;
        }
      };
      reader.readAsDataURL(file);
    }
  }

  // Remove document
  deleteUploadedDocument(docId: number) {
    this.uploadedDocs = this.uploadedDocs.filter(doc => doc.id !== docId);
  }

  // Show fallback image if error
  handleImageFallback(event: any) {
    event.target.src = 'assets/home/submitimage.svg';
  }

}