import type { ExpoConfig } from 'expo/config';

type AppStage = 'development' | 'staging' | 'production';
type StacksNetworkMode = 'mainnet' | 'testnet';

interface StageDefaults {
  stacksNetwork: StacksNetworkMode;
  hiroApiBaseUrl: string;
  contractAddress: string;
  contractName: string;
}

const STAGE_DEFAULTS: Record<AppStage, StageDefaults> = {
  development: {
    stacksNetwork: 'testnet',
    hiroApiBaseUrl: 'https://api.testnet.hiro.so',
    contractAddress: 'ST1M46W6CVGAMH3ZJD3TKMY5KCY48HWAZK1GA0CF0',
    contractName: 'habit-tracker-v2',
  },
  staging: {
    stacksNetwork: 'testnet',
    hiroApiBaseUrl: 'https://api.testnet.hiro.so',
    contractAddress: 'ST1M46W6CVGAMH3ZJD3TKMY5KCY48HWAZK1GA0CF0',
    contractName: 'habit-tracker-v2',
  },
  production: {
    stacksNetwork: 'mainnet',
    hiroApiBaseUrl: 'https://api.mainnet.hiro.so',
    contractAddress: 'SP1N3809W9CBWWX04KN3TCQHP8A9GN520BD4JMP8Z',
    contractName: 'habit-tracker-v2',
  },
};

function toStage(value: string | undefined): AppStage {
  const normalized = value?.trim().toLowerCase();
  if (normalized === 'development' || normalized === 'staging' || normalized === 'production') {
    return normalized;
  }

  return 'production';
}

function toNetwork(value: string | undefined, fallback: StacksNetworkMode): StacksNetworkMode {
  const normalized = value?.trim().toLowerCase();
  if (normalized === 'mainnet' || normalized === 'testnet') {
    return normalized;
  }

  return fallback;
}

const stage = toStage(process.env.EXPO_PUBLIC_APP_STAGE ?? process.env.APP_STAGE);
const defaults = STAGE_DEFAULTS[stage];
const stacksNetwork = toNetwork(process.env.EXPO_PUBLIC_STACKS_NETWORK, defaults.stacksNetwork);

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
    appStage: stage,
    contractAddress: process.env.EXPO_PUBLIC_CONTRACT_ADDRESS ?? defaults.contractAddress,
    contractName: process.env.EXPO_PUBLIC_CONTRACT_NAME ?? defaults.contractName,
    hiroApiBaseUrl: process.env.EXPO_PUBLIC_HIRO_API_BASE_URL ?? defaults.hiroApiBaseUrl,
    stacksNetwork,
  },
  web: {
    favicon: './assets/favicon.png',
  },
};

export default config;
