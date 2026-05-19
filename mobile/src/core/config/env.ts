import Constants from 'expo-constants';
import { AppNetworkConfig } from '../types';
import { resolveMobileNetworkConfig } from './stacksConfig';

type ConfigExtraKey = 'appStage' | 'contractAddress' | 'contractName' | 'hiroApiBaseUrl' | 'stacksNetwork';
type AnalyticsExtraKey = 'analyticsEnabled' | 'analyticsEndpoint' | 'analyticsWriteKey';

const env = process.env as Record<string, string | undefined>;

function readExtraValue(key: ConfigExtraKey): string | undefined {
  const extra = Constants.expoConfig?.extra;

  if (!extra || typeof extra !== 'object') {
    return undefined;
  }

  const value = (extra as Record<string, unknown>)[key];
  return typeof value === 'string' ? value : undefined;
}

function readAnalyticsExtraValue(key: AnalyticsExtraKey): string | undefined {
  const extra = Constants.expoConfig?.extra;

  if (!extra || typeof extra !== 'object') {
    return undefined;
  }

  const value = (extra as Record<string, unknown>)[key];
  return typeof value === 'string' ? value : undefined;
}

export const networkConfig: AppNetworkConfig = Object.freeze(
  resolveMobileNetworkConfig({
    appStage: env.EXPO_PUBLIC_APP_STAGE ?? readExtraValue('appStage'),
    stacksNetwork: env.EXPO_PUBLIC_STACKS_NETWORK ?? readExtraValue('stacksNetwork'),
    hiroApiBaseUrl: env.EXPO_PUBLIC_HIRO_API_BASE_URL ?? readExtraValue('hiroApiBaseUrl'),
    contractAddress: env.EXPO_PUBLIC_CONTRACT_ADDRESS ?? readExtraValue('contractAddress'),
    contractName: env.EXPO_PUBLIC_CONTRACT_NAME ?? readExtraValue('contractName'),
  }),
);

export const analyticsRuntimeConfig = Object.freeze({
  enabled:
    (env.EXPO_PUBLIC_ANALYTICS_ENABLED ?? readAnalyticsExtraValue('analyticsEnabled') ?? 'true') !==
    'false',
  endpoint: env.EXPO_PUBLIC_ANALYTICS_ENDPOINT ?? readAnalyticsExtraValue('analyticsEndpoint'),
  writeKey: env.EXPO_PUBLIC_ANALYTICS_WRITE_KEY ?? readAnalyticsExtraValue('analyticsWriteKey'),
});
