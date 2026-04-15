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
