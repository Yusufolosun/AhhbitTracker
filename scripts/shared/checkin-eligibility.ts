import {
  CHECK_IN_WINDOW_BLOCKS,
  MIN_CHECK_IN_INTERVAL_BLOCKS,
} from './checkin-timing.ts';

export interface HabitCheckInSnapshot {
  isActive: boolean;
  isCompleted: boolean;
  lastCheckInBlock: number;
}

export type CheckInEligibilityReason =
  | 'eligible'
  | 'inactive'
  | 'completed'
  | 'too-early'
  | 'window-expired'
  | 'invalid-block-height';

export interface CheckInEligibility {
  eligible: boolean;
  reason: CheckInEligibilityReason;
  blocksElapsed: number;
  blocksUntilEligible: number;
  blocksUntilWindowExpiry: number;
}

export function evaluateDailyCheckInEligibility(
  habit: HabitCheckInSnapshot,
  currentBlock: number,
): CheckInEligibility {
  const blocksElapsed = currentBlock - habit.lastCheckInBlock;

  if (blocksElapsed < 0) {
    return {
      eligible: false,
      reason: 'invalid-block-height',
      blocksElapsed,
      blocksUntilEligible: 0,
      blocksUntilWindowExpiry: CHECK_IN_WINDOW_BLOCKS,
    };
  }

  if (habit.isCompleted) {
    return {
      eligible: false,
      reason: 'completed',
      blocksElapsed,
      blocksUntilEligible: 0,
      blocksUntilWindowExpiry: 0,
    };
  }

  if (!habit.isActive) {
    return {
      eligible: false,
      reason: 'inactive',
      blocksElapsed,
      blocksUntilEligible: 0,
      blocksUntilWindowExpiry: 0,
    };
  }

  if (blocksElapsed < MIN_CHECK_IN_INTERVAL_BLOCKS) {
    return {
      eligible: false,
      reason: 'too-early',
      blocksElapsed,
      blocksUntilEligible: MIN_CHECK_IN_INTERVAL_BLOCKS - blocksElapsed,
      blocksUntilWindowExpiry: CHECK_IN_WINDOW_BLOCKS - blocksElapsed,
    };
  }

  if (blocksElapsed > CHECK_IN_WINDOW_BLOCKS) {
    return {
      eligible: false,
      reason: 'window-expired',
      blocksElapsed,
      blocksUntilEligible: 0,
      blocksUntilWindowExpiry: 0,
    };
  }

  return {
    eligible: true,
    reason: 'eligible',
    blocksElapsed,
    blocksUntilEligible: 0,
    blocksUntilWindowExpiry: CHECK_IN_WINDOW_BLOCKS - blocksElapsed,
  };
}
