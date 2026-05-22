export type HabitTransactionName =
  | 'create-habit'
  | 'check-in'
  | 'withdraw-stake'
  | 'claim-bonus'
  | 'slash-habit'
  | 'register-referrer'
  | 'create-group'
  | 'join-group'
  | 'settle-member'
  | 'claim-group-reward'
  | 'finalize-group'
  | 'refund-failed-group'
  | 'claim-milestone-reward'
  | 'fund-reward-pool';

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
  'register-referrer': {
    invalidateHabits: false,
    invalidateUserStats: true,
    invalidatePoolBalance: false,
    refreshBalance: false,
  },
  'create-group': {
    invalidateHabits: false,
    invalidateUserStats: false,
    invalidatePoolBalance: false,
    refreshBalance: true,
  },
  'join-group': {
    invalidateHabits: false,
    invalidateUserStats: false,
    invalidatePoolBalance: false,
    refreshBalance: true,
  },
  'settle-member': {
    invalidateHabits: false,
    invalidateUserStats: false,
    invalidatePoolBalance: false,
    refreshBalance: false,
  },
  'claim-group-reward': {
    invalidateHabits: false,
    invalidateUserStats: false,
    invalidatePoolBalance: false,
    refreshBalance: true,
  },
  'finalize-group': {
    invalidateHabits: false,
    invalidateUserStats: false,
    invalidatePoolBalance: false,
    refreshBalance: false,
  },
  'refund-failed-group': {
    invalidateHabits: false,
    invalidateUserStats: false,
    invalidatePoolBalance: false,
    refreshBalance: true,
  },
  'claim-milestone-reward': {
    invalidateHabits: false,
    invalidateUserStats: false,
    invalidatePoolBalance: false,
    refreshBalance: true,
  },
  'fund-reward-pool': {
    invalidateHabits: false,
    invalidateUserStats: false,
    invalidatePoolBalance: false,
    refreshBalance: true,
  },
};

export function getHabitSyncTargets(functionName: string): HabitSyncTargets | null {
  return isHabitTransactionName(functionName) ? HABIT_SYNC_TARGETS[functionName] : null;
}

function isHabitTransactionName(value: string): value is HabitTransactionName {
  return value in HABIT_SYNC_TARGETS;
}
