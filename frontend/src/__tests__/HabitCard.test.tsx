import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import { HabitCard } from '../components/HabitCard';
import { Habit } from '../types/habit';

const mockHabit: Habit = {
  id: 1,
  name: 'Morning Exercise',
  owner: 'SP2ABC123',
  stakeAmount: 1000000,
  createdAt: Date.now(),
  lastCheckIn: Date.now() - 86400000,
  currentStreak: 5,
  longestStreak: 10,
  totalCheckIns: 25,
  isActive: true,
};

describe('HabitCard', () => {
  it('renders habit name', () => {
    render(<HabitCard habit={mockHabit} onCheckIn={vi.fn()} />);
    expect(screen.getByText('Morning Exercise')).toBeInTheDocument();
  });

  it('displays current streak', () => {
    render(<HabitCard habit={mockHabit} onCheckIn={vi.fn()} />);
    expect(screen.getByText(/5/)).toBeInTheDocument();
  });
});
