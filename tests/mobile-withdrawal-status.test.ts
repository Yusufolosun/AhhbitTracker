import { describe, expect, it } from 'vitest';
import {
  canWithdrawHabit,
  describeWithdrawHabitStatus,
  getMobileWithdrawStatus,
} from '../mobile/src/shared/utils/withdrawal';
import type { Habit } from '../mobile/src/core/types/habit';

function makeHabit(overrides: Partial<Habit> = {}): Habit {
  return {
    habitId: 1,
    owner: 'SP1234567890ABCDEFGHIJKMNPQRSTUVWX',
    name: 'Hydrate daily',
    stakeAmount: 100_000,
    currentStreak: 0,
    lastCheckInBlock: 0,
    createdAtBlock: 0,
    isActive: true,
    isCompleted: false,
    bonusClaimed: false,
    ...overrides,
  };
}

describe('mobile withdrawal readiness helpers', () => {
  it('marks active habits with 7+ day streak as withdrawable', () => {
    const habit = makeHabit({ currentStreak: 7, isActive: true, isCompleted: false });

    expect(canWithdrawHabit(habit)).toBe(true);
    expect(getMobileWithdrawStatus(habit)).toBe('withdrawable');
    expect(describeWithdrawHabitStatus(habit)).toBe('Ready to withdraw');
  });

  it('blocks habits with insufficient streak and explains remaining days', () => {
    const habit = makeHabit({ currentStreak: 5, isActive: true, isCompleted: false });

    expect(canWithdrawHabit(habit)).toBe(false);
    expect(getMobileWithdrawStatus(habit)).toBe('insufficient-streak');
    expect(describeWithdrawHabitStatus(habit)).toBe('Needs 2 more streak days');
  });

  it('prioritizes completed status over inactive status for clearer feedback', () => {
    const habit = makeHabit({ currentStreak: 9, isActive: false, isCompleted: true });

    expect(canWithdrawHabit(habit)).toBe(false);
    expect(getMobileWithdrawStatus(habit)).toBe('completed-on-chain');
    expect(describeWithdrawHabitStatus(habit)).toBe('Already withdrawn on-chain');
  });

  it('reports inactive habits when not completed', () => {
    const habit = makeHabit({ currentStreak: 9, isActive: false, isCompleted: false });

    expect(canWithdrawHabit(habit)).toBe(false);
    expect(getMobileWithdrawStatus(habit)).toBe('inactive-on-chain');
    expect(describeWithdrawHabitStatus(habit)).toBe('Habit is inactive on-chain');
  });
});
