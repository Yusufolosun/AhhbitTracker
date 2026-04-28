import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import { HabitCard } from '../components/HabitCard';
import type { Habit } from '../types/habit';

const withdrawStake = vi.fn().mockResolvedValue('tx-withdraw');
const showToast = vi.fn();

vi.mock('../analytics', () => ({
  trackEvent: vi.fn(),
}));

vi.mock('../hooks/useHabits', () => ({
  useHabits: () => ({
    checkIn: vi.fn(),
    withdrawStake,
    claimBonus: vi.fn(),
    slashHabit: vi.fn(),
    estimatedBonusShare: 0,
    unclaimedCompletedHabits: 0,
    pendingCheckIns: new Set<number>(),
    pendingWithdrawals: new Set<number>(),
    pendingClaims: new Set<number>(),
    pendingSlashes: new Set<number>(),
  }),
}));

vi.mock('../context/ToastContext', () => ({
  useToast: () => ({
    showToast,
  }),
}));

vi.mock('../context/WalletContext', () => ({
  useWallet: () => ({
    walletState: {
      isConnected: true,
      address: 'SP2ABC123',
      balance: 10_000_000,
    },
  }),
}));

vi.mock('../hooks/useCurrentBlock', () => ({
  useCurrentBlock: () => 200,
}));

vi.mock('../utils/formatting', () => ({
  formatSTX: (v: number) => (v / 1_000_000).toFixed(2),
  blocksAgo: () => '10 blocks ago',
  blocksToTime: () => '~2h',
}));

const habit: Habit = {
  habitId: 7,
  name: 'Withdraw Ready',
  owner: 'SP2ABC123',
  stakeAmount: 1_000_000,
  lastCheckInBlock: 70,
  createdAtBlock: 50,
  currentStreak: 7,
  isActive: true,
  isCompleted: false,
  bonusClaimed: false,
};

describe('HabitCard withdraw flow', () => {
  it('confirms and submits a withdrawal', async () => {
    render(<HabitCard habit={habit} />);

    fireEvent.click(screen.getByText('Withdraw Stake'));
    fireEvent.click(screen.getByRole('button', { name: 'Withdraw' }));

    await waitFor(() => {
      expect(withdrawStake).toHaveBeenCalledWith({
        habitId: habit.habitId,
        stakeAmount: habit.stakeAmount,
      });
    });

    expect(showToast).toHaveBeenCalledWith(
      'Withdrawal signed! Your STX will return once confirmed on-chain.',
      'success',
    );
  });
});
