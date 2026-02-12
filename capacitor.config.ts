import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'go.green.rider', 
  appName: 'Go Green Rider',       
  webDir: 'www',
  plugins: {
    Geolocation: {
      // Enable background geolocation if required
      backgroundMode: true,
    },
    GoogleAuth: {
      scopes: ['profile', 'email'],
      serverClientId: '216191980655-dgco8tmfi613b2i8pg5qdobh28t57nh7.apps.googleusercontent.com',
      forceCodeForRefreshToken: true
    },
    PushNotifications: {
      presentationOptions: ['badge', 'sound', 'alert']
    }
  }
};

export default config;
