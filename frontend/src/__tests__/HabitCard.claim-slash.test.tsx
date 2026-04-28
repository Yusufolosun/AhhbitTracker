import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { HabitCard } from '../components/HabitCard';
import type { Habit } from '../types/habit';

const claimBonus = vi.fn().mockResolvedValue('tx-claim');
const slashHabit = vi.fn().mockResolvedValue('tx-slash');
const showToast = vi.fn();

let walletAddress = 'SP2ABC123';

vi.mock('../analytics', () => ({
  trackEvent: vi.fn(),
}));

vi.mock('../hooks/useHabits', () => ({
  useHabits: () => ({
    checkIn: vi.fn(),
    withdrawStake: vi.fn(),
    claimBonus,
    slashHabit,
    estimatedBonusShare: 500_000,
    unclaimedCompletedHabits: 1,
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
      address: walletAddress,
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

const completedHabit: Habit = {
  habitId: 3,
  name: 'Claim Bonus',
  owner: 'SP2ABC123',
  stakeAmount: 1_000_000,
  lastCheckInBlock: 120,
  createdAtBlock: 50,
  currentStreak: 9,
  isActive: false,
  isCompleted: true,
  bonusClaimed: false,
};

const expiredHabit: Habit = {
  habitId: 4,
  name: 'Expired Habit',
  owner: 'SP2ABC123',
  stakeAmount: 500_000,
  lastCheckInBlock: 10,
  createdAtBlock: 5,
  currentStreak: 2,
  isActive: true,
  isCompleted: false,
  bonusClaimed: false,
};

describe('HabitCard claim and slash flows', () => {
  beforeEach(() => {
    claimBonus.mockClear();
    slashHabit.mockClear();
    showToast.mockClear();
    walletAddress = 'SP2ABC123';
  });

  it('confirms and submits a bonus claim', async () => {
    render(<HabitCard habit={completedHabit} />);

    fireEvent.click(screen.getByRole('button', { name: 'Claim Bonus' }));
    fireEvent.click(screen.getByRole('button', { name: 'Claim' }));

    await waitFor(() => {
      expect(claimBonus).toHaveBeenCalledWith(completedHabit.habitId);
    });

    expect(showToast).toHaveBeenCalledWith(
      'Bonus claim signed! It will arrive once confirmed on-chain.',
      'success',
    );
  });

  it('confirms and submits a slash when viewing another wallet', async () => {
    walletAddress = 'SP9DIFFERENT';

    render(<HabitCard habit={expiredHabit} />);

    fireEvent.click(screen.getByText('Finalize Expired Habit'));
    fireEvent.click(screen.getByRole('button', { name: 'Finalize' }));

    await waitFor(() => {
      expect(slashHabit).toHaveBeenCalledWith(expiredHabit.habitId);
    });

    expect(showToast).toHaveBeenCalledWith(
      'Habit finalized! Stake will be moved to the pool once confirmed on-chain.',
      'success',
    );
  });
});
