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

/** Summary statistics for a user's habits. */
export interface UserStats {
  /** Total number of habits created by the user. */
  totalHabits: number;
  /** Array of habit IDs belonging to the user. */
  habitIds: number[];
}

/** Represents the current state of the community reward pool. */
export interface PoolBalance {
  /** Pool balance in micro-STX. */
  microStx: number;
  /** Pool balance formatted as STX string. */
  stx: string;
  /** Estimated per-habit bonus share in micro-STX. */
  estimatedBonusShareMicroStx: number;
  /** Estimated per-habit bonus share formatted as STX string. */
  estimatedBonusShareStx: string;
  /** Number of completed habits that have not yet claimed their bonus. */
  unclaimedCompletedHabits: number;
}

/** Filter options for querying habits. */
export interface HabitFilters {
  /** When true, only active habits are shown. */
  activeOnly: boolean;
  /** When true, only completed habits are shown. */
  completedOnly: boolean;
}
