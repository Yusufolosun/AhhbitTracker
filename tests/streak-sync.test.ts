import { describe, expect, it } from 'vitest';
import {
  canWithdrawHabit,
  describeWithdrawHabitStatus,
} from '../scripts/shared/streak-sync';

describe('streak sync helpers', () => {
  it('marks active habits with 7+ streak as withdrawable', () => {
    expect(
      canWithdrawHabit({
        isActive: true,
        isCompleted: false,
        currentStreak: 7,
      }),
    ).toBe(true);

    expect(
      canWithdrawHabit({
        isActive: true,
        isCompleted: false,
        currentStreak: 12,
      }),
    ).toBe(true);
  });

  it('rejects inactive, completed, and low-streak habits', () => {
    expect(
      canWithdrawHabit({
        isActive: false,
        isCompleted: false,
        currentStreak: 9,
      }),
    ).toBe(false);

    expect(
      canWithdrawHabit({
        isActive: true,
        isCompleted: true,
        currentStreak: 9,
      }),
    ).toBe(false);

    expect(
      canWithdrawHabit({
        isActive: true,
        isCompleted: false,
        currentStreak: 6,
      }),
    ).toBe(false);
  });

  it('describes on-chain withdrawal readiness', () => {
    expect(
      describeWithdrawHabitStatus({
        isActive: true,
        isCompleted: false,
        currentStreak: 7,
      }),
    ).toBe('withdrawable');

    expect(
      describeWithdrawHabitStatus({
        isActive: true,
        isCompleted: false,
        currentStreak: 4,
      }),
    ).toBe('needs 3 more streak days');

    expect(
      describeWithdrawHabitStatus({
        isActive: false,
        isCompleted: true,
        currentStreak: 9,
      }),
    ).toBe('completed on-chain');
  });
});