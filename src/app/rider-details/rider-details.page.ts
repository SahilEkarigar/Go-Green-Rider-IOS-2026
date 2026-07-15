import { Component, OnInit } from '@angular/core';
import { IonicModule } from '@ionic/angular';
import { FormsModule } from '@angular/forms';
import { Location } from '@angular/common';
import { CommonModule } from '@angular/common';
import { FooterTabsComponent } from "../components/footer-tabs/footer-tabs.component";

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
  imports: [IonicModule, FormsModule,CommonModule, FooterTabsComponent],
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

  constructor(private location: Location) { }

  ngOnInit() {
    // Initialize with one empty document
    
  }

  goBack(): void {
    this.location.back();
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

  // Driving Licence Handlers
  onDrivingLicenceChange(event: any) {
    const input = event.target as HTMLInputElement;
    if (input.files && input.files[0]) {
      const file = input.files[0];
      this.drivingLicenceName = file.name;
      this.drivingLicenceFile = file;

      const reader = new FileReader();
      reader.onload = () => {
        this.drivingLicencePreview = reader.result;
      };
      reader.readAsDataURL(file);
    }
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

  // Registration Document Handlers
  onRegDocumentChange(event: any) {
    const input = event.target as HTMLInputElement;
    if (input.files && input.files[0]) {
      const file = input.files[0];
      this.regDocumentName = file.name;
      this.regDocumentFile = file;

      const reader = new FileReader();
      reader.onload = () => {
        this.regDocumentPreview = reader.result;
      };
      reader.readAsDataURL(file);
    }
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