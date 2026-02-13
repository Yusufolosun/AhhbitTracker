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
