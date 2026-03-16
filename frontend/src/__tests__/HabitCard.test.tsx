import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
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
    isCheckingIn: false,
    isWithdrawing: false,
    isClaiming: false,
  }),
}));

// Mock useCurrentBlock so it returns a deterministic value
vi.mock('../hooks/useCurrentBlock', () => ({
  useCurrentBlock: () => 200,
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
});
