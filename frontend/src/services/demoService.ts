/**
 * @module demoService
 * Local-storage-backed sandbox for AhhbitTracker demo mode.
 *
 * When demo mode is active, all contract reads and writes are intercepted
 * by this service instead of hitting the real Stacks API. This lets
 * first-time visitors explore the full app experience with zero setup.
 */

import type { Habit } from '../types/habit';

const DEMO_STORAGE_KEY = 'ahhbit_demo_state';
const DEMO_MODE_KEY = 'ahhbit_demo_mode';

export const DEMO_ADDRESS = 'ST1DEMOUSER000000000000000000000';
const INITIAL_BALANCE = 50_000_000; // 50 STX in microSTX
const INITIAL_BLOCK = 200_000;
const MIN_CHECK_IN_INTERVAL = 96;
const CHECK_IN_WINDOW = 192;
const FORFEIT_BPS = 1000; // 10%
const BPS_DENOMINATOR = 10_000;
const MIN_STREAK_FOR_WITHDRAWAL = 7;

export interface DemoState {
  habits: Habit[];
  nextHabitId: number;
  poolBalance: number;
  userBalance: number;
  currentBlock: number;
  unclaimedCompletedHabits: number;
  unclaimedCompletedWeight: number;
}

function getDefaultState(): DemoState {
  return {
    habits: [],
    nextHabitId: 1,
    poolBalance: 125_000, // seed pool with 0.125 STX for realism
    userBalance: INITIAL_BALANCE,
    currentBlock: INITIAL_BLOCK,
    unclaimedCompletedHabits: 0,
    unclaimedCompletedWeight: 0,
  };
}

function loadState(): DemoState {
  try {
    const raw = localStorage.getItem(DEMO_STORAGE_KEY);
    if (raw) return JSON.parse(raw) as DemoState;
  } catch {
    // corrupted storage — reset
  }
  return getDefaultState();
}

function saveState(state: DemoState): void {
  localStorage.setItem(DEMO_STORAGE_KEY, JSON.stringify(state));
}

