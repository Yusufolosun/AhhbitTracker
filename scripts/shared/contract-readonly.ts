import { createNetwork } from '@stacks/network';
import {
  cvToJSON,
  fetchCallReadOnlyFunction,
  principalCV,
  uintCV,
} from '@stacks/transactions';

type NetworkMode = 'mainnet' | 'testnet';

interface ReadonlyClientConfig {
  contractAddress: string;
  contractName: string;
  mode?: NetworkMode;
  baseUrl?: string;
  senderAddress?: string;
}

interface HabitData {
  owner: string;
  name: string;
  stakeAmount: number;
  currentStreak: number;
  lastCheckInBlock: number;
  createdAtBlock: number;
  isActive: boolean;
  isCompleted: boolean;
  bonusClaimed: boolean;
}

interface UserStatsData {
  totalHabits: number;
  habitIds: number[];
}

function asRecord(input: unknown): Record<string, unknown> {
  if (input && typeof input === 'object') {
    return input as Record<string, unknown>;
  }
  return {};
}

function unwrapValue(input: unknown): unknown {
  const value = asRecord(input).value;
  if (value === undefined) return input;
  return unwrapValue(value);
}

function readNumber(input: unknown, fallback = 0): number {
  const unwrapped = unwrapValue(input);
  if (typeof unwrapped === 'number') return unwrapped;
  if (typeof unwrapped === 'string') {
    const parsed = Number(unwrapped);
    return Number.isFinite(parsed) ? parsed : fallback;
  }
  return fallback;
}

function readString(input: unknown, fallback = ''): string {
  const unwrapped = unwrapValue(input);
  return typeof unwrapped === 'string' ? unwrapped : fallback;
}

function readBoolean(input: unknown, fallback = false): boolean {
  const unwrapped = unwrapValue(input);
  return typeof unwrapped === 'boolean' ? unwrapped : fallback;
}

function parseHabit(json: unknown): HabitData | null {
  const root = asRecord(json);
  if (!json || root.value === null || String(root.type ?? '').includes('optional none')) {
    return null;
  }

  const firstLevel = asRecord(root.value ?? json);
  const tuple = firstLevel.value && typeof firstLevel.value === 'object'
    ? asRecord(firstLevel.value)
    : firstLevel;

  return {
    owner: readString(tuple.owner),
    name: readString(tuple.name),
    stakeAmount: readNumber(tuple['stake-amount']),
    currentStreak: readNumber(tuple['current-streak']),
    lastCheckInBlock: readNumber(tuple['last-check-in-block']),
    createdAtBlock: readNumber(tuple['created-at-block']),
    isActive: readBoolean(tuple['is-active']),
    isCompleted: readBoolean(tuple['is-completed']),
    bonusClaimed: readBoolean(tuple['bonus-claimed']),
  };
}

function parseOkNumber(json: unknown): number {
  const root = asRecord(json);

  if (root.success === true) return readNumber(root.value, 0);
  if (root.type === 'ok' || root.type === 'response_ok') return readNumber(root.value, 0);
  return readNumber(root.value, 0);
}

function parseUserHabits(json: unknown): number[] {
  const root = asRecord(json);
  const rootValue = asRecord(root.value);
  const wrapper = asRecord(rootValue['habit-ids']);
  const items = Array.isArray(wrapper.value) ? wrapper.value : [];

  return items.map((item) => readNumber(item)).filter((value) => Number.isFinite(value));
}

function parseUserStats(json: unknown): UserStatsData {
  const root = asRecord(json);
  const payload = asRecord(root.value ?? root);
  const idsWrapper = asRecord(payload['habit-ids']);
  const ids = Array.isArray(idsWrapper.value) ? idsWrapper.value : [];

  return {
    totalHabits: readNumber(payload['total-habits']),
    habitIds: ids.map((item) => readNumber(item)).filter((value) => Number.isFinite(value)),
  };
}

export function createContractReadonlyClient(config: ReadonlyClientConfig) {
  const network = createNetwork({
    network: config.mode ?? 'mainnet',
    client: {
      baseUrl: config.baseUrl,
    },
  });

  const senderAddress = config.senderAddress ?? config.contractAddress;

  async function call(functionName: string, functionArgs: Parameters<typeof fetchCallReadOnlyFunction>[0]['functionArgs']) {
    const result = await fetchCallReadOnlyFunction({
      contractAddress: config.contractAddress,
      contractName: config.contractName,
      functionName,
      functionArgs,
      senderAddress,
      network,
    });

    return cvToJSON(result);
  }

  return {
    async getHabit(habitId: number): Promise<HabitData | null> {
      const json = await call('get-habit', [uintCV(habitId)]);
      return parseHabit(json);
    },

    async getHabitStreak(habitId: number): Promise<number> {
      const json = await call('get-habit-streak', [uintCV(habitId)]);
      return parseOkNumber(json);
    },

    async getPoolBalance(): Promise<number> {
      const json = await call('get-pool-balance', []);
      return parseOkNumber(json);
    },

    async getUserHabits(address: string): Promise<number[]> {
      const json = await call('get-user-habits', [principalCV(address)]);
      return parseUserHabits(json);
    },

    async getUserStats(address: string): Promise<UserStatsData> {
      const json = await call('get-user-stats', [principalCV(address)]);
      return parseUserStats(json);
    },
  };
}

export type { HabitData, UserStatsData, ReadonlyClientConfig };
