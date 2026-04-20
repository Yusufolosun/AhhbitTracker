import type { ExpoConfig } from 'expo/config';

type AppStage = 'development' | 'staging' | 'production';
type StacksNetworkMode = 'mainnet' | 'testnet';

interface ResolvedNetworkConfig {
  appStage: AppStage;
  networkMode: StacksNetworkMode;
  hiroApiBaseUrl: string;
  contract: {
    contractAddress: string;
    contractName: string;
  };
}

const STAGE_DEFAULTS: Readonly<Record<AppStage, ResolvedNetworkConfig>> = {
  development: {
    appStage: 'development',
    networkMode: 'testnet',
    hiroApiBaseUrl: 'https://api.testnet.hiro.so',
    contract: {
      contractAddress: 'ST1M46W6CVGAMH3ZJD3TKMY5KCY48HWAZK1GA0CF0',
      contractName: 'habit-tracker-v2',
    },
  },
  staging: {
    appStage: 'staging',
    networkMode: 'testnet',
    hiroApiBaseUrl: 'https://api.testnet.hiro.so',
    contract: {
      contractAddress: 'ST1M46W6CVGAMH3ZJD3TKMY5KCY48HWAZK1GA0CF0',
      contractName: 'habit-tracker-v2',
    },
  },
  production: {
    appStage: 'production',
    networkMode: 'mainnet',
    hiroApiBaseUrl: 'https://api.mainnet.hiro.so',
    contract: {
      contractAddress: 'SP1N3809W9CBWWX04KN3TCQHP8A9GN520BD4JMP8Z',
      contractName: 'habit-tracker-v2',
    },
  },
};

const STACKS_ADDRESS_PATTERN = /^S[PMTN][A-Z0-9]{39}$/;
const CONTRACT_NAME_PATTERN = /^[a-zA-Z]([a-zA-Z0-9_-]{0,127})$/;

function mustBeNonEmpty(value: string | undefined, key: string): string {
  const normalized = value?.trim();

  if (!normalized) {
    throw new Error(`Missing required value for ${key}`);
  }

  return normalized;
}

function toAppStage(value: string | undefined): AppStage {
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

function assertStacksAddress(value: string, key: string): string {
  const normalized = mustBeNonEmpty(value, key).toUpperCase();

  if (!STACKS_ADDRESS_PATTERN.test(normalized)) {
    throw new Error(`Invalid Stacks address in ${key}: ${value}`);
  }

  return normalized;
}

function assertContractName(value: string, key: string): string {
  const normalized = mustBeNonEmpty(value, key);

  if (!CONTRACT_NAME_PATTERN.test(normalized)) {
    throw new Error(`Invalid contract name in ${key}: ${value}`);
  }

  return normalized;
}

function resolveNetworkConfig(): ResolvedNetworkConfig {
  const appStage = toAppStage(process.env.EXPO_PUBLIC_APP_STAGE ?? process.env.APP_STAGE);
  const defaults = STAGE_DEFAULTS[appStage];
  const networkMode = toNetwork(process.env.EXPO_PUBLIC_STACKS_NETWORK, defaults.networkMode);

  return {
    appStage,
    networkMode,
    hiroApiBaseUrl: mustBeNonEmpty(
      process.env.EXPO_PUBLIC_HIRO_API_BASE_URL ?? defaults.hiroApiBaseUrl,
      'EXPO_PUBLIC_HIRO_API_BASE_URL',
    ),
    contract: {
      contractAddress: assertStacksAddress(
        process.env.EXPO_PUBLIC_CONTRACT_ADDRESS ?? defaults.contract.contractAddress,
        'EXPO_PUBLIC_CONTRACT_ADDRESS',
      ),
      contractName: assertContractName(
        process.env.EXPO_PUBLIC_CONTRACT_NAME ?? defaults.contract.contractName,
        'EXPO_PUBLIC_CONTRACT_NAME',
      ),
    },
  };
}

const networkConfig = resolveNetworkConfig();

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
  plugins: ['expo-notifications'],
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
