import type { Habit } from '../../core/types/habit';
import {
  CHECK_IN_WINDOW_BLOCKS,
  MIN_CHECK_IN_INTERVAL_BLOCKS,
} from '../../core/config/constants';

const URGENT_THRESHOLD_BLOCKS = CHECK_IN_WINDOW_BLOCKS - 12;

export type MobileCheckInWindowState =
  | 'unknown'
  | 'cooldown'
  | 'available'
  | 'urgent'
  | 'expired';

/**
 * Computes the current check-in window state for a habit.
 *
 * @param habit - The habit snapshot object.
 * @param currentBlock - The current Stacks block height, or null if unknown.
 * @returns The current window state: unknown, cooldown, available, urgent, or expired.
 */
export function getMobileCheckInWindowState(
  habit: Habit,
  currentBlock: number | null,
): MobileCheckInWindowState {
  if (!habit.isActive || currentBlock === null) {
    return 'unknown';
  }

  const elapsed = currentBlock - habit.lastCheckInBlock;

  if (elapsed > CHECK_IN_WINDOW_BLOCKS) {
    return 'expired';
  }

  if (elapsed < MIN_CHECK_IN_INTERVAL_BLOCKS) {
    return 'cooldown';
  }

  if (elapsed > URGENT_THRESHOLD_BLOCKS) {
    return 'urgent';
  }

  return 'available';
}

/**
 * Returns whether a daily check-in can be submitted for the given habit.
 *
 * @param habit - The habit snapshot object.
 * @param currentBlock - The current Stacks block height, or null if unknown.
 * @returns True if the window state allows a check-in submission.
 */
export function canSubmitMobileDailyCheckIn(
  habit: Habit,
  currentBlock: number | null,
): boolean {
  const state = getMobileCheckInWindowState(habit, currentBlock);
  return state === 'available' || state === 'urgent' || state === 'expired';
}
