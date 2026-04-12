import * as fs from 'fs';
import * as path from 'path';
import * as dotenv from 'dotenv';
import { fileURLToPath } from 'url';
import {
  buildRuntimeConfig,
  assertStacksAddress,
  getContractPrincipal,
  getRuntimeConfigSummary,
  parseContractPrincipal,
  type AppStage,
  type RuntimeConfig,
  type RuntimeConfigSummary,
} from './stacks-config';

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
  cachedConfig = buildRuntimeConfig(process.env, stage);

  return cachedConfig;
}

export { getContractPrincipal };
export { parseContractPrincipal };
export { assertStacksAddress };

export function getSafeRuntimeConfigSummary(config: RuntimeConfig = getRuntimeConfig()): RuntimeConfigSummary {
  return getRuntimeConfigSummary(config);
}
