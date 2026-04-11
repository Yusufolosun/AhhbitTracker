import Constants from 'expo-constants';
import type { AppNetworkConfig, AppStage, StacksNetworkMode } from '@/core/types';

function getExtra(key: 'appStage' | 'contractAddress' | 'contractName' | 'hiroApiBaseUrl' | 'stacksNetwork') {
  const extra = Constants.expoConfig?.extra as Record<string, string> | undefined;
  return extra?.[key];
}

function getAppStage(value: string | undefined): AppStage {
  return value === 'development' || value === 'staging' || value === 'production'
    ? value
    : 'production';
}

function getStacksNetworkMode(value: string | undefined): StacksNetworkMode {
  return value === 'testnet' ? 'testnet' : 'mainnet';
}

const contractAddress =
  process.env.EXPO_PUBLIC_CONTRACT_ADDRESS ??
  getExtra('contractAddress') ??
  'SP1N3809W9CBWWX04KN3TCQHP8A9GN520BD4JMP8Z';

const contractName =
  process.env.EXPO_PUBLIC_CONTRACT_NAME ?? getExtra('contractName') ?? 'habit-tracker-v2';

const hiroApiBaseUrl =
  process.env.EXPO_PUBLIC_HIRO_API_BASE_URL ??
  getExtra('hiroApiBaseUrl') ??
  'https://api.mainnet.hiro.so';

const networkMode = getStacksNetworkMode(
  process.env.EXPO_PUBLIC_STACKS_NETWORK ?? getExtra('stacksNetwork') ?? 'mainnet',
);

const appStage = getAppStage(process.env.EXPO_PUBLIC_APP_STAGE ?? getExtra('appStage'));

export const networkConfig: AppNetworkConfig = {
  contract: {
    contractAddress,
    contractName,
  },
  hiroApiBaseUrl,
  networkMode,
  appStage,
};
