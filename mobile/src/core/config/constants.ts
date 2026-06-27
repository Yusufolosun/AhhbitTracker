import { DEFAULT_MIN_STAKE } from '@yusufolosun/stx-utils';

/** Deep-link URI scheme for the AhhbitTracker mobile app. */
export const APP_LINK_SCHEME = 'ahhbittracker';
/** Minimum stake amount in micro-STX. */
export const MIN_STAKE_AMOUNT = DEFAULT_MIN_STAKE;
/** Maximum stake amount in micro-STX (100 STX). */
export const MAX_STAKE_AMOUNT = 100_000_000;
/** Maximum character length for a habit name. */
export const MAX_HABIT_NAME_LENGTH = 50;
/** Minimum number of blocks between consecutive check-ins. */
export const MIN_CHECK_IN_INTERVAL_BLOCKS = 96;
/** Maximum number of blocks after the last check-in before a habit expires. */
export const CHECK_IN_WINDOW_BLOCKS = 192;
/** Minimum streak required to withdraw stake. */
export const MIN_STREAK_FOR_WITHDRAWAL = 7;

/** React Query cache keys used throughout the application. */
export const QUERY_KEYS = {
  poolBalance: ['pool-balance'] as const,
  userHabits: (address: string) => ['user-habits', address] as const,
  userStats: (address: string) => ['user-stats', address] as const,
  currentBlock: ['current-block-height'] as const,
};

/** Default polling interval for React Query refetch (2 minutes). */
export const POLLING_INTERVAL_MS = 120_000;
