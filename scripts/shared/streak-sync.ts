import { CHECK_IN_WINDOW_BLOCKS } from './checkin-timing.ts';

export const MIN_STREAK_FOR_WITHDRAWAL = 7;

export interface WithdrawableHabitSnapshot {
  isActive: boolean;
  isCompleted: boolean;
  currentStreak: number;
  lastCheckInBlock: number;
}

/**
 * Determines whether a habit is eligible for on-chain withdrawal.
 *
 * Mirrors the contract's withdraw-stake guards:
 *   1. isActive = true
 *   2. isCompleted = false
 *   3. currentStreak >= MIN_STREAK_FOR_WITHDRAWAL (7)
 *   4. Check-in window still valid: currentBlock <= lastCheckInBlock + CHECK_IN_WINDOW
 *      (contract line: `(asserts! (is-check-in-valid ...) ERR-NOT-AUTHORIZED)`)
 */
export function canWithdrawHabit(habit: WithdrawableHabitSnapshot, currentBlock: number): boolean {
  if (!habit.isActive || habit.isCompleted) return false;
  if (habit.currentStreak < MIN_STREAK_FOR_WITHDRAWAL) return false;

  // Contract enforces: block-height <= last-check-in-block + CHECK-IN-WINDOW
  const windowDeadline = habit.lastCheckInBlock + CHECK_IN_WINDOW_BLOCKS;
  if (currentBlock > windowDeadline) return false;

  return true;
}

export function describeWithdrawHabitStatus(habit: WithdrawableHabitSnapshot, currentBlock: number): string {
  if (!habit.isActive && habit.isCompleted) {
    return 'completed on-chain';
  }

  if (!habit.isActive) {
    return 'inactive on-chain';
  }

  if (habit.currentStreak < MIN_STREAK_FOR_WITHDRAWAL) {
    const remaining = MIN_STREAK_FOR_WITHDRAWAL - habit.currentStreak;
    return `needs ${remaining} more streak day${remaining === 1 ? '' : 's'}`;
  }

  const windowDeadline = habit.lastCheckInBlock + CHECK_IN_WINDOW_BLOCKS;
  if (currentBlock > windowDeadline) {
    const blocksOverdue = currentBlock - windowDeadline;
    return `check-in window expired ${blocksOverdue} block${blocksOverdue === 1 ? '' : 's'} ago — cannot withdraw`;
  }

  return 'withdrawable';
}