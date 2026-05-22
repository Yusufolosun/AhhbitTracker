import { describe, it, expect, vi } from 'vitest';
import { render as originalRender, screen } from '@testing-library/react';
import { Dashboard } from '../components/Dashboard';
import { Habit } from '../types/habit';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ToastProvider } from '../context/ToastContext';
import { TransactionProvider } from '../context/TransactionContext';
import React from 'react';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: { retry: false },
  },
});

const TestWrapper = ({ children }: { children: React.ReactNode }) => (
  <QueryClientProvider client={queryClient}>
    <TransactionProvider>
      <ToastProvider>{children}</ToastProvider>
    </TransactionProvider>
  </QueryClientProvider>
);

const render = (ui: React.ReactElement) => originalRender(ui, { wrapper: TestWrapper });

// Minimal mock for formatSTX used inside Dashboard
vi.mock('../utils/formatting', () => ({
  formatSTX: (v: number) => (v / 1000000).toFixed(2),
}));

// Mock useCurrentBlock so Dashboard can derive window state
vi.mock('../hooks/useCurrentBlock', () => ({
  useCurrentBlock: () => 200,
}));

// Mock useHabits to supply userStats needed for referral panel
vi.mock('../hooks/useHabits', () => ({
  useHabits: () => ({
    habits: [],
    isLoadingHabits: false,
    userStats: {
      successfulReferrals: 0,
    },
  }),
}));

// Mock useWallet to supply isDemoMode and walletState
vi.mock('../context/WalletContext', () => ({
  useWallet: () => ({
    isDemoMode: false,
    walletState: {
      isConnected: true,
      address: 'SP2ABC123',
      balance: 10_000_000,
    },
    refreshBalance: vi.fn(),
  }),
}));

const activeHabit: Habit = {
  habitId: 1,
  name: 'Morning Run',
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
  habitId: 2,
  name: 'Read 30 min',
  owner: 'SP2ABC123',
  stakeAmount: 500000,
  lastCheckInBlock: 200,
  createdAtBlock: 50,
  currentStreak: 10,
  isActive: false,
  isCompleted: true,
  bonusClaimed: false,
};

// lastCheckInBlock 0, currentBlock 200 → 200 blocks elapsed > 192 → expired
const expiredHabit: Habit = {
  habitId: 3,
  name: 'Meditate',
  owner: 'SP2ABC123',
  stakeAmount: 2000000,
  lastCheckInBlock: 0,
  createdAtBlock: 5,
  currentStreak: 3,
  isActive: true,
  isCompleted: false,
  bonusClaimed: false,
};

describe('Dashboard', () => {
  it('shows empty state when there are no habits', () => {
    render(<Dashboard habits={[]} />);
    expect(screen.getByText('No habits yet')).toBeDefined();
    expect(screen.getByText('Create Your First Habit')).toBeDefined();
  });

  it('renders stats cards when habits exist', () => {
    render(<Dashboard habits={[activeHabit]} />);
    expect(screen.getByText('Total Habits')).toBeDefined();
    expect(screen.getByText('Active Habits')).toBeDefined();
    expect(screen.getByText('Total Staked')).toBeDefined();
  });

  it('shows completed banner when a habit is completed', () => {
    render(<Dashboard habits={[completedHabit]} />);
    expect(screen.getByText(/completed 1 habit/i)).toBeDefined();
  });

  it('does not show completed banner when no completed habits', () => {
    render(<Dashboard habits={[activeHabit]} />);
    expect(screen.queryByText(/completed/i)).toBeNull();
  });

  it('excludes expired habits from active count', () => {
    render(<Dashboard habits={[activeHabit, expiredHabit]} />);
    // 2 habits are isActive on-chain, but 1 has an expired window
    const activeCard = screen.getByText('Active Habits').closest('.card');
    expect(activeCard?.textContent).toContain('1');
    expect(activeCard?.textContent).not.toContain('2');
  });

  it('shows expired count in active habits subtitle', () => {
    render(<Dashboard habits={[activeHabit, expiredHabit]} />);
    expect(screen.getByText('1 expired')).toBeDefined();
  });

  it('shows expired alert with forfeiture warning', () => {
    render(<Dashboard habits={[activeHabit, expiredHabit]} />);
    expect(screen.getByText(/at risk of penalty/i)).toBeDefined();
    expect(screen.getByText(/no longer counted as active/i)).toBeDefined();
  });

  it('updates staked and streak subtitles when expired habits exist', () => {
    render(<Dashboard habits={[activeHabit, expiredHabit]} />);
    const excludeLabels = screen.getAllByText('Excludes expired habits');
    expect(excludeLabels.length).toBe(2);
  });

  it('shows default subtitles when no expired habits', () => {
    render(<Dashboard habits={[activeHabit]} />);
    expect(screen.getByText('In active habits')).toBeDefined();
    expect(screen.getByText('Across active habits')).toBeDefined();
  });
});