export const demoService = {
  isDemoMode(): boolean {
    return localStorage.getItem(DEMO_MODE_KEY) === 'true';
  },

  enableDemoMode(): void {
    localStorage.setItem(DEMO_MODE_KEY, 'true');
    if (!localStorage.getItem(DEMO_STORAGE_KEY)) {
      saveState(getDefaultState());
    }
  },

  disableDemoMode(): void {
    localStorage.removeItem(DEMO_MODE_KEY);
    localStorage.removeItem(DEMO_STORAGE_KEY);
  },

  getState(): DemoState {
    return loadState();
  },

  getCurrentBlock(): number {
    return loadState().currentBlock;
  },

  advanceBlocks(blocks: number): number {
    const state = loadState();
    state.currentBlock += blocks;
    saveState(state);
    return state.currentBlock;
  },

  getUserBalance(): number {
    return loadState().userBalance;
  },

  getPoolBalance(): number {
    return loadState().poolBalance;
  },

  getEstimatedBonusShare(): number {
    const state = loadState();
    if (state.unclaimedCompletedWeight === 0) return 0;
    return Math.floor(state.poolBalance / state.unclaimedCompletedWeight);
  },

  getUnclaimedCompletedHabits(): number {
    return loadState().unclaimedCompletedHabits;
  },

  getUnclaimedCompletedWeight(): number {
    return loadState().unclaimedCompletedWeight;
  },

  readUserHabits(): number[] {
    return loadState().habits.map((h) => h.habitId);
  },

  readHabit(habitId: number): Habit | null {
    const state = loadState();
    return state.habits.find((h) => h.habitId === habitId) ?? null;
  },

  readUserStats(): { totalHabits: number; habitIds: number[] } {
    const state = loadState();
    return {
      totalHabits: state.habits.length,
      habitIds: state.habits.map((h) => h.habitId),
    };
  },

  readReferrer(): string | null {
    return null;
  },

  createHabit(name: string, stakeAmount: number): string {
    const state = loadState();
    if (stakeAmount > state.userBalance) {
      throw new Error('Insufficient demo balance');
    }

    const newHabit: Habit = {
      habitId: state.nextHabitId,
      owner: DEMO_ADDRESS,
      name,
      stakeAmount,
      currentStreak: 0,
      lastCheckInBlock: state.currentBlock,
      createdAtBlock: state.currentBlock,
      isActive: true,
      isCompleted: false,
      bonusWeight: 1,
      bonusClaimed: false,
    };

    state.habits.push(newHabit);
    state.nextHabitId += 1;
    state.userBalance -= stakeAmount;
    saveState(state);
    return `demo-tx-create-${newHabit.habitId}`;
  },

  checkIn(habitId: number): string {
    const state = loadState();
    const habit = state.habits.find((h) => h.habitId === habitId);
    if (!habit) throw new Error('Habit not found');
    if (!habit.isActive) throw new Error('Habit is not active');

    const blocksSinceLast = state.currentBlock - habit.lastCheckInBlock;

    if (blocksSinceLast < MIN_CHECK_IN_INTERVAL) {
      throw new Error('Too early to check in — cooldown period');
    }

    if (blocksSinceLast > CHECK_IN_WINDOW) {
      // late check-in: apply penalty and reset streak
      const missedWindows = Math.floor(
        (blocksSinceLast - MIN_CHECK_IN_INTERVAL) / MIN_CHECK_IN_INTERVAL,
      );
      const penaltyPerWindow = Math.floor((habit.stakeAmount * FORFEIT_BPS) / BPS_DENOMINATOR);
      const totalPenalty = Math.min(penaltyPerWindow * missedWindows, habit.stakeAmount);
      habit.stakeAmount -= totalPenalty;
      state.poolBalance += totalPenalty;
      habit.currentStreak = 1;

      if (habit.stakeAmount <= 0) {
        habit.isActive = false;
        habit.stakeAmount = 0;
      }
    } else {
      habit.currentStreak += 1;
    }

    habit.lastCheckInBlock = state.currentBlock;
    saveState(state);
    return `demo-tx-checkin-${habitId}`;
  },

  withdrawStake(habitId: number): string {
    const state = loadState();
    const habit = state.habits.find((h) => h.habitId === habitId);
    if (!habit) throw new Error('Habit not found');
    if (habit.currentStreak < MIN_STREAK_FOR_WITHDRAWAL) {
      throw new Error('Need 7+ day streak to withdraw');
    }

    state.userBalance += habit.stakeAmount;
    habit.isActive = false;
    habit.isCompleted = true;
    state.unclaimedCompletedHabits += 1;
    state.unclaimedCompletedWeight += habit.bonusWeight ?? 1;
    saveState(state);
    return `demo-tx-withdraw-${habitId}`;
  },

  claimBonus(habitId: number): string {
    const state = loadState();
    const habit = state.habits.find((h) => h.habitId === habitId);
    if (!habit) throw new Error('Habit not found');
    if (!habit.isCompleted) throw new Error('Habit not completed');
    if (habit.bonusClaimed) throw new Error('Bonus already claimed');
    if (state.poolBalance === 0) throw new Error('Pool is empty');

    const share = Math.floor(state.poolBalance / Math.max(state.unclaimedCompletedWeight, 1));
    state.userBalance += share;
    state.poolBalance -= share;
    habit.bonusClaimed = true;
    state.unclaimedCompletedHabits = Math.max(0, state.unclaimedCompletedHabits - 1);
    state.unclaimedCompletedWeight = Math.max(
      0,
      state.unclaimedCompletedWeight - (habit.bonusWeight ?? 1),
    );
    saveState(state);
    return `demo-tx-claim-${habitId}`;
  },

  slashHabit(habitId: number): string {
    const state = loadState();
    const habit = state.habits.find((h) => h.habitId === habitId);
    if (!habit) throw new Error('Habit not found');
    if (!habit.isActive) throw new Error('Habit not active');

    const penaltyPerWindow = Math.floor((habit.stakeAmount * FORFEIT_BPS) / BPS_DENOMINATOR);
    habit.stakeAmount -= penaltyPerWindow;
    state.poolBalance += penaltyPerWindow;

    if (habit.stakeAmount <= 0) {
      habit.isActive = false;
      habit.stakeAmount = 0;
    }

    saveState(state);
    return `demo-tx-slash-${habitId}`;
  },

  registerReferrer(_referrer: string): string {
    return 'demo-tx-register-referrer';
  },
};
