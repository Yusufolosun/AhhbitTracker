import { STACKS_MAINNET, createNetwork } from '@stacks/network';
import { registerErrors, DEFAULT_MIN_STAKE } from '@yusufolosun/stx-utils';

// Network Configuration
// In development, use Vite proxy to avoid CORS issues with Hiro API
const isDev = typeof import.meta !== 'undefined' && import.meta.env?.DEV;
export const NETWORK = isDev
  ? createNetwork({ network: 'mainnet', client: { baseUrl: `${typeof window !== 'undefined' ? window.location.origin : ''}/api/stacks` } })
  : STACKS_MAINNET;

// Contract Configuration — override via VITE_CONTRACT_ADDRESS / VITE_CONTRACT_NAME
export const CONTRACT_ADDRESS =
  import.meta.env.VITE_CONTRACT_ADDRESS ?? 'SP1N3809W9CBWWX04KN3TCQHP8A9GN520BD4JMP8Z';
export const CONTRACT_NAME =
  import.meta.env.VITE_CONTRACT_NAME ?? 'habit-tracker-v2';

// Contract Constants
export const MIN_STAKE_AMOUNT = DEFAULT_MIN_STAKE; // 0.02 STX in microSTX (from stx-utils)
export const MAX_STAKE_AMOUNT = 100000000; // 100 STX in microSTX
export const MAX_HABIT_NAME_LENGTH = 50;
export const CHECK_IN_WINDOW = 144; // blocks (~24 hours)
export const MIN_STREAK_FOR_WITHDRAWAL = 7;

// Error Codes - register with stx-utils for decodeError() support
const ERROR_CODES: Record<number, string> = {
  100: 'Not authorized',
  101: 'Stake amount too low (minimum 0.02 STX)',
  102: 'Invalid habit name (max 50 characters)',
  103: 'Habit not found',
  104: 'You do not own this habit',
  105: 'Already checked in today',
  106: 'Check-in window expired - stake forfeited',
  107: 'Need 7+ consecutive days to withdraw',
  108: 'Habit already completed',
  109: 'Insufficient pool balance',
  110: 'Transfer failed',
  111: 'Bonus already claimed for this habit',
  112: 'Maximum number of habits reached',
  113: 'Stake amount exceeds the maximum allowed',
  114: 'Habit was auto-slashed due to expired check-in window',
  // Accountability group errors
  300: 'Not authorized',
  301: 'Group not found',
  302: 'Group is full (max 10 members)',
  303: 'You are already a member of this group',
  304: 'You are not a member of this group',
  305: 'Group is no longer active',
  306: 'Group period has not ended yet',
  307: 'Stake amount too low',
  308: 'Invalid group duration',
  309: 'Group already settled',
  310: 'Reward already claimed',
  311: 'Not eligible for reward',
  312: 'Invalid or inactive habit',
  313: 'Group membership limit reached (max 20)',
};

// Register all error codes with stx-utils
registerErrors(ERROR_CODES);

// Re-export for components that need direct access
export { ERROR_CODES };

// Type for error code lookup
export type ErrorCode = keyof typeof ERROR_CODES;

// Helper to get error message by code
export const getErrorMessage = (code: number): string => {
  return ERROR_CODES[code] || `Unknown error (code: ${code})`;
};

// UI Constants
export const TOAST_DURATION = 5000;

// Query polling and cache configuration.
// Stacks blocks average ~10 min; polling faster than every 2 minutes
// wastes Hiro API quota without meaningful benefit.
export const POLLING_INTERVAL = 120_000; // 2 minutes
export const CACHE_TIME = 120_000;       // 2 minutes
export const POOL_CACHE_TIME = 300_000;  // 5 minutes — pool balance changes infrequently
