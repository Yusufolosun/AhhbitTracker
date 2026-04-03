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

// Clarity contract response types for type-safe parsing
export interface ClarityValue {
  value: string | number | boolean | ClarityValue | ClarityValue[] | Record<string, ClarityValue>;
  type?: string;
}

export interface HabitContractResponse {
  value?: {
    value?: {
      name: ClarityValue;
      owner: ClarityValue;
      'stake-amount': ClarityValue;
      'created-at-block': ClarityValue;
      'last-check-in-block': ClarityValue;
      'current-streak': ClarityValue;
      'is-active': ClarityValue;
      'is-completed': ClarityValue;
      'bonus-claimed'?: ClarityValue;
    };
  };
}

export interface UserHabitsContractResponse {
  value?: {
    'habit-ids'?: {
      value?: ClarityValue[];
    };
  };
}

export interface UserStatsContractResponse {
  success?: boolean;
  value?: {
    value?: {
      'total-habits': ClarityValue;
      'habit-ids'?: {
        value?: ClarityValue[];
      };
    };
  };
}
