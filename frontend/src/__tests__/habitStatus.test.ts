import { describe, it, expect } from 'vitest';
import {
  getCheckInWindowState,
  getBlocksRemaining,
  getBlocksUntilNextCheckIn,
  isEligibleToWithdraw,
} from '../utils/habitStatus';
import { Habit } from '../types/habit';

function makeHabit(overrides: Partial<Habit> = {}): Habit {
  return {
    habitId: 1,
    name: 'Test Habit',
    owner: 'SP2ABC123',
    stakeAmount: 100000,
    lastCheckInBlock: 1000,
    createdAtBlock: 900,
    currentStreak: 3,
    isActive: true,
    isCompleted: false,
    bonusClaimed: false,
    ...overrides,
  };
}

describe('getCheckInWindowState', () => {
  it('returns unknown when currentBlock is null', () => {
    expect(getCheckInWindowState(makeHabit(), null)).toBe('unknown');
  });

  it('returns unknown for inactive habits', () => {
    const habit = makeHabit({ isActive: false });
    expect(getCheckInWindowState(habit, 1200)).toBe('unknown');
  });

  it('returns just-checked-in when elapsed < 1 block', () => {
    const habit = makeHabit({ lastCheckInBlock: 1000 });
    expect(getCheckInWindowState(habit, 1000)).toBe('just-checked-in');
  });

  it('returns cooldown before the minimum interval is reached', () => {
    const habit = makeHabit({ lastCheckInBlock: 1000 });
    expect(getCheckInWindowState(habit, 1050)).toBe('cooldown');
  });

  it('returns available at exactly 120 blocks elapsed', () => {
    const habit = makeHabit({ lastCheckInBlock: 1000 });
    expect(getCheckInWindowState(habit, 1120)).toBe('available');
  });

  it('returns available when elapsed is between 120 and 132 blocks', () => {
    const habit = makeHabit({ lastCheckInBlock: 1000 });
    expect(getCheckInWindowState(habit, 1130)).toBe('available');
  });

  it('returns urgent when elapsed > 132 but <= 144', () => {
    const habit = makeHabit({ lastCheckInBlock: 1000 });
    expect(getCheckInWindowState(habit, 1133)).toBe('urgent');
  });

  it('returns urgent at exactly 144 blocks elapsed', () => {
    const habit = makeHabit({ lastCheckInBlock: 1000 });
    expect(getCheckInWindowState(habit, 1144)).toBe('urgent');
  });

  it('returns expired when elapsed > 144', () => {
    const habit = makeHabit({ lastCheckInBlock: 1000 });
    expect(getCheckInWindowState(habit, 1145)).toBe('expired');
  });
});

describe('getBlocksRemaining', () => {
  it('returns correct remaining blocks', () => {
    const habit = makeHabit({ lastCheckInBlock: 1000 });
    expect(getBlocksRemaining(habit, 1100)).toBe(44); // 144 - 100
  });

  it('returns 0 when window is expired', () => {
    const habit = makeHabit({ lastCheckInBlock: 1000 });
    expect(getBlocksRemaining(habit, 1200)).toBe(0);
  });

  it('returns full window at block 0 elapsed', () => {
    const habit = makeHabit({ lastCheckInBlock: 1000 });
    expect(getBlocksRemaining(habit, 1000)).toBe(144);
  });
});

describe('getBlocksUntilNextCheckIn', () => {
  it('returns remaining cooldown blocks', () => {
    const habit = makeHabit({ lastCheckInBlock: 1000 });
    expect(getBlocksUntilNextCheckIn(habit, 1100)).toBe(20);
  });

  it('returns 0 once check-in is available', () => {
    const habit = makeHabit({ lastCheckInBlock: 1000 });
    expect(getBlocksUntilNextCheckIn(habit, 1120)).toBe(0);
    expect(getBlocksUntilNextCheckIn(habit, 1140)).toBe(0);
  });
});

describe('isEligibleToWithdraw', () => {
  it('returns true when active with streak >= 7', () => {
    expect(isEligibleToWithdraw(makeHabit({ currentStreak: 7 }))).toBe(true);
    expect(isEligibleToWithdraw(makeHabit({ currentStreak: 10 }))).toBe(true);
  });

  it('returns false when streak < 7', () => {
    expect(isEligibleToWithdraw(makeHabit({ currentStreak: 6 }))).toBe(false);
    expect(isEligibleToWithdraw(makeHabit({ currentStreak: 0 }))).toBe(false);
  });

  it('returns false when not active even with high streak', () => {
    expect(isEligibleToWithdraw(makeHabit({ isActive: false, currentStreak: 10 }))).toBe(false);
  });
});
