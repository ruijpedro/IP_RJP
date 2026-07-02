import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'pt.rjp.iprjp',
  appName: 'IP_RJP',
  webDir: 'dist',
  bundledWebRuntime: false,
  android: { allowMixedContent: true }
};

export default config;
