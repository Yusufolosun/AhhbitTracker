import type { ContractId } from './types';

/** Default mainnet contract deployment. */
export const MAINNET_CONTRACT: ContractId = {
  contractAddress: 'SP1N3809W9CBWWX04KN3TCQHP8A9GN520BD4JMP8Z',
  contractName: 'habit-tracker-v2',
};

/** Minimum stake in microSTX (0.02 STX). */
export const MIN_STAKE_AMOUNT = 20_000;

/** Maximum habit name length (UTF-8 characters). */
export const MAX_HABIT_NAME_LENGTH = 50;

/** Check-in window in blocks (~144 blocks = ~24 hours). */
export const CHECK_IN_WINDOW = 144;

/** Minimum streak required for withdrawal. */
export const MIN_STREAK_FOR_WITHDRAWAL = 7;

/** Contract error codes. */
export const ErrorCode = {
  NOT_AUTHORIZED: 100,
  INVALID_STAKE_AMOUNT: 101,
  INVALID_HABIT_NAME: 102,
  HABIT_NOT_FOUND: 103,
  NOT_HABIT_OWNER: 104,
  ALREADY_CHECKED_IN: 105,
  CHECK_IN_WINDOW_EXPIRED: 106,
  INSUFFICIENT_STREAK: 107,
  HABIT_ALREADY_COMPLETED: 108,
  POOL_INSUFFICIENT_BALANCE: 109,
  TRANSFER_FAILED: 110,
  BONUS_ALREADY_CLAIMED: 111,
} as const;

export type ErrorCodeValue = (typeof ErrorCode)[keyof typeof ErrorCode];

/** Maps error code to human-readable message. */
export const errorMessages: Record<ErrorCodeValue, string> = {
  [ErrorCode.NOT_AUTHORIZED]: 'Not authorized',
  [ErrorCode.INVALID_STAKE_AMOUNT]: 'Stake must be at least 0.02 STX',
  [ErrorCode.INVALID_HABIT_NAME]: 'Habit name must be 1-50 characters',
  [ErrorCode.HABIT_NOT_FOUND]: 'Habit not found',
  [ErrorCode.NOT_HABIT_OWNER]: 'Only the habit owner can perform this action',
  [ErrorCode.ALREADY_CHECKED_IN]: 'Already checked in today',
  [ErrorCode.CHECK_IN_WINDOW_EXPIRED]: 'Check-in window expired',
  [ErrorCode.INSUFFICIENT_STREAK]: 'Need a 7-day streak to withdraw',
  [ErrorCode.HABIT_ALREADY_COMPLETED]: 'Habit is no longer active',
  [ErrorCode.POOL_INSUFFICIENT_BALANCE]: 'Pool has insufficient balance',
  [ErrorCode.TRANSFER_FAILED]: 'STX transfer failed',
  [ErrorCode.BONUS_ALREADY_CLAIMED]: 'Bonus already claimed for this habit',
};
