import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { HabitCard } from '../components/HabitCard';
import { ToastProvider } from '../context/ToastContext';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { Habit } from '../types/habit';
import React from 'react';

// Mock the useHabits hook used by HabitCard
vi.mock('../hooks/useHabits', () => ({
  useHabits: () => ({
    checkIn: vi.fn(),
    withdrawStake: vi.fn(),
    claimBonus: vi.fn(),
    slashHabit: vi.fn(),
    poolBalance: 50_000_000,
    estimatedBonusShare: 500_000,
    unclaimedCompletedHabits: 4,
    pendingCheckIns: new Set<number>(),
    pendingWithdrawals: new Set<number>(),
    pendingClaims: new Set<number>(),
    pendingSlashes: new Set<number>(),
    isCheckingIn: false,
    isWithdrawing: false,
    isClaiming: false,
    isSlashing: false,
  }),
}));

// Mock useWallet hook to provide wallet state directly
vi.mock('../context/WalletContext', () => ({
  useWallet: () => ({
    walletState: {
      isConnected: true,
      address: 'SP2ABC123',
      balance: 10_000_000,
    },
    connect: vi.fn(),
    disconnect: vi.fn(),
    refreshBalance: vi.fn(),
    isLoading: false,
    isBalanceLoading: false,
  }),
}));

// Mock useCurrentBlock so it returns a deterministic value
let mockCurrentBlock = 200;
vi.mock('../hooks/useCurrentBlock', () => ({
  useCurrentBlock: () => mockCurrentBlock,
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

// Create a test wrapper with required providers
const queryClient = new QueryClient({
  defaultOptions: {
    queries: { retry: false },
  },
});

const TestWrapper = ({ children }: { children: React.ReactNode }) => (
  <QueryClientProvider client={queryClient}>
    <ToastProvider>{children}</ToastProvider>
  </QueryClientProvider>
);

describe('HabitCard', () => {
  beforeEach(() => {
    mockCurrentBlock = 200;
  });

  it('renders habit name', () => {
    render(<HabitCard habit={mockHabit} />, { wrapper: TestWrapper });
    expect(screen.getByText('Morning Exercise')).toBeDefined();
  });

  it('displays current streak', () => {
    render(<HabitCard habit={mockHabit} />, { wrapper: TestWrapper });
    expect(screen.getByText('5')).toBeDefined();
  });

  it('shows cooldown status before check-in opens', () => {
    render(<HabitCard habit={mockHabit} />, { wrapper: TestWrapper });
    expect(screen.getByText('Cooldown')).toBeDefined();
    const button = screen.getByRole('button', { name: 'Check In Not Ready' });
    expect(button).toHaveProperty('disabled', true);
  });

  it('shows active status when check-in is available', () => {
    mockCurrentBlock = 230;
    render(<HabitCard habit={mockHabit} />, { wrapper: TestWrapper });
    expect(screen.getByText('Active')).toBeDefined();
    const button = screen.getByRole('button', { name: 'Check In' });
    expect(button).toHaveProperty('disabled', false);
  });

  it('displays estimated bonus in claim dialog', () => {
    render(<HabitCard habit={completedHabit} />, { wrapper: TestWrapper });
    fireEvent.click(screen.getByText('Claim Bonus'));
    // estimatedBonusShare is 500_000 microSTX → formatSTX = "0.50"
    expect(screen.getByText('Est. Bonus')).toBeDefined();
    expect(screen.getByText('0.50 STX')).toBeDefined();
  });

  it('shows estimate disclaimer in claim dialog', () => {
    render(<HabitCard habit={completedHabit} />, { wrapper: TestWrapper });
    fireEvent.click(screen.getByText('Claim Bonus'));
    expect(screen.getByText(/actual amount may differ/i)).toBeDefined();
  });

  it('hides claim button when bonus already claimed', () => {
    const claimed = { ...completedHabit, bonusClaimed: true };
    render(<HabitCard habit={claimed} />, { wrapper: TestWrapper });
    expect(screen.queryByText('Claim Bonus')).toBeNull();
  });

  it('withdraw dialog shows stake amount without bonus info', () => {
    const withdrawable = { ...mockHabit, currentStreak: 7 };
    render(<HabitCard habit={withdrawable} />, { wrapper: TestWrapper });
    fireEvent.click(screen.getByText('Withdraw Stake'));
    // "Stake" and "1.00 STX" appear both in the card stats and in the dialog
    const stakeValues = screen.getAllByText('1.00 STX');
    expect(stakeValues.length).toBe(2);
    expect(screen.queryByText('Est. Bonus')).toBeNull();
  });
});
