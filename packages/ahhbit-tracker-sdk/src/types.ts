/** On-chain habit data returned by `get-habit`. */
export interface Habit {
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

/** User habit list returned by `get-user-habits`. */
export interface UserHabits {
  habitIds: number[];
}

/** User stats returned by `get-user-stats`. */
export interface UserStats {
  totalHabits: number;
  habitIds: number[];
}

/** Contract deployment identifiers. */
export interface ContractId {
  contractAddress: string;
  contractName: string;
}
