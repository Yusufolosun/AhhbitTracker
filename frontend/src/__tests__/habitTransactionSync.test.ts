import { describe, expect, it } from 'vitest';
import { getHabitSyncTargets } from '../hooks/habitTransactionSync';

describe('getHabitSyncTargets', () => {
  it('returns habit and balance sync targets for check-in confirmations', () => {
    expect(getHabitSyncTargets('check-in')).toEqual({
      invalidateHabits: true,
      invalidateUserStats: true,
      invalidatePoolBalance: false,
      refreshBalance: true,
    });
  });

  it('returns pool sync targets for withdrawal confirmations', () => {
    expect(getHabitSyncTargets('withdraw-stake')).toEqual({
      invalidateHabits: true,
      invalidateUserStats: true,
      invalidatePoolBalance: true,
      refreshBalance: true,
    });
  });

  it('returns null for unrelated transactions', () => {
    expect(getHabitSyncTargets('transfer')).toBeNull();
  });
});