// Types
export type { Habit, UserHabits, UserStats, ContractId } from './types';
export type {
  StacksReadOnlyNetwork,
  RetryOptions,
  ReadOnlyQueryOptions,
  ReadOnlyQueryRequest,
  ContractInteractionErrorContext,
} from './query-types';

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

// Query errors
export { ContractInteractionError, toContractInteractionError } from './query-error';

// Contract helpers
export { resolveContract, contractPrincipal } from './contract';

// Query execution
export { queryReadOnly, queryReadOnlyJson } from './query';

// Query response parsers
export { parseHabit, parseUserHabits, parseUserStats, unwrapOkNumber } from './parsers';

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
