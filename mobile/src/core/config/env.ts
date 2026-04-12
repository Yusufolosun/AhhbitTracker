import Constants from 'expo-constants';
import type { AppNetworkConfig } from '@/core/types';
import { resolveMobileNetworkConfig } from '@/core/config/stacksConfig';

function getExtra(key: 'appStage' | 'contractAddress' | 'contractName' | 'hiroApiBaseUrl' | 'stacksNetwork') {
  const extra = Constants.expoConfig?.extra as Record<string, string> | undefined;
  return extra?.[key];
}

export const networkConfig: AppNetworkConfig = Object.freeze(
  resolveMobileNetworkConfig({
    appStage: process.env.EXPO_PUBLIC_APP_STAGE ?? getExtra('appStage'),
    stacksNetwork: process.env.EXPO_PUBLIC_STACKS_NETWORK ?? getExtra('stacksNetwork'),
    hiroApiBaseUrl: process.env.EXPO_PUBLIC_HIRO_API_BASE_URL ?? getExtra('hiroApiBaseUrl'),
    contractAddress: process.env.EXPO_PUBLIC_CONTRACT_ADDRESS ?? getExtra('contractAddress'),
    contractName: process.env.EXPO_PUBLIC_CONTRACT_NAME ?? getExtra('contractName'),
  }),
);
