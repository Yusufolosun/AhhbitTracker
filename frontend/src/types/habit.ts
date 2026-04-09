/**
 * Core type definitions for AhhbitTracker frontend.
 * @module types/habit
 */

/**
 * Represents a habit stored on the Stacks blockchain.
 */
export interface Habit {
  habitId: number;
  owner: string;
  name: string;
  stakeAmount: number;
  currentStreak: number;
  lastCheckInBlock: number;
  createdAtBlock: number;
  isActive: boolean;
  isCompleted: boolean;
  bonusClaimed: boolean;
}

/**
 * Aggregated statistics for a user's habits.
 */
export interface UserStats {
  totalHabits: number;
  habitIds: number[];
}

/**
 * Forfeited pool balance in microSTX and STX.
 */
export interface PoolBalance {
  balance: number;
  balanceSTX: number;
}

/**
 * Result of a contract transaction submission.
 */
export interface TransactionResult {
  txId: string;
  success: boolean;
  error?: string;
}

/**
 * Current state of the connected Stacks wallet.
 */
export interface WalletState {
  address: string | null;
  isConnected: boolean;
  balance: number;
}
