export type AppStage = 'development' | 'staging' | 'production';
export type StacksNetworkMode = 'mainnet' | 'testnet';

export interface StageDefaults {
  stacksNetwork: StacksNetworkMode;
  stacksApiUrl: string;
  contractAddress: string;
  contractName: string;
  deployerAddress: string;
}

export interface RuntimeConfig {
  stage: AppStage;
  stacksNetwork: StacksNetworkMode;
  stacksApiUrl: string;
  contractAddress: string;
  contractName: string;
  deployerAddress: string;
}

export const STAGE_DEFAULTS: Readonly<Record<AppStage, StageDefaults>> = {
  development: {
    stacksNetwork: 'testnet',
    stacksApiUrl: 'https://api.testnet.hiro.so',
    contractAddress: 'ST1M46W6CVGAMH3ZJD3TKMY5KCY48HWAZK1GA0CF0',
    contractName: 'habit-tracker-v2',
    deployerAddress: 'ST1M46W6CVGAMH3ZJD3TKMY5KCY48HWAZK1GA0CF0',
  },
  staging: {
    stacksNetwork: 'testnet',
    stacksApiUrl: 'https://api.testnet.hiro.so',
    contractAddress: 'ST1M46W6CVGAMH3ZJD3TKMY5KCY48HWAZK1GA0CF0',
    contractName: 'habit-tracker-v2',
    deployerAddress: 'ST1M46W6CVGAMH3ZJD3TKMY5KCY48HWAZK1GA0CF0',
  },
  production: {
    stacksNetwork: 'mainnet',
    stacksApiUrl: 'https://api.mainnet.hiro.so',
    contractAddress: 'SP1N3809W9CBWWX04KN3TCQHP8A9GN520BD4JMP8Z',
    contractName: 'habit-tracker-v2',
    deployerAddress: 'SP1N3809W9CBWWX04KN3TCQHP8A9GN520BD4JMP8Z',
  },
} as const;

const STACKS_ADDRESS_PATTERN = /^S[PMTN][A-Z0-9]{39}$/;
const CONTRACT_NAME_PATTERN = /^[a-zA-Z]([a-zA-Z0-9_-]{0,127})$/;

function mustBeNonEmpty(value: string | undefined, key: string): string {
  const normalized = value?.trim();
  if (!normalized) {
    throw new Error(`Missing required value for ${key}`);
  }

  return normalized;
}

export function toStage(value: string | undefined): AppStage {
  if (!value) return 'production';

  const normalized = value.trim().toLowerCase();

  if (normalized === 'dev') return 'development';
  if (normalized === 'prod') return 'production';

  if (normalized === 'development' || normalized === 'staging' || normalized === 'production') {
    return normalized;
  }

  return 'production';
}

export function toNetwork(value: string | undefined, fallback: StacksNetworkMode): StacksNetworkMode {
  const normalized = value?.trim().toLowerCase();

  if (normalized === 'mainnet' || normalized === 'testnet') {
    return normalized;
  }

  return fallback;
}

export function assertStacksAddress(value: string, key: string): string {
  const normalized = mustBeNonEmpty(value, key).toUpperCase();

  if (!STACKS_ADDRESS_PATTERN.test(normalized)) {
    throw new Error(`Invalid Stacks address in ${key}: ${value}`);
  }

  return normalized;
}

export function assertContractName(value: string, key: string): string {
  const normalized = mustBeNonEmpty(value, key);

  if (!CONTRACT_NAME_PATTERN.test(normalized)) {
    throw new Error(`Invalid contract name in ${key}: ${value}`);
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

function assertNetworkApiConsistency(network: StacksNetworkMode, url: URL, key: string): void {
  const haystack = `${url.hostname}${url.pathname}`.toLowerCase();

  if (network === 'mainnet' && haystack.includes('testnet')) {
    throw new Error(`${key} points to testnet while STACKS_NETWORK is mainnet`);
  }

  if (network === 'testnet' && haystack.includes('mainnet')) {
    throw new Error(`${key} points to mainnet while STACKS_NETWORK is testnet`);
  }
}

export function assertStacksApiUrl(
  value: string,
  key: string,
  network: StacksNetworkMode,
): string {
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

  assertNetworkApiConsistency(network, parsed, key);

  parsed.pathname = parsed.pathname.replace(/\/$/, '');
  return parsed.toString().replace(/\/$/, '');
}

export function buildRuntimeConfig(env: NodeJS.ProcessEnv, stage: AppStage): RuntimeConfig {
  const defaults = STAGE_DEFAULTS[stage];
  const stacksNetwork = toNetwork(env.STACKS_NETWORK, defaults.stacksNetwork);

  const stacksApiUrl = assertStacksApiUrl(
    env.STACKS_API_URL ?? defaults.stacksApiUrl,
    'STACKS_API_URL',
    stacksNetwork,
  );

  return {
    stage,
    stacksNetwork,
    stacksApiUrl,
    contractAddress: assertStacksAddress(
      env.CONTRACT_ADDRESS ?? defaults.contractAddress,
      'CONTRACT_ADDRESS',
    ),
    contractName: assertContractName(env.CONTRACT_NAME ?? defaults.contractName, 'CONTRACT_NAME'),
    deployerAddress: assertStacksAddress(
      env.DEPLOYER_ADDRESS ?? defaults.deployerAddress,
      'DEPLOYER_ADDRESS',
    ),
  };
}

export function getContractPrincipal(config: Pick<RuntimeConfig, 'contractAddress' | 'contractName'>): string {
  return `${config.contractAddress}.${config.contractName}`;
}

export function parseContractPrincipal(
  contractPrincipal: string,
  key = 'CONTRACT_PRINCIPAL',
): { contractAddress: string; contractName: string } {
  const normalized = mustBeNonEmpty(contractPrincipal, key);
  const [address, name] = normalized.split('.', 2);

  if (!address || !name) {
    throw new Error(`${key} must be in ADDRESS.CONTRACT_NAME format`);
  }

  return {
    contractAddress: assertStacksAddress(address, `${key} address`),
    contractName: assertContractName(name, `${key} name`),
  };
}

export interface RuntimeConfigSummary {
  stage: AppStage;
  stacksNetwork: StacksNetworkMode;
  stacksApiUrl: string;
  contractPrincipal: string;
  deployerAddress: string;
}

export function getRuntimeConfigSummary(config: RuntimeConfig): RuntimeConfigSummary {
  return {
    stage: config.stage,
    stacksNetwork: config.stacksNetwork,
    stacksApiUrl: config.stacksApiUrl,
    contractPrincipal: getContractPrincipal(config),
    deployerAddress: config.deployerAddress,
  };
}
