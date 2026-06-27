import { CHECK_IN_WINDOW_BLOCKS, MIN_STREAK_FOR_WITHDRAWAL } from '../../core/config/constants';
import type { Habit } from '../../core/types/habit';

export type MobileWithdrawStatus =
  | 'withdrawable'
  | 'completed-on-chain'
  | 'inactive-on-chain'
  | 'insufficient-streak';

/**
 * Determines the withdrawal status of a habit based on active state, streak, and check-in window.
 *
 * @param habit - The habit snapshot object.
 * @param currentBlock - The current Stacks block height.
 * @returns The MobileWithdrawStatus indicator.
 */
export function getMobileWithdrawStatus(habit: Habit, currentBlock?: number | null): MobileWithdrawStatus {
  if (habit.isCompleted) {
    return 'completed-on-chain';
  }

  if (!habit.isActive) {
    return 'inactive-on-chain';
  }

  if (currentBlock !== undefined && currentBlock !== null) {
    const elapsed = currentBlock - habit.lastCheckInBlock;
    if (elapsed > CHECK_IN_WINDOW_BLOCKS) {
      return 'inactive-on-chain';
    }
  }

  if (habit.currentStreak < MIN_STREAK_FOR_WITHDRAWAL) {
    return 'insufficient-streak';
  }

  return 'withdrawable';
}

/**
 * Checks whether a habit is withdrawable.
 *
 * @param habit - The habit snapshot object.
 * @param currentBlock - The current Stacks block height.
 * @returns True if withdrawable, false otherwise.
 */
export function canWithdrawHabit(habit: Habit, currentBlock?: number | null): boolean {
  return getMobileWithdrawStatus(habit, currentBlock) === 'withdrawable';
}

/**
 * Returns a human-friendly string description of a habit's withdrawal status.
 *
 * @param habit - The habit snapshot object.
 * @param currentBlock - The current Stacks block height.
 * @returns A user-friendly message describing eligibility.
 */
export function describeWithdrawHabitStatus(habit: Habit, currentBlock?: number | null): string {
  const status = getMobileWithdrawStatus(habit, currentBlock);

  if (status === 'completed-on-chain') {
    return 'Already withdrawn on-chain';
  }

  if (status === 'inactive-on-chain') {
    if (currentBlock !== undefined && currentBlock !== null) {
      const elapsed = currentBlock - habit.lastCheckInBlock;
      if (elapsed > CHECK_IN_WINDOW_BLOCKS) {
        return 'Check-in window expired — cannot withdraw';
      }
    }
    return 'Habit is inactive on-chain';
  }

  if (status === 'insufficient-streak') {
    const remaining = Math.max(MIN_STREAK_FOR_WITHDRAWAL - habit.currentStreak, 0);
    return `Needs ${remaining} more streak day${remaining === 1 ? '' : 's'}`;
  }

  return 'Ready to withdraw';
}
