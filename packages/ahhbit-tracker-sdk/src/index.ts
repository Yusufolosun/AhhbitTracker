// Types
export type { Habit, UserHabits, UserStats, ContractId } from './types';

// Constants
export {
  MAINNET_CONTRACT,
  MIN_STAKE_AMOUNT,
  MAX_HABIT_NAME_LENGTH,
  CHECK_IN_WINDOW,
  MIN_STREAK_FOR_WITHDRAWAL,
  ErrorCode,
  errorMessages,
} from './constants';
export type { ErrorCodeValue } from './constants';

// Transaction builders
export {
  buildCreateHabit,
  buildCheckIn,
  buildSlashHabit,
  buildWithdrawStake,
  buildClaimBonus,
} from './client';

// Read-only queries
export {
  getHabit,
  getUserHabits,
  getHabitStreak,
  getPoolBalance,
  getTotalHabits,
  getUserStats,
} from './client';
