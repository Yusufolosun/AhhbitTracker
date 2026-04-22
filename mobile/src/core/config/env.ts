import Constants from 'expo-constants';
import { AppNetworkConfig } from '../types';
import { resolveMobileNetworkConfig } from './stacksConfig';

function getExtra(key: 'appStage' | 'contractAddress' | 'contractName' | 'hiroApiBaseUrl' | 'stacksNetwork') {
  const extra = Constants.expoConfig?.extra as Record<string, string> | undefined;
  return extra?.[key];
}

function getAnalyticsExtra(key: 'analyticsEnabled' | 'analyticsEndpoint' | 'analyticsWriteKey') {
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

export const analyticsRuntimeConfig = Object.freeze({
  enabled:
    (process.env.EXPO_PUBLIC_ANALYTICS_ENABLED ?? getAnalyticsExtra('analyticsEnabled') ?? 'true') !==
    'false',
  endpoint: process.env.EXPO_PUBLIC_ANALYTICS_ENDPOINT ?? getAnalyticsExtra('analyticsEndpoint'),
  writeKey: process.env.EXPO_PUBLIC_ANALYTICS_WRITE_KEY ?? getAnalyticsExtra('analyticsWriteKey'),
});
