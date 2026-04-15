import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { renderHook, waitFor } from '@testing-library/react';
import type { ReactNode } from 'react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import type { Habit } from '../types/habit';
import { useHabits } from '../hooks/useHabits';

const mockRefreshBalance = vi.fn();
const mockAddTransaction = vi.fn();

const mockTransactions = [
  {
    txId: 'tx-confirmed-1',
    functionName: 'check-in',
    status: 'confirmed' as const,
    timestamp: Date.now(),
    updatedAt: Date.now(),
  },
];

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
    transactions: mockTransactions,
  }),
}));

vi.mock('../services/contractService', () => ({
  contractService: {
    readUserHabits: vi.fn().mockResolvedValue([1]),
    readHabit: vi.fn().mockResolvedValue({
      owner: 'SP2ABC123',
      name: 'Morning Exercise',
      stakeAmount: 1_000_000,
      currentStreak: 6,
      lastCheckInBlock: 120,
      createdAtBlock: 80,
      isActive: true,
      isCompleted: false,
      bonusClaimed: false,
    } satisfies Omit<Habit, 'habitId'>),
    readUserStats: vi.fn().mockResolvedValue({ totalHabits: 1, habitIds: [1] }),
    readPoolBalance: vi.fn().mockResolvedValue(0),
    readEstimatedBonusShare: vi.fn().mockResolvedValue(0),
    readUnclaimedCompletedHabits: vi.fn().mockResolvedValue(0),
    createHabit: vi.fn(),
    checkIn: vi.fn(),
    withdrawStake: vi.fn(),
    claimBonus: vi.fn(),
    slashHabit: vi.fn(),
  },
}));

describe('useHabits confirmed transaction sync', () => {
  beforeEach(() => {
    mockRefreshBalance.mockClear();
    mockAddTransaction.mockClear();
  });

  it('invalidates blockchain-derived habit data when a check-in confirms', async () => {
    const queryClient = new QueryClient({
      defaultOptions: {
        queries: {
          retry: false,
        },
      },
    });
    const invalidateQueriesSpy = vi.spyOn(queryClient, 'invalidateQueries');

    const wrapper = ({ children }: { children: ReactNode }) => (
      <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
    );

    renderHook(() => useHabits(), { wrapper });

    await waitFor(() => {
      expect(invalidateQueriesSpy).toHaveBeenCalledWith({ queryKey: ['habits', 'SP2ABC123'] });
    });

    expect(invalidateQueriesSpy).toHaveBeenCalledWith({ queryKey: ['userStats', 'SP2ABC123'] });
    expect(mockRefreshBalance).toHaveBeenCalledTimes(1);
  });
});