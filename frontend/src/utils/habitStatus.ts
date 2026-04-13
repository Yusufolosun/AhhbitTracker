import { Habit } from '../types/habit';
import {
  CHECK_IN_WINDOW,
  MIN_CHECK_IN_INTERVAL,
  MIN_STREAK_FOR_WITHDRAWAL,
} from './constants';

/**
 * Threshold (in blocks) at which we warn the user the valid check-in period
 * is close to expiring.
 *
 * Valid window is [120, 144]. We mark [133, 144] as urgent.
 */
const URGENT_THRESHOLD = 132;

export type CheckInWindowState =
  | 'expired'
  | 'urgent'
  | 'available'
  | 'cooldown'
  | 'just-checked-in'
  | 'unknown';

/**
 * Derive the check-in window state for an active habit.
 * Returns 'unknown' when the current block height hasn't loaded yet.
 */
export function getCheckInWindowState(
  habit: Habit,
  currentBlock: number | null,
): CheckInWindowState {
  if (!habit.isActive) return 'unknown';
  if (currentBlock === null) return 'unknown';

  const blocksElapsed = currentBlock - habit.lastCheckInBlock;

  if (blocksElapsed < 1) return 'just-checked-in';
  if (blocksElapsed > CHECK_IN_WINDOW) return 'expired';
  if (blocksElapsed < MIN_CHECK_IN_INTERVAL) return 'cooldown';
  if (blocksElapsed > URGENT_THRESHOLD) return 'urgent';
  return 'available';
}

/**
 * Number of blocks remaining before the check-in window expires.
 * Returns 0 if already expired.
 */
export function getBlocksRemaining(habit: Habit, currentBlock: number): number {
  const remaining = CHECK_IN_WINDOW - (currentBlock - habit.lastCheckInBlock);
  return Math.max(0, remaining);
}

/**
 * Number of blocks left before the next valid check-in can be submitted.
 * Returns 0 when check-in is already available.
 */
export function getBlocksUntilNextCheckIn(habit: Habit, currentBlock: number): number {
  const wait = MIN_CHECK_IN_INTERVAL - (currentBlock - habit.lastCheckInBlock);
  return Math.max(0, wait);
}

/**
 * Whether the habit owner can withdraw their stake right now.
 */
export function isEligibleToWithdraw(habit: Habit): boolean {
  return habit.isActive && habit.currentStreak >= MIN_STREAK_FOR_WITHDRAWAL;
}

/**
 * Whether a habit is currently eligible for a daily check-in transaction.
 */
export function isEligibleForDailyCheckIn(
  habit: Habit,
  currentBlock: number | null,
): boolean {
  const state = getCheckInWindowState(habit, currentBlock);
  return state === 'available' || state === 'urgent';
}

/**
 * Return habit IDs that can be checked in right now.
 */
export function getEligibleDailyCheckInHabitIds(
  habits: Habit[],
  currentBlock: number | null,
): number[] {
  return habits
    .filter((habit) => isEligibleForDailyCheckIn(habit, currentBlock))
    .map((habit) => habit.habitId);
}
