export type HabitTransactionName =
  | 'create-habit'
  | 'check-in'
  | 'withdraw-stake'
  | 'claim-bonus'
  | 'slash-habit';

export interface HabitSyncTargets {
  invalidateHabits: boolean;
  invalidateUserStats: boolean;
  invalidatePoolBalance: boolean;
  refreshBalance: boolean;
}

const HABIT_SYNC_TARGETS: Record<HabitTransactionName, HabitSyncTargets> = {
  'create-habit': {
    invalidateHabits: true,
    invalidateUserStats: true,
    invalidatePoolBalance: false,
    refreshBalance: true,
  },
  'check-in': {
    invalidateHabits: true,
    invalidateUserStats: true,
    invalidatePoolBalance: false,
    refreshBalance: true,
  },
  'withdraw-stake': {
    invalidateHabits: true,
    invalidateUserStats: true,
    invalidatePoolBalance: true,
    refreshBalance: true,
  },
  'claim-bonus': {
    invalidateHabits: true,
    invalidateUserStats: true,
    invalidatePoolBalance: true,
    refreshBalance: true,
  },
  'slash-habit': {
    invalidateHabits: true,
    invalidateUserStats: true,
    invalidatePoolBalance: true,
    refreshBalance: true,
  },
};

export function getHabitSyncTargets(functionName: string): HabitSyncTargets | null {
  return isHabitTransactionName(functionName) ? HABIT_SYNC_TARGETS[functionName] : null;
}

function isHabitTransactionName(value: string): value is HabitTransactionName {
  return value in HABIT_SYNC_TARGETS;
}