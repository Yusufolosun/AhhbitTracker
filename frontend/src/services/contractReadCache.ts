import { CACHE_TIME, POOL_CACHE_TIME } from '../utils/constants';
import { invalidateReadCache, readThroughCache } from './readCache';

const CONTRACT_READ_PREFIX = 'contract-read:';

export const contractReadCacheKeys = {
  habit: (habitId: number) => `${CONTRACT_READ_PREFIX}habit:${habitId}`,
  userHabits: (address: string) => `${CONTRACT_READ_PREFIX}user-habits:${address}`,
  userStats: (address: string) => `${CONTRACT_READ_PREFIX}user-stats:${address}`,
  poolBalance: () => `${CONTRACT_READ_PREFIX}pool-balance`,
};

export async function cacheHabitRead<T>(habitId: number, fetcher: () => Promise<T>): Promise<T> {
  return readThroughCache(contractReadCacheKeys.habit(habitId), fetcher, {
    ttlMs: CACHE_TIME,
  });
}

export async function cacheUserHabitsRead<T>(address: string, fetcher: () => Promise<T>): Promise<T> {
  return readThroughCache(contractReadCacheKeys.userHabits(address), fetcher, {
    ttlMs: CACHE_TIME,
  });
}

export async function cacheUserStatsRead<T>(address: string, fetcher: () => Promise<T>): Promise<T> {
  return readThroughCache(contractReadCacheKeys.userStats(address), fetcher, {
    ttlMs: CACHE_TIME,
  });
}

export async function cachePoolBalanceRead<T>(fetcher: () => Promise<T>): Promise<T> {
  return readThroughCache(contractReadCacheKeys.poolBalance(), fetcher, {
    ttlMs: POOL_CACHE_TIME,
  });
}

export function clearAllContractReadCache(): void {
  invalidateReadCache(CONTRACT_READ_PREFIX);
}

export function clearHabitReadCache(habitId: number): void {
  invalidateReadCache(contractReadCacheKeys.habit(habitId));
}

export function clearUserReadCache(address: string): void {
  invalidateReadCache(contractReadCacheKeys.userHabits(address));
  invalidateReadCache(contractReadCacheKeys.userStats(address));
}

export function clearPoolReadCache(): void {
  invalidateReadCache(contractReadCacheKeys.poolBalance());
}
