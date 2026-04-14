export const MIN_STREAK_FOR_WITHDRAWAL = 7;

export interface WithdrawableHabitSnapshot {
  isActive: boolean;
  isCompleted: boolean;
  currentStreak: number;
}

export function canWithdrawHabit(habit: WithdrawableHabitSnapshot): boolean {
  return habit.isActive && !habit.isCompleted && habit.currentStreak >= MIN_STREAK_FOR_WITHDRAWAL;
}

export function describeWithdrawHabitStatus(habit: WithdrawableHabitSnapshot): string {
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

  return 'withdrawable';
}