import type { ExpoConfig } from 'expo/config';
import { resolveMobileNetworkConfig } from './src/core/config/stacksConfig';

const networkConfig = resolveMobileNetworkConfig({
  appStage: process.env.EXPO_PUBLIC_APP_STAGE ?? process.env.APP_STAGE,
  stacksNetwork: process.env.EXPO_PUBLIC_STACKS_NETWORK,
  hiroApiBaseUrl: process.env.EXPO_PUBLIC_HIRO_API_BASE_URL,
  contractAddress: process.env.EXPO_PUBLIC_CONTRACT_ADDRESS,
  contractName: process.env.EXPO_PUBLIC_CONTRACT_NAME,
});

const config: ExpoConfig = {
  name: 'AhhbitTracker Mobile',
  slug: 'ahhbittracker-mobile',
  version: '1.0.0',
  orientation: 'portrait',
  icon: './assets/icon.png',
  userInterfaceStyle: 'light',
  newArchEnabled: true,
  scheme: 'ahhbittracker',
  splash: {
    image: './assets/splash-icon.png',
    resizeMode: 'contain',
    backgroundColor: '#ffffff',
  },
  ios: {
    supportsTablet: true,
    bundleIdentifier: 'com.ahhbittracker.mobile',
  },
  android: {
    package: 'com.ahhbittracker.mobile',
    adaptiveIcon: {
      foregroundImage: './assets/adaptive-icon.png',
      backgroundColor: '#ffffff',
    },
    edgeToEdgeEnabled: true,
    predictiveBackGestureEnabled: false,
  },
  extra: {
    appStage: networkConfig.appStage,
    contractAddress: networkConfig.contract.contractAddress,
    contractName: networkConfig.contract.contractName,
    hiroApiBaseUrl: networkConfig.hiroApiBaseUrl,
    stacksNetwork: networkConfig.networkMode,
  },
  web: {
    favicon: './assets/favicon.png',
  },
};

export default config;
