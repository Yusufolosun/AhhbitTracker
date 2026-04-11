type FrontendStage = 'development' | 'staging' | 'production';
type StacksNetworkMode = 'mainnet' | 'testnet';

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

const STAGE_DEFAULTS: Record<FrontendStage, StageDefaults> = {
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
};

function toStage(rawStage: string | undefined, isDev: boolean, mode: string | undefined): FrontendStage {
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

export function getFrontendRuntimeConfig(env: ImportMetaEnv = import.meta.env): FrontendRuntimeConfig {
  const stage = toStage(env.VITE_APP_STAGE, Boolean(env.DEV), env.MODE);
  const defaults = STAGE_DEFAULTS[stage];

  return {
    stage,
    stacksNetwork: toNetwork(env.VITE_STACKS_NETWORK, defaults.stacksNetwork),
    stacksApiUrl: env.VITE_STACKS_API_URL ?? defaults.stacksApiUrl,
    contractAddress: env.VITE_CONTRACT_ADDRESS ?? defaults.contractAddress,
    contractName: env.VITE_CONTRACT_NAME ?? defaults.contractName,
    appUrl: env.VITE_APP_URL ?? defaults.appUrl,
  };
}
