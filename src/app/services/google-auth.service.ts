import { Injectable } from '@angular/core';
import { GooglePlus } from '@awesome-cordova-plugins/google-plus/ngx';
import { Platform } from '@ionic/angular';
import { Geolocation } from '@capacitor/geolocation';
import {
  getAuth,
  GoogleAuthProvider,
  signInWithCredential,
  signInWithPopup,
  getAdditionalUserInfo,
  UserCredential
} from 'firebase/auth';

@Injectable({
  providedIn: 'root',
})
export class GoogleAuthService {
  constructor(private googlePlus: GooglePlus, private platform: Platform) {}

  async googleAuth() {
    const auth = getAuth();
    try {
      if (this.platform.is('capacitor')) {
        // Native login (Android/iOS)
        const gplusUser = await this.googlePlus.login({
          webClientId: '219923939926-2j8ktbkvv96vovltbgqmej1delgccp3d.apps.googleusercontent.com', // Correct Web Client ID
          offline: true,
        });

        // Create credential for Firebase
        const credential = GoogleAuthProvider.credential(gplusUser.idToken);
        const result: UserCredential = await signInWithCredential(auth, credential);

        // Get additional user info and ID token
        const additionalInfo = getAdditionalUserInfo(result);
        const token = await result.user.getIdToken();  // Get ID token from Firebase

        // console.log('User ID Token:', token);  // Log the token for debugging
        // console.log('Is New User:', additionalInfo?.isNewUser);  // Check if user is new

        return {
          user: result.user,
          token,
          isNewUser: additionalInfo?.isNewUser ?? false,
        };
      } else {
        // Web login
        const provider = new GoogleAuthProvider();
        const result: UserCredential = await signInWithPopup(auth, provider);

        // Get additional user info and ID token
        const additionalInfo = getAdditionalUserInfo(result);
        const token = await result.user.getIdToken();  // Get ID token from Firebase

        // console.log('User ID Token:', token);  // Log the token for debugging
        // console.log('Is New User:', additionalInfo?.isNewUser);  // Check if user is new

        return {
          user: result.user,
          token,
          isNewUser: additionalInfo?.isNewUser ?? false,
        };
      }
    } catch (error: any) {
      console.error('Google Authentication Failed:', error);
      throw new Error(`Google authentication failed: ${error.message}`); // Provide more detailed error
    }
  }
  async checkAndRequestPermissions() {
    const permissionStatus = await Geolocation.requestPermissions();
    if (permissionStatus.location !== 'granted') {
      // console.log('Location permission denied');
      return false;
    }
    return true;
  }

  async getLocation() {
    const position = await Geolocation.getCurrentPosition();
    return position;
  }
}
