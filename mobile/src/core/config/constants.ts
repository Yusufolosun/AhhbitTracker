import { DEFAULT_MIN_STAKE } from '@yusufolosun/stx-utils';

export const APP_LINK_SCHEME = 'ahhbittracker';
export const MIN_STAKE_AMOUNT = DEFAULT_MIN_STAKE;
export const MAX_STAKE_AMOUNT = 100_000_000;
export const MAX_HABIT_NAME_LENGTH = 50;
export const CHECK_IN_WINDOW_BLOCKS = 144;
export const MIN_STREAK_FOR_WITHDRAWAL = 7;

export const QUERY_KEYS = {
  poolBalance: ['pool-balance'] as const,
  userHabits: (address: string) => ['user-habits', address] as const,
  userStats: (address: string) => ['user-stats', address] as const,
};

export const POLLING_INTERVAL_MS = 120_000;
