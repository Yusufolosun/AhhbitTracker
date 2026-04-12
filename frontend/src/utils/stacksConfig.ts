export type FrontendStage = 'development' | 'staging' | 'production';
export type StacksNetworkMode = 'mainnet' | 'testnet';

interface StageDefaults {
  stacksNetwork: StacksNetworkMode;
  stacksApiUrl: string;
  contractAddress: string;
  contractName: string;
  appUrl: string;
}

export interface FrontendRuntimeConfig {
  stage: FrontendStage;
  stacksNetwork: StacksNetworkMode;
  stacksApiUrl: string;
  contractAddress: string;
  contractName: string;
  appUrl: string;
}

const STAGE_DEFAULTS: Readonly<Record<FrontendStage, StageDefaults>> = {
  development: {
    stacksNetwork: 'testnet',
    stacksApiUrl: 'https://api.testnet.hiro.so',
    contractAddress: 'ST1M46W6CVGAMH3ZJD3TKMY5KCY48HWAZK1GA0CF0',
    contractName: 'habit-tracker-v2',
    appUrl: 'http://localhost:3000',
  },
  staging: {
    stacksNetwork: 'testnet',
    stacksApiUrl: 'https://api.testnet.hiro.so',
    contractAddress: 'ST1M46W6CVGAMH3ZJD3TKMY5KCY48HWAZK1GA0CF0',
    contractName: 'habit-tracker-v2',
    appUrl: 'https://staging.ahhbittracker.app',
  },
  production: {
    stacksNetwork: 'mainnet',
    stacksApiUrl: 'https://api.mainnet.hiro.so',
    contractAddress: 'SP1N3809W9CBWWX04KN3TCQHP8A9GN520BD4JMP8Z',
    contractName: 'habit-tracker-v2',
    appUrl: 'https://ahhbit-tracker.vercel.app',
  },
} as const;

const STACKS_ADDRESS_PATTERN = /^S[PMTN][A-Z0-9]{38}$/;
const CONTRACT_NAME_PATTERN = /^[a-zA-Z]([a-zA-Z0-9_-]{0,127})$/;

function isLocalHostname(hostname: string): boolean {
  const normalized = hostname.toLowerCase();

  return (
    normalized === 'localhost' ||
    normalized === '127.0.0.1' ||
    normalized === '::1' ||
    normalized.endsWith('.localhost')
  );
}

function mustBeNonEmpty(value: string | undefined, key: string): string {
  const normalized = value?.trim();

  if (!normalized) {
    throw new Error(`Missing required value for ${key}`);
  }

  return normalized;
}

export function toFrontendStage(
  rawStage: string | undefined,
  isDev: boolean,
  mode: string | undefined,
): FrontendStage {
  const normalized = rawStage?.trim().toLowerCase();

  if (normalized === 'development' || normalized === 'staging' || normalized === 'production') {
    return normalized;
  }

  if (mode === 'staging') {
    return 'staging';
  }

  return isDev ? 'development' : 'production';
}

function toNetwork(rawNetwork: string | undefined, fallback: StacksNetworkMode): StacksNetworkMode {
  const normalized = rawNetwork?.trim().toLowerCase();

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
    throw new Error(`${key} points to testnet while VITE_STACKS_NETWORK is mainnet`);
  }

  if (network === 'testnet' && haystack.includes('mainnet')) {
    throw new Error(`${key} points to mainnet while VITE_STACKS_NETWORK is testnet`);
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

function assertStacksApiUrl(value: string, network: StacksNetworkMode): string {
  const normalized = assertUrl(value, 'VITE_STACKS_API_URL');
  assertNetworkApiConsistency(network, new URL(normalized), 'VITE_STACKS_API_URL');
  return normalized;
}

function assertAppUrl(value: string): string {
  return assertUrl(value, 'VITE_APP_URL');
}

export function resolveFrontendRuntimeConfig(
  env: Pick<
    ImportMetaEnv,
    | 'MODE'
    | 'DEV'
    | 'VITE_APP_STAGE'
    | 'VITE_STACKS_NETWORK'
    | 'VITE_STACKS_API_URL'
    | 'VITE_CONTRACT_ADDRESS'
    | 'VITE_CONTRACT_NAME'
    | 'VITE_APP_URL'
  >,
): FrontendRuntimeConfig {
  const stage = toFrontendStage(env.VITE_APP_STAGE, Boolean(env.DEV), env.MODE);
  const defaults = STAGE_DEFAULTS[stage];
  const stacksNetwork = toNetwork(env.VITE_STACKS_NETWORK, defaults.stacksNetwork);

  return {
    stage,
    stacksNetwork,
    stacksApiUrl: assertStacksApiUrl(env.VITE_STACKS_API_URL ?? defaults.stacksApiUrl, stacksNetwork),
    contractAddress: assertStacksAddress(
      env.VITE_CONTRACT_ADDRESS ?? defaults.contractAddress,
      'VITE_CONTRACT_ADDRESS',
    ),
    contractName: assertContractName(env.VITE_CONTRACT_NAME ?? defaults.contractName, 'VITE_CONTRACT_NAME'),
    appUrl: assertAppUrl(env.VITE_APP_URL ?? defaults.appUrl),
  };
}
