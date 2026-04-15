import { MIN_STREAK_FOR_WITHDRAWAL } from '../../core/config/constants';
import type { Habit } from '../../core/types/habit';

export type MobileWithdrawStatus =
  | 'withdrawable'
  | 'completed-on-chain'
  | 'inactive-on-chain'
  | 'insufficient-streak';

export function getMobileWithdrawStatus(habit: Habit): MobileWithdrawStatus {
  if (habit.isCompleted) {
    return 'completed-on-chain';
  }

  if (!habit.isActive) {
    return 'inactive-on-chain';
  }

  if (habit.currentStreak < MIN_STREAK_FOR_WITHDRAWAL) {
    return 'insufficient-streak';
  }

  return 'withdrawable';
}

export function canWithdrawHabit(habit: Habit): boolean {
  return getMobileWithdrawStatus(habit) === 'withdrawable';
}

export function describeWithdrawHabitStatus(habit: Habit): string {
  const status = getMobileWithdrawStatus(habit);

  if (status === 'completed-on-chain') {
    return 'Already withdrawn on-chain';
  }

  if (status === 'inactive-on-chain') {
    return 'Habit is inactive on-chain';
  }

  if (status === 'insufficient-streak') {
    const remaining = Math.max(MIN_STREAK_FOR_WITHDRAWAL - habit.currentStreak, 0);
    return `Needs ${remaining} more streak day${remaining === 1 ? '' : 's'}`;
  }

  return 'Ready to withdraw';
}
