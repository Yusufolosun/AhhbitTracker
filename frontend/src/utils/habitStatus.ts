import { Habit } from '../types/habit';
import { CHECK_IN_WINDOW, MIN_STREAK_FOR_WITHDRAWAL } from './constants';

/**
 * Threshold (in blocks) at which we warn the user their window is closing.
 * 120 blocks = ~83% of the 144-block window, leaving ~4 hours to act.
 */
const URGENT_THRESHOLD = 120;

export type CheckInWindowState =
  | 'expired'
  | 'urgent'
  | 'available'
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
 * Whether the habit owner can withdraw their stake right now.
 */
export function isEligibleToWithdraw(habit: Habit): boolean {
  return habit.isActive && habit.currentStreak >= MIN_STREAK_FOR_WITHDRAWAL;
}
