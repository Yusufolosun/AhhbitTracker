import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { HabitCard } from '../components/HabitCard';
import { ToastProvider } from '../context/ToastContext';
import { Habit } from '../types/habit';

// Mock the useHabits hook used by HabitCard
vi.mock('../hooks/useHabits', () => ({
  useHabits: () => ({
    checkIn: vi.fn(),
    withdrawStake: vi.fn(),
    claimBonus: vi.fn(),
    poolBalance: 50_000_000,
    pendingCheckIns: new Set<number>(),
    pendingWithdrawals: new Set<number>(),
    pendingClaims: new Set<number>(),
    isCheckingIn: false,
    isWithdrawing: false,
    isClaiming: false,
  }),
}));

// Mock useCurrentBlock so it returns a deterministic value
vi.mock('../hooks/useCurrentBlock', () => ({
  useCurrentBlock: () => 200,
}));

// Mock formatSTX so bonus values are predictable in assertions
vi.mock('../utils/formatting', () => ({
  formatSTX: (v: number) => (v / 1_000_000).toFixed(2),
  blocksAgo: () => '10 blocks ago',
  blocksToTime: () => '~2h',
}));

const mockHabit: Habit = {
  habitId: 1,
  name: 'Morning Exercise',
  owner: 'SP2ABC123',
  stakeAmount: 1000000,
  lastCheckInBlock: 100,
  createdAtBlock: 50,
  currentStreak: 5,
  isActive: true,
  isCompleted: false,
  bonusClaimed: false,
};

const completedHabit: Habit = {
  ...mockHabit,
  habitId: 2,
  name: 'Read Daily',
  isActive: false,
  isCompleted: true,
  currentStreak: 10,
};

describe('HabitCard', () => {
  it('renders habit name', () => {
    render(<ToastProvider><HabitCard habit={mockHabit} /></ToastProvider>);
    expect(screen.getByText('Morning Exercise')).toBeDefined();
  });

  it('displays current streak', () => {
    render(<ToastProvider><HabitCard habit={mockHabit} /></ToastProvider>);
    expect(screen.getByText('5')).toBeDefined();
  });

  it('shows active status', () => {
    render(<ToastProvider><HabitCard habit={mockHabit} /></ToastProvider>);
    expect(screen.getByText('Active')).toBeDefined();
  });

  it('displays estimated bonus in claim dialog', () => {
    render(<ToastProvider><HabitCard habit={completedHabit} /></ToastProvider>);
    fireEvent.click(screen.getByText('Claim Bonus'));
    // poolBalance is 50_000_000 → 1% = 500_000 microSTX → formatSTX = "0.50"
    expect(screen.getByText('Est. Bonus')).toBeDefined();
    expect(screen.getByText('0.50 STX')).toBeDefined();
  });

  it('shows estimate disclaimer in claim dialog', () => {
    render(<ToastProvider><HabitCard habit={completedHabit} /></ToastProvider>);
    fireEvent.click(screen.getByText('Claim Bonus'));
    expect(screen.getByText(/actual amount may differ/i)).toBeDefined();
  });

  it('hides claim button when bonus already claimed', () => {
    const claimed = { ...completedHabit, bonusClaimed: true };
    render(<ToastProvider><HabitCard habit={claimed} /></ToastProvider>);
    expect(screen.queryByText('Claim Bonus')).toBeNull();
  });

  it('withdraw dialog shows stake amount without bonus info', () => {
    const withdrawable = { ...mockHabit, currentStreak: 7 };
    render(<ToastProvider><HabitCard habit={withdrawable} /></ToastProvider>);
    fireEvent.click(screen.getByText('Withdraw Stake'));
    // "Stake" and "1.00 STX" appear both in the card stats and in the dialog
    const stakeValues = screen.getAllByText('1.00 STX');
    expect(stakeValues.length).toBe(2);
    expect(screen.queryByText('Est. Bonus')).toBeNull();
  });
});
