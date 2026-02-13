import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import { HabitCard } from '../components/HabitCard';
import { Habit } from '../types/habit';

const mockHabit: Habit = {
  habitId: 1,
  name: 'Morning Exercise',
  owner: 'SP2ABC123',
  stakeAmount: 1000000,
  lastCheckInBlock: 100,
  currentStreak: 5,
  isActive: true,
  isCompleted: false,
};

describe('HabitCard', () => {
  it('renders habit name', () => {
    render(<HabitCard habit={mockHabit} onUpdate={vi.fn()} />);
    expect(screen.getByText('Morning Exercise')).toBeInTheDocument();
  });

  it('displays current streak', () => {
    render(<HabitCard habit={mockHabit} onUpdate={vi.fn()} />);
    expect(screen.getByText('5')).toBeInTheDocument();
  });

  it('shows active status', () => {
    render(<HabitCard habit={mockHabit} onUpdate={vi.fn()} />);
    expect(screen.getByText('🟢 Active')).toBeInTheDocument();
  });
});

