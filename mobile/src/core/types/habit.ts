/** Represents an on-chain habit with its current state. */
export interface Habit {
  /** Unique numeric identifier for the habit on-chain. */
  habitId: number;
  /** Stacks principal address of the habit owner. */
  owner: string;
  /** User-defined habit name. */
  name: string;
  /** Staked amount in micro-STX. */
  stakeAmount: number;
  /** Number of consecutive successful check-ins. */
  currentStreak: number;
  /** Block height of the last check-in. */
  lastCheckInBlock: number;
  /** Block height at which the habit was created. */
  createdAtBlock: number;
  /** Whether the habit is still active on-chain. */
  isActive: boolean;
  /** Whether the habit has been completed and withdrawn. */
  isCompleted: boolean;
  /** Optional referral bonus weight multiplier. */
  bonusWeight?: number;
  /** Whether the bonus pool reward has been claimed. */
  bonusClaimed: boolean;
}

export interface UserStats {
  totalHabits: number;
  habitIds: number[];
}

export interface PoolBalance {
  microStx: number;
  stx: string;
  estimatedBonusShareMicroStx: number;
  estimatedBonusShareStx: string;
  unclaimedCompletedHabits: number;
}

export interface HabitFilters {
  activeOnly: boolean;
  completedOnly: boolean;
}
