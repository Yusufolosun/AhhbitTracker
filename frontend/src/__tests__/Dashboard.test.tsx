import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import { Dashboard } from '../components/Dashboard';
import { Habit } from '../types/habit';

// Minimal mock for formatSTX used inside Dashboard
vi.mock('../utils/formatting', () => ({
  formatSTX: (v: number) => (v / 1000000).toFixed(2),
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
});
