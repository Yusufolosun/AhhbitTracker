import { STACKS_MAINNET, createNetwork } from '@stacks/network';

// Network Configuration
// In development, use Vite proxy to avoid CORS issues with Hiro API
const isDev = import.meta.env.DEV;
export const NETWORK = isDev
  ? createNetwork({ network: 'mainnet', client: { baseUrl: `${window.location.origin}/api/stacks` } })
  : STACKS_MAINNET;

// Contract Configuration
export const CONTRACT_ADDRESS = 'SP1M46W6CVGAMH3ZJD3TKMY5KCY48HWAZK0DYG193';
export const CONTRACT_NAME = 'habit-tracker';

// Contract Constants
export const MIN_STAKE_AMOUNT = 100000; // 0.1 STX in microSTX
export const MAX_HABIT_NAME_LENGTH = 50;
export const CHECK_IN_WINDOW = 144; // blocks (~24 hours)
export const MIN_STREAK_FOR_WITHDRAWAL = 7;

// Error Codes
export const ERROR_CODES: Record<number, string> = {
  100: 'Not authorized',
  101: 'Stake amount too low (minimum 0.1 STX)',
  102: 'Invalid habit name (max 50 characters)',
  103: 'Habit not found',
  104: 'You do not own this habit',
  105: 'Already checked in today',
  106: 'Check-in window expired - stake forfeited',
  107: 'Need 7+ consecutive days to withdraw',
  108: 'Habit already completed',
  109: 'Insufficient pool balance',
  110: 'Transfer failed',
};

// UI Constants
export const TOAST_DURATION = 5000;
export const POLLING_INTERVAL = 10000; // 10 seconds
export const CACHE_TIME = 30000; // 30 seconds

// Explorer URLs
export const EXPLORER_TX_URL = 'https://explorer.hiro.so/txid/';
export const EXPLORER_ADDRESS_URL = 'https://explorer.hiro.so/address/';
