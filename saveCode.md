
  // Rider Image handlers
  // openImageOptions() {
  //   this.fileInput.nativeElement.click();
  // }
  // onImageSelected(event: Event) {
  //   const input = event.target as HTMLInputElement;
  //   if (input.files && input.files[0]) {
  //     const reader = new FileReader();
  //     reader.onload = () => this.riderImagePreview = reader.result;
  //     reader.readAsDataURL(input.files[0]);
  //   }
  // }
  // Proof of Identity handlers
  // openProofFileOptions() {
  //   const useCamera = confirm('Tap OK to take a photo, or Cancel to choose from gallery.');
  //   if (useCamera) {
  //     this.proofCameraInput.nativeElement.click();
  //   } else {
  //     this.proofFileInput.nativeElement.click();
  //   }
  // }
  // openProofFileOptions() {
  //   this.proofCameraInput.nativeElement.click();
  // }
  // onProofSelected(event: Event) {
  //   const input = event.target as HTMLInputElement;
  //   if (input.files && input.files[0]) {
  //     const reader = new FileReader();
  //     reader.onload = () => this.proofImagePreview = reader.result;
  //     reader.readAsDataURL(input.files[0]);
  //   }
  // }


  <!-- <div class="form_input_box">
              <label for="Username">Username</label>
              <input type="text" [(ngModel)]="userName" [ngClass]="{'input-error': isUserNameInvalid}" id="userName"
                name="userName" class="form-control" placeholder="Enter Username">
            </div> -->




            <!-- <div class="form_input_box">
              <label for="otherPhone">Other Mobile No</label>
              <div class="prefix_phone_box">
                <select [(ngModel)]="prefix" id="prefix" name="prefix" class="form-control">
                  <option value="+1">+1</option>
                </select>
                <input type="tel" [(ngModel)]="otherPhone" [ngClass]="{'input-error': isOtherPhoneInvalid}"
                  id="otherPhone" name="otherPhone" class="form-control" placeholder="Enter Other Mobile No">
              </div>
            </div> -->
            <!-- <div class="form_input_box">
              <label for="dob">DOB</label>
              <input type="date" [(ngModel)]="dob" [ngClass]="{'input-error': isDOBInvalid}" id="dob" name="dob"
                class="form-control" placeholder="Enter DOB">
            </div> -->
            <!-- <div class="form_input_box">
              <label for="addressInfo">Address</label>
              <textarea [(ngModel)]="addressInfo" [ngClass]="{'input-error': isAddressInfoInvalid}" id="addressInfo"
                name="addressInfo" class="form-control bg-transparent" placeholder="Enter your address">
              </textarea>
            </div> -->

            <!-- <div class="form_input_box">
              <label for="password">Password</label>
              <div class="psw_box">
                <input [type]="showPassword ? 'text' : 'password'" [(ngModel)]="password"
                  [ngClass]="{'input-error': isPSWInvalid}" id="password" name="password" class="form-control"
                  placeholder="Enter Password">
                <span class="eye_box" (click)="togglePassword()">
                  <i class="fa" [ngClass]="showCPassword ? 'fa-eye' : 'fa-eye-slash'" aria-hidden="true"></i>
                </span>
              </div>
            </div>
            <div class="form_input_box">
              <label for="cPassword">Password</label>
              <div class="psw_box">
                <input [type]="showCPassword2 ? 'text' : 'cPassword'" [(ngModel)]="cPassword"
                  [ngClass]="{'input-error': iscPSWInvalid}" id="cPassword" name="cPassword" class="form-control"
                  placeholder="Enter Password">
                <span class="eye_box" (click)="togglePassword()">
                  <i class="fa" [ngClass]="showCPassword2 ? 'fa-eye' : 'fa-eye-slash'" aria-hidden="true"></i>
                </span>
              </div>
            </div> -->


            <!-- Rider Image Upload -->
            <!-- <div class="form_input_box">
              <label for="ProfileImage">Rider Image</label>
              <div class="image-upload-box" (click)="openImageOptions()">
                <img *ngIf="riderImagePreview" [src]="riderImagePreview" alt="Rider Image" class="preview-image" />
                <div *ngIf="!riderImagePreview" class="placeholder">
                  <i class="fa fa-user-circle mt-3"></i>                
                  <p>Tap to upload Proof of Identity</p>
                  <small>(Driver's License, Passport, Provincial ID)</small>
                </div>
                <div class="upload-overlay">
                  <i class="fa fa-camera"></i>
                </div>
              </div>              
              <input type="file" accept="image/*" #fileInput (change)="onImageSelected($event)" hidden />
              <input type="file" accept="image/*" capture="environment" #cameraInput (change)="onImageSelected($event)"
                hidden />
            </div> -->

            <!-- Proof of Identity Upload -->

            <!-- <div class="form_input_box">
              <label for="Identity">Proof of Identity</label>
              <p class="note_id">Government-issued ID : Driver's License (preferred), Passport, Provincial ID Card </p>
              <div class="proof-upload-box" (click)="openProofFileOptions()">
                <img *ngIf="proofImagePreview" [src]="proofImagePreview" alt="Proof of ID" class="preview-image" />
                <div *ngIf="!proofImagePreview" class="placeholder">
                  <i class="fa fa-id-card"></i>
                  <p>Tap to upload Proof of Identity</p>
                  <small>(Driver's License, Passport, Provincial ID)</small>
                </div>
                <div class="upload-overlay">
                  <i class="fa fa-camera"></i>
                </div>
              </div>             
              <input type="file" accept="image/*" capture="environment" #proofCameraInput
                (change)="onProofSelected($event)" hidden />
              <input type="file" accept="image/*" #proofFileInput (change)="onProofSelected($event)" hidden />
            </div> -->