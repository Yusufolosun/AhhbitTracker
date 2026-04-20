import type { Habit } from '../../core/types/habit';
import {
  CHECK_IN_WINDOW_BLOCKS,
  MIN_CHECK_IN_INTERVAL_BLOCKS,
} from '../../core/config/constants';

const URGENT_THRESHOLD_BLOCKS = 132;

export type MobileCheckInWindowState =
  | 'unknown'
  | 'cooldown'
  | 'available'
  | 'urgent'
  | 'expired';

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

export function canSubmitMobileDailyCheckIn(
  habit: Habit,
  currentBlock: number | null,
): boolean {
  const state = getMobileCheckInWindowState(habit, currentBlock);
  return state === 'available' || state === 'urgent';
}
