import { beforeAll, beforeEach, describe, expect, it, vi } from 'vitest';

const invalidateReadCache = vi.fn();
const readThroughCache = vi.fn();

vi.mock('../mobile/src/core/data/readCache', () => ({
  invalidateReadCache,
  readThroughCache,
}));

vi.mock('@yusufolosun/ahhbit-tracker-sdk', () => ({
  getHabit: vi.fn(),
  getPoolBalance: vi.fn(),
  getUserHabits: vi.fn(),
  getUserStats: vi.fn(),
}));

vi.mock('@stacks/transactions', () => ({
  cvToJSON: vi.fn(),
  fetchCallReadOnlyFunction: vi.fn(),
}));

vi.mock('@yusufolosun/stx-utils', () => ({
  formatSTX: (value: number) => `${value / 1_000_000}`,
}));

let invalidateHabitReadCache: (habitId: number) => void;
let invalidateAddressReadCache: (address: string | null | undefined) => void;
let invalidatePoolReadCache: () => void;
let clearContractReadCache: () => void;

beforeAll(async () => {
  ({
    invalidateHabitReadCache,
    invalidateAddressReadCache,
    invalidatePoolReadCache,
    clearContractReadCache,
  } = await import('../mobile/src/core/data/contractService'));
});

beforeEach(() => {
  vi.clearAllMocks();
});

describe('mobile contract service cache invalidation', () => {
  it('invalidates habit cache by habit id', () => {
    invalidateHabitReadCache(55);

    expect(invalidateReadCache).toHaveBeenCalledWith('mobile-contract-read:habit:55');
  });

  it('invalidates address-related caches only when address exists', () => {
    invalidateAddressReadCache('SP123');
    invalidateAddressReadCache(null);
    invalidateAddressReadCache(undefined);

    expect(invalidateReadCache).toHaveBeenCalledWith('mobile-contract-read:user-habits:SP123');
    expect(invalidateReadCache).toHaveBeenCalledWith('mobile-contract-read:user-stats:SP123');
    expect(invalidateReadCache).toHaveBeenCalledTimes(2);
  });

  it('invalidates all pool-distribution cache keys', () => {
    invalidatePoolReadCache();

    expect(invalidateReadCache).toHaveBeenCalledWith('mobile-contract-read:pool-balance');
    expect(invalidateReadCache).toHaveBeenCalledWith('mobile-contract-read:estimated-bonus-share');
    expect(invalidateReadCache).toHaveBeenCalledWith('mobile-contract-read:unclaimed-completed-habits');
  });

  it('clears contract read cache by common prefix', () => {
    clearContractReadCache();

    expect(invalidateReadCache).toHaveBeenCalledWith('mobile-contract-read:');
  });
});
