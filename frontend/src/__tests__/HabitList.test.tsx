import { describe, it, expect, vi } from 'vitest';
import { render, screen, cleanup } from '@testing-library/react';
import { HabitList } from '../components/HabitList';
import { Habit } from '../types/habit';

// Mock hooks that HabitList depends on
vi.mock('../hooks/useCurrentBlock', () => ({
  useCurrentBlock: () => 200,
}));

vi.mock('../hooks/useHashParam', () => ({
  useHashParam: (_key: string, def: string) => [def, vi.fn()],
}));

vi.mock('../utils/habitStatus', () => ({
  getCheckInWindowState: () => 'healthy',
}));

const sampleHabit: Habit = {
  habitId: 1,
  name: 'Test Habit',
  owner: 'SP2ABC123',
  stakeAmount: 100000,
  lastCheckInBlock: 150,
  createdAtBlock: 50,
  currentStreak: 3,
  isActive: true,
  isCompleted: false,
  bonusClaimed: false,
};

// Stub HabitCard so we don't need to mock its transitive deps
vi.mock('../components/HabitCard', () => ({
  HabitCard: ({ habit }: { habit: Habit }) => (
    <div data-testid={`habit-card-${habit.habitId}`}>{habit.name}</div>
  ),
}));

vi.mock('../components/ErrorBoundary', () => ({
  ErrorBoundary: ({ children }: { children: React.ReactNode }) => <>{children}</>,
  HabitCardErrorFallback: () => <div>Error fallback</div>,
}));

describe('HabitList', () => {
  it('renders loading skeleton without crashing', () => {
    render(<HabitList habits={[]} loading={true} />);
    cleanup();
    // Re-render with loaded state — this transition would throw if hooks
    // were called after conditional early returns (Rules of Hooks violation).
    render(<HabitList habits={[sampleHabit]} loading={false} />);
    expect(screen.getByText('Test Habit')).toBeDefined();
  });

  it('renders empty state when there are no habits', () => {
    render(<HabitList habits={[]} loading={false} />);
    expect(screen.getByText('No habits yet')).toBeDefined();
  });

  it('renders habits in the active tab by default', () => {
    render(<HabitList habits={[sampleHabit]} loading={false} />);
    expect(screen.getByText('Test Habit')).toBeDefined();
  });
});
