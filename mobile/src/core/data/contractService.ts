import {
  getHabit,
  getPoolBalance,
  getUserHabits,
  getUserStats,
  type Habit as SdkHabit,
} from '@yusufolosun/ahhbit-tracker-sdk';
import { formatSTX } from '@yusufolosun/stx-utils';
import { networkConfig } from '@/core/config';
import { stacksNetwork } from '@/core/network';
import type { Habit, PoolBalance, UserStats } from '@/core/types';

function toMobileHabit(habitId: number, value: SdkHabit): Habit {
  return {
    habitId,
    owner: value.owner,
    name: value.name,
    stakeAmount: value.stakeAmount,
    currentStreak: value.currentStreak,
    lastCheckInBlock: value.lastCheckInBlock,
    createdAtBlock: value.createdAtBlock,
    isActive: value.isActive,
    isCompleted: value.isCompleted,
    bonusClaimed: value.bonusClaimed,
  };
}

export async function fetchHabitsByAddress(address: string): Promise<Habit[]> {
  const userHabits = await getUserHabits(address, stacksNetwork, networkConfig.contract);
  const habitIds = userHabits.habitIds;

  if (!habitIds.length) {
    return [];
  }

  const habits = await Promise.all(
    habitIds.map(async (habitId) => {
      const habit = await getHabit(habitId, stacksNetwork, networkConfig.contract);
      if (!habit) {
        return null;
      }

      return toMobileHabit(habitId, habit);
    }),
  );

  return habits
    .filter((habit): habit is Habit => habit !== null)
    .sort((a, b) => b.habitId - a.habitId);
}

export async function fetchPoolBalance(): Promise<PoolBalance> {
  const microStx = await getPoolBalance(stacksNetwork, networkConfig.contract);

  return {
    microStx,
    stx: formatSTX(microStx),
  };
}

export async function fetchUserStats(address: string): Promise<UserStats> {
  const stats = await getUserStats(address, stacksNetwork, networkConfig.contract);

  return {
    totalHabits: stats.totalHabits,
    habitIds: stats.habitIds,
  };
}
