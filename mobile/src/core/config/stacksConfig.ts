import type { AppNetworkConfig, AppStage, StacksNetworkMode } from '@/core/types';

interface StageDefaults {
  stacksNetwork: StacksNetworkMode;
  hiroApiBaseUrl: string;
  contractAddress: string;
  contractName: string;
}

const STAGE_DEFAULTS: Readonly<Record<AppStage, StageDefaults>> = {
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
} as const;

const STACKS_ADDRESS_PATTERN = /^S[PMTN][A-Z0-9]{38}$/;
const CONTRACT_NAME_PATTERN = /^[a-zA-Z]([a-zA-Z0-9_-]{0,127})$/;

function mustBeNonEmpty(value: string | undefined, key: string): string {
  const normalized = value?.trim();

  if (!normalized) {
    throw new Error(`Missing required value for ${key}`);
  }

  return normalized;
}

function isLocalHostname(hostname: string): boolean {
  const normalized = hostname.toLowerCase();

  return (
    normalized === 'localhost' ||
    normalized === '127.0.0.1' ||
    normalized === '::1' ||
    normalized.endsWith('.localhost')
  );
}

export function toAppStage(value: string | undefined): AppStage {
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

function assertNetworkApiConsistency(network: StacksNetworkMode, url: URL, key: string): void {
  const haystack = `${url.hostname}${url.pathname}`.toLowerCase();

  if (network === 'mainnet' && haystack.includes('testnet')) {
    throw new Error(`${key} points to testnet while EXPO_PUBLIC_STACKS_NETWORK is mainnet`);
  }

  if (network === 'testnet' && haystack.includes('mainnet')) {
    throw new Error(`${key} points to mainnet while EXPO_PUBLIC_STACKS_NETWORK is testnet`);
  }
}

function assertUrl(value: string, key: string): string {
  const normalized = mustBeNonEmpty(value, key);

  let parsed: URL;
  try {
    parsed = new URL(normalized);
  } catch {
    throw new Error(`Invalid URL in ${key}: ${value}`);
  }

  const protocol = parsed.protocol.toLowerCase();
  const local = isLocalHostname(parsed.hostname);

  if (protocol !== 'https:' && !(protocol === 'http:' && local)) {
    throw new Error(`${key} must use https (http allowed only for localhost)`);
  }

  parsed.pathname = parsed.pathname.replace(/\/$/, '');
  return parsed.toString().replace(/\/$/, '');
}

interface MobileConfigInput {
  appStage?: string;
  stacksNetwork?: string;
  hiroApiBaseUrl?: string;
  contractAddress?: string;
  contractName?: string;
}

export function resolveMobileNetworkConfig(input: MobileConfigInput): AppNetworkConfig {
  const appStage = toAppStage(input.appStage);
  const defaults = STAGE_DEFAULTS[appStage];
  const networkMode = toNetwork(input.stacksNetwork, defaults.stacksNetwork);

  const hiroApiBaseUrl = assertUrl(
    input.hiroApiBaseUrl ?? defaults.hiroApiBaseUrl,
    'EXPO_PUBLIC_HIRO_API_BASE_URL',
  );
  assertNetworkApiConsistency(networkMode, new URL(hiroApiBaseUrl), 'EXPO_PUBLIC_HIRO_API_BASE_URL');

  return {
    appStage,
    networkMode,
    hiroApiBaseUrl,
    contract: {
      contractAddress: assertStacksAddress(
        input.contractAddress ?? defaults.contractAddress,
        'EXPO_PUBLIC_CONTRACT_ADDRESS',
      ),
      contractName: assertContractName(
        input.contractName ?? defaults.contractName,
        'EXPO_PUBLIC_CONTRACT_NAME',
      ),
    },
  };
}
