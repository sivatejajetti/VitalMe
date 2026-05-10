import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.vitalme.app',
  appName: 'VitalMe',
  webDir: 'dist',
  server: {
    androidScheme: 'https',
    hostname: 'vitalme-dashboard.vercel.app'
  }
};

export default config;
