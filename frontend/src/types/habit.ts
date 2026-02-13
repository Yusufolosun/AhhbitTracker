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
}

export interface UserStats {
  totalHabits: number;
  habitIds: number[];
}

export interface PoolBalance {
  balance: number;
  balanceSTX: number;
}

export interface TransactionResult {
  txId: string;
  success: boolean;
  error?: string;
}

export interface WalletState {
  address: string | null;
  isConnected: boolean;
  balance: number;
}
