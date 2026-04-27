import { describe, expect, it } from 'vitest';
import {
  canSubmitMobileDailyCheckIn,
  getMobileCheckInWindowState,
} from '../mobile/src/shared/utils/checkInWindow';
import type { Habit } from '../mobile/src/core/types/habit';

function createHabit(overrides: Partial<Habit> = {}): Habit {
  return {
    habitId: 7,
    owner: 'SP1N3809W9CBWWX04KN3TCQHP8A9GN520BD4JMP8Z',
    name: 'Evening walk',
    stakeAmount: 100_000,
    currentStreak: 2,
    lastCheckInBlock: 100,
    createdAtBlock: 80,
    isActive: true,
    isCompleted: false,
    bonusClaimed: false,
    ...overrides,
  };
}

describe('mobile check-in window helpers', () => {
  it('returns unknown for inactive habits or missing block height', () => {
    expect(getMobileCheckInWindowState(createHabit({ isActive: false }), 150)).toBe('unknown');
    expect(getMobileCheckInWindowState(createHabit(), null)).toBe('unknown');
  });

  it('returns cooldown before minimum check-in interval', () => {
    expect(getMobileCheckInWindowState(createHabit(), 219)).toBe('cooldown');
  });

  it('returns available inside normal check-in range', () => {
    expect(getMobileCheckInWindowState(createHabit(), 220)).toBe('available');
    expect(getMobileCheckInWindowState(createHabit(), 232)).toBe('available');
  });

  it('returns urgent in the final check-in window and expired after deadline', () => {
    expect(getMobileCheckInWindowState(createHabit(), 233)).toBe('urgent');
    expect(getMobileCheckInWindowState(createHabit(), 244)).toBe('urgent');
    expect(getMobileCheckInWindowState(createHabit(), 245)).toBe('expired');
  });

  it('allows check-ins only when available or urgent', () => {
    expect(canSubmitMobileDailyCheckIn(createHabit(), 220)).toBe(true);
    expect(canSubmitMobileDailyCheckIn(createHabit(), 240)).toBe(true);
    expect(canSubmitMobileDailyCheckIn(createHabit(), 219)).toBe(false);
    expect(canSubmitMobileDailyCheckIn(createHabit(), 246)).toBe(false);
  });
});
