import { describe, expect, it } from 'vitest';
import { getWalletInteractionSyncTargets } from '../mobile/src/features/wallet/transactionSync';

describe('mobile wallet transaction sync targets', () => {
  it('keeps habit queries fresh for create and check-in actions', () => {
    expect(getWalletInteractionSyncTargets('create-habit')).toEqual({
      invalidateHabits: true,
      invalidateUserStats: true,
      invalidatePoolBalance: false,
    });

    expect(getWalletInteractionSyncTargets('check-in')).toEqual({
      invalidateHabits: true,
      invalidateUserStats: true,
      invalidatePoolBalance: false,
    });
  });

  it('refreshes pool state for withdrawal and bonus claims', () => {
    expect(getWalletInteractionSyncTargets('withdraw-stake')).toEqual({
      invalidateHabits: true,
      invalidateUserStats: true,
      invalidatePoolBalance: true,
    });

    expect(getWalletInteractionSyncTargets('claim-bonus')).toEqual({
      invalidateHabits: true,
      invalidateUserStats: true,
      invalidatePoolBalance: true,
    });
  });

  it('falls back to refreshing every habit query when the function is unknown', () => {
    expect(getWalletInteractionSyncTargets(null)).toEqual({
      invalidateHabits: true,
      invalidateUserStats: true,
      invalidatePoolBalance: true,
    });
  });
});