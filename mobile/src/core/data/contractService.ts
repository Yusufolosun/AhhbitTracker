import {
  getHabit,
  getPoolBalance,
  getUserHabits,
  getUserStats,
  type Habit as SdkHabit,
} from '@yusufolosun/ahhbit-tracker-sdk';
import { cvToJSON, fetchCallReadOnlyFunction } from '@stacks/transactions';
import { formatSTX } from '@yusufolosun/stx-utils';
import { networkConfig, POLLING_INTERVAL_MS } from '@/core/config';
import { stacksNetwork } from '@/core/network';
import type { Habit, PoolBalance, UserStats } from '@/core/types';
import { invalidateReadCache, readThroughCache } from './readCache';

const CACHE_PREFIX = 'mobile-contract-read:';

const cacheKeys = {
  habit: (habitId: number) => `${CACHE_PREFIX}habit:${habitId}`,
  userHabits: (address: string) => `${CACHE_PREFIX}user-habits:${address}`,
  userStats: (address: string) => `${CACHE_PREFIX}user-stats:${address}`,
  poolBalance: () => `${CACHE_PREFIX}pool-balance`,
  estimatedBonusShare: () => `${CACHE_PREFIX}estimated-bonus-share`,
  unclaimedCompletedHabits: () => `${CACHE_PREFIX}unclaimed-completed-habits`,
};

export function invalidateHabitReadCache(habitId: number): void {
  invalidateReadCache(cacheKeys.habit(habitId));
}

export function invalidateAddressReadCache(address: string | null | undefined): void {
  if (!address) {
    return;
  }

  invalidateReadCache(cacheKeys.userHabits(address));
  invalidateReadCache(cacheKeys.userStats(address));
}

export function invalidatePoolReadCache(): void {
  invalidateReadCache(cacheKeys.poolBalance());
  invalidateReadCache(cacheKeys.estimatedBonusShare());
  invalidateReadCache(cacheKeys.unclaimedCompletedHabits());
}

export function clearContractReadCache(): void {
  invalidateReadCache(CACHE_PREFIX);
}

function readNumericValue(value: unknown): number {
  if (typeof value === 'number') {
    return value;
  }

  if (typeof value === 'string' && value.trim() !== '') {
    return Number(value);
  }

  if (value && typeof value === 'object' && 'value' in value) {
    const nested = (value as { value?: unknown }).value;
    return readNumericValue(nested);
  }

  return 0;
}

function unwrapOkNumber(json: unknown): number {
  if (!json || typeof json !== 'object') {
    return 0;
  }

  const record = json as { success?: boolean; value?: unknown };

  if (record.success === true) {
    return readNumericValue(record.value);
  }

  return readNumericValue(record.value ?? json);
}

async function readPoolDistributionValue(functionName: string): Promise<number> {
  const response = await fetchCallReadOnlyFunction({
    contractAddress: networkConfig.contract.contractAddress,
    contractName: networkConfig.contract.contractName,
    functionName,
    functionArgs: [],
    network: stacksNetwork,
    senderAddress: networkConfig.contract.contractAddress,
  });

  return unwrapOkNumber(cvToJSON(response));
}

function toMobileHabit(habitId: number, value: SdkHabit): Habit {
  return {
    habitId,
    owner: value.owner,
    name: value.name,
    stakeAmount: value.stakeAmount,
    currentStreak: value.currentStreak,
    lastCheckInBlock: value.lastCheckInBlock,
    createdAtBlock: value.createdAtBlock,
    isActive: value.isActive,
    isCompleted: value.isCompleted,
    bonusClaimed: value.bonusClaimed,
  };
}

export async function fetchHabitsByAddress(address: string): Promise<Habit[]> {
  const userHabits = await readThroughCache(
    cacheKeys.userHabits(address),
    () => getUserHabits(address, stacksNetwork, networkConfig.contract),
    {
      ttlMs: POLLING_INTERVAL_MS,
    },
  );
  const habitIds = userHabits.habitIds;

  if (!habitIds.length) {
    return [];
  }

  const habits = await Promise.all(
    habitIds.map(async (habitId) => {
      const habit = await readThroughCache(
        cacheKeys.habit(habitId),
        () => getHabit(habitId, stacksNetwork, networkConfig.contract),
        {
          ttlMs: POLLING_INTERVAL_MS,
        },
      );
      if (!habit) {
        return null;
      }

      return toMobileHabit(habitId, habit);
    }),
  );

  return habits
    .filter((habit): habit is Habit => habit !== null)
    .sort((a, b) => b.habitId - a.habitId);
}

export async function fetchPoolBalance(): Promise<PoolBalance> {
  const [microStx, estimatedBonusShareMicroStx, unclaimedCompletedHabits] = await Promise.all([
    readThroughCache(
      cacheKeys.poolBalance(),
      () => getPoolBalance(stacksNetwork, networkConfig.contract),
      {
        ttlMs: POLLING_INTERVAL_MS,
      },
    ),
    readThroughCache(
      cacheKeys.estimatedBonusShare(),
      () => readPoolDistributionValue('get-estimated-bonus-share'),
      {
        ttlMs: POLLING_INTERVAL_MS,
      },
    ),
    readThroughCache(
      cacheKeys.unclaimedCompletedHabits(),
      () => readPoolDistributionValue('get-unclaimed-completed-habits'),
      {
        ttlMs: POLLING_INTERVAL_MS,
      },
    ),
  ]);

  return {
    microStx,
    stx: formatSTX(microStx),
    estimatedBonusShareMicroStx,
    estimatedBonusShareStx: formatSTX(estimatedBonusShareMicroStx),
    unclaimedCompletedHabits,
  };
}

export async function fetchUserStats(address: string): Promise<UserStats> {
  const stats = await readThroughCache(
    cacheKeys.userStats(address),
    () => getUserStats(address, stacksNetwork, networkConfig.contract),
    {
      ttlMs: POLLING_INTERVAL_MS,
    },
  );

  return {
    totalHabits: stats.totalHabits,
    habitIds: stats.habitIds,
  };
}
