import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.vitalme.app',
  appName: 'VitalMe',
  webDir: 'dist',
  server: {
    androidScheme: 'https',
    hostname: 'vitalme-dashboard.vercel.app'
  },
  plugins: {
    GoogleAuth: {
      scopes: ["profile", "email"],
      serverClientId: "YOUR_GOOGLE_CLIENT_ID_HERE",
      forceCodeForRefreshToken: true
    }
  }
};

export default config;
