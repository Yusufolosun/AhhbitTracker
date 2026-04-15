import {
  getHabit,
  getPoolBalance,
  getUserHabits,
  getUserStats,
  type Habit as SdkHabit,
} from '@yusufolosun/ahhbit-tracker-sdk';
import { cvToJSON, fetchCallReadOnlyFunction } from '@stacks/transactions';
import { formatSTX } from '@yusufolosun/stx-utils';
import { networkConfig } from '@/core/config';
import { stacksNetwork } from '@/core/network';
import type { Habit, PoolBalance, UserStats } from '@/core/types';

function unwrapOkNumber(json: any): number {
  if (json?.success === true) {
    return Number(json.value?.value ?? 0);
  }

  return Number(json?.value ?? 0);
}

async function readPoolDistributionValue(functionName: string): Promise<number> {
  const response = await fetchCallReadOnlyFunction({
    contractAddress: networkConfig.contract.contractAddress,
    contractName: networkConfig.contract.contractName,
    functionName,
    functionArgs: [],
    network: stacksNetwork,
    senderAddress: networkConfig.contract.contractAddress,
  });

  return unwrapOkNumber(cvToJSON(response));
}

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
  const [microStx, estimatedBonusShareMicroStx, unclaimedCompletedHabits] = await Promise.all([
    getPoolBalance(stacksNetwork, networkConfig.contract),
    readPoolDistributionValue('get-estimated-bonus-share'),
    readPoolDistributionValue('get-unclaimed-completed-habits'),
  ]);

  return {
    microStx,
    stx: formatSTX(microStx),
    estimatedBonusShareMicroStx,
    estimatedBonusShareStx: formatSTX(estimatedBonusShareMicroStx),
    unclaimedCompletedHabits,
  };
}

export async function fetchUserStats(address: string): Promise<UserStats> {
  const stats = await getUserStats(address, stacksNetwork, networkConfig.contract);

  return {
    totalHabits: stats.totalHabits,
    habitIds: stats.habitIds,
  };
}
