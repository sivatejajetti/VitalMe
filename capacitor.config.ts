import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.vitalme.app',
  appName: 'VitalMe',
  webDir: 'dist',
  server: {
    androidScheme: 'https',
    hostname: 'vitalme.vercel.app'
  },
  plugins: {
    GoogleAuth: {
      scopes: ["profile", "email"],
      serverClientId: "602892085842-lo63qlr23v3qgr7491qs7nboc9tpnigh.apps.googleusercontent.com",
      forceCodeForRefreshToken: true
    }
  }
};

export default config;
