import { renderHook, act } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { useHabits } from '../hooks/useHabits';
import { createQueryWrapper, createTestQueryClient } from './testProviders';

const mockRefreshBalance = vi.fn();
const mockAddTransaction = vi.fn();
const { checkIn } = vi.hoisted(() => ({ checkIn: vi.fn() }));

vi.mock('../analytics', () => ({
  trackEvent: vi.fn(),
}));

vi.mock('../context/WalletContext', () => ({
  useWallet: () => ({
    walletState: {
      isConnected: true,
      address: 'SP2ABC123',
      balance: 10_000_000,
    },
    refreshBalance: mockRefreshBalance,
  }),
}));

vi.mock('../context/TransactionContext', () => ({
  useTransactions: () => ({
    addTransaction: mockAddTransaction,
    transactions: [],
  }),
}));

vi.mock('../services/contractService', () => ({
  contractService: {
    readUserHabits: vi.fn().mockResolvedValue([]),
    readHabit: vi.fn(),
    readUserStats: vi.fn().mockResolvedValue({ totalHabits: 0, habitIds: [] }),
    readPoolBalance: vi.fn().mockResolvedValue(0),
    readEstimatedBonusShare: vi.fn().mockResolvedValue(0),
    readUnclaimedCompletedHabits: vi.fn().mockResolvedValue(0),
    invalidateAddressReadCache: vi.fn(),
    invalidatePoolReadCache: vi.fn(),
    createHabit: vi.fn(),
    checkIn,
    withdrawStake: vi.fn(),
    claimBonus: vi.fn(),
    slashHabit: vi.fn(),
  },
}));

describe('useHabits runDailyCheckIn', () => {
  beforeEach(() => {
    checkIn.mockReset();
    mockAddTransaction.mockReset();
    mockRefreshBalance.mockReset();
  });

  it('stops queueing when a user cancels a check-in', async () => {
    checkIn
      .mockResolvedValueOnce('tx-1')
      .mockRejectedValueOnce(new Error('Transaction cancelled'))
      .mockResolvedValueOnce('tx-2');

    const queryClient = createTestQueryClient();
    const wrapper = createQueryWrapper(queryClient);
    const { result } = renderHook(() => useHabits(), { wrapper });

    let response;
    await act(async () => {
      response = await result.current.runDailyCheckIn([1, 2, 3]);
    });

    expect(response?.attempted).toBe(2);
    expect(response?.submitted).toBe(1);
    expect(response?.failed).toBe(1);
    expect(checkIn).toHaveBeenCalledTimes(2);
    expect(mockAddTransaction).toHaveBeenCalledWith('tx-1', 'check-in');
  });
});
