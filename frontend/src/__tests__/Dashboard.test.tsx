import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import { Dashboard } from '../components/Dashboard';
import { Habit } from '../types/habit';

// Minimal mock for formatSTX used inside Dashboard
vi.mock('../utils/formatting', () => ({
  formatSTX: (v: number) => (v / 1000000).toFixed(2),
}));

// Mock useCurrentBlock so Dashboard can derive window state
vi.mock('../hooks/useCurrentBlock', () => ({
  useCurrentBlock: () => 200,
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

// lastCheckInBlock 10, currentBlock 200 → 190 blocks elapsed > 144 → expired
const expiredHabit: Habit = {
  habitId: 3,
  name: 'Meditate',
  owner: 'SP2ABC123',
  stakeAmount: 2000000,
  lastCheckInBlock: 10,
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
});
