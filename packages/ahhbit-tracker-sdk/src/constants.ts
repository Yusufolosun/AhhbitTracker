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
  HABIT_LIMIT_REACHED: 112,
  STAKE_TOO_HIGH: 113,
  // Accountability group error codes
  GROUP_NOT_AUTHORIZED: 300,
  GROUP_NOT_FOUND: 301,
  GROUP_FULL: 302,
  ALREADY_GROUP_MEMBER: 303,
  NOT_GROUP_MEMBER: 304,
  GROUP_NOT_ACTIVE: 305,
  GROUP_STILL_ACTIVE: 306,
  GROUP_INVALID_STAKE: 307,
  GROUP_INVALID_DURATION: 308,
  GROUP_ALREADY_SETTLED: 309,
  GROUP_ALREADY_CLAIMED: 310,
  GROUP_NOT_ELIGIBLE: 311,
  GROUP_INVALID_HABIT: 312,
  GROUP_LIMIT_REACHED: 313,
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
  [ErrorCode.HABIT_LIMIT_REACHED]: 'Maximum number of habits reached',
  [ErrorCode.STAKE_TOO_HIGH]: 'Stake amount exceeds the maximum allowed',
  [ErrorCode.GROUP_NOT_AUTHORIZED]: 'Not authorized for this group',
  [ErrorCode.GROUP_NOT_FOUND]: 'Group not found',
  [ErrorCode.GROUP_FULL]: 'Group is full (max 10 members)',
  [ErrorCode.ALREADY_GROUP_MEMBER]: 'Already a member of this group',
  [ErrorCode.NOT_GROUP_MEMBER]: 'Not a member of this group',
  [ErrorCode.GROUP_NOT_ACTIVE]: 'Group is no longer active',
  [ErrorCode.GROUP_STILL_ACTIVE]: 'Group period has not ended yet',
  [ErrorCode.GROUP_INVALID_STAKE]: 'Stake amount too low',
  [ErrorCode.GROUP_INVALID_DURATION]: 'Invalid group duration',
  [ErrorCode.GROUP_ALREADY_SETTLED]: 'Group already settled',
  [ErrorCode.GROUP_ALREADY_CLAIMED]: 'Reward already claimed',
  [ErrorCode.GROUP_NOT_ELIGIBLE]: 'Not eligible for reward',
  [ErrorCode.GROUP_INVALID_HABIT]: 'Invalid or inactive habit',
  [ErrorCode.GROUP_LIMIT_REACHED]: 'Group membership limit reached (max 20)',
};
