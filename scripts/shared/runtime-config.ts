import * as fs from 'fs';
import * as path from 'path';
import * as dotenv from 'dotenv';
import { fileURLToPath } from 'url';

export type AppStage = 'development' | 'staging' | 'production';
export type StacksNetworkMode = 'mainnet' | 'testnet';

interface StageDefaults {
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

const STAGE_DEFAULTS: Record<AppStage, StageDefaults> = {
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
};

let cachedConfig: RuntimeConfig | null = null;

function resolveRepoRoot(): string {
  const filePath = fileURLToPath(import.meta.url);
  const dir = path.dirname(filePath);
  return path.resolve(dir, '..', '..');
}

function toStage(value: string | undefined): AppStage {
  if (!value) return 'production';
  const normalized = value.trim().toLowerCase();

  if (normalized === 'dev') return 'development';
  if (normalized === 'prod') return 'production';

  if (normalized === 'development' || normalized === 'staging' || normalized === 'production') {
    return normalized;
  }

  return 'production';
}

function toNetwork(value: string | undefined, fallback: StacksNetworkMode): StacksNetworkMode {
  if (!value) return fallback;
  const normalized = value.trim().toLowerCase();
  return normalized === 'testnet' ? 'testnet' : normalized === 'mainnet' ? 'mainnet' : fallback;
}

function loadFileIfExists(filePath: string): void {
  if (!fs.existsSync(filePath)) {
    return;
  }

  dotenv.config({ path: filePath, override: false });
}

function loadStageEnvironment(rootDir: string): AppStage {
  const stage = toStage(process.env.APP_STAGE ?? process.env.STAGE ?? process.env.NODE_ENV);

  // Highest-priority files are loaded first so shell-provided vars always win.
  const candidateFiles = [
    `.env.${stage}.local`,
    '.env.local',
    `.env.${stage}`,
    '.env',
  ];

  for (const candidate of candidateFiles) {
    loadFileIfExists(path.join(rootDir, candidate));
  }

  return stage;
}

export function getRuntimeConfig(forceReload = false): RuntimeConfig {
  if (cachedConfig && !forceReload) {
    return cachedConfig;
  }

  const rootDir = resolveRepoRoot();
  const stage = loadStageEnvironment(rootDir);
  const defaults = STAGE_DEFAULTS[stage];

  const stacksNetwork = toNetwork(process.env.STACKS_NETWORK, defaults.stacksNetwork);

  cachedConfig = {
    stage,
    stacksNetwork,
    stacksApiUrl: process.env.STACKS_API_URL ?? defaults.stacksApiUrl,
    contractAddress: process.env.CONTRACT_ADDRESS ?? defaults.contractAddress,
    contractName: process.env.CONTRACT_NAME ?? defaults.contractName,
    deployerAddress: process.env.DEPLOYER_ADDRESS ?? defaults.deployerAddress,
  };

  return cachedConfig;
}

export function getContractPrincipal(config: RuntimeConfig = getRuntimeConfig()): string {
  return `${config.contractAddress}.${config.contractName}`;
}
