import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import { HabitCard } from '../components/HabitCard';
import { Habit } from '../types/habit';

// Mock the useHabits hook used by HabitCard
vi.mock('../hooks/useHabits', () => ({
  useHabits: () => ({
    checkIn: vi.fn(),
    withdrawStake: vi.fn(),
    claimBonus: vi.fn(),
    isCheckingIn: false,
    isWithdrawing: false,
    isClaiming: false,
  }),
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
};

describe('HabitCard', () => {
  it('renders habit name', () => {
    render(<HabitCard habit={mockHabit} />);
    expect(screen.getByText('Morning Exercise')).toBeDefined();
  });

  it('displays current streak', () => {
    render(<HabitCard habit={mockHabit} />);
    expect(screen.getByText('5')).toBeDefined();
  });

  it('shows active status', () => {
    render(<HabitCard habit={mockHabit} />);
    expect(screen.getByText('🟢 Active')).toBeDefined();
  });
});
