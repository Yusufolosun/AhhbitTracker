/**
 * @module contractService
 * Service for interacting with the AhhbitTracker smart contract.
 */
import { showContractCall } from '@stacks/connect';
import { cvToJSON, fetchCallReadOnlyFunction } from '@stacks/transactions';
import {
  buildCheckIn,
  buildClaimBonus,
  buildCreateHabit,
  buildSlashHabit,
  buildWithdrawStake,
  getHabit as sdkGetHabit,
  getPoolBalance as sdkGetPoolBalance,
  getUserHabits as sdkGetUserHabits,
  getUserStats as sdkGetUserStats,
} from '@yusufolosun/ahhbit-tracker-sdk';
import { CONTRACT_ADDRESS, CONTRACT_NAME, NETWORK } from '../utils/constants';
import { walletService } from './walletService';
import type { Habit, UserStats } from '../types/habit';
import {
  cacheHabitRead,
  cachePoolBalanceRead,
  cacheUserHabitsRead,
  cacheUserStatsRead,
  clearAllContractReadCache,
  clearHabitReadCache,
  clearPoolReadCache,
  clearUserReadCache,
} from './contractReadCache';

function unwrapOkNumber(json: any): number {
  if (json?.success === true) {
    return Number(json.value?.value ?? 0);
  }

  return Number(json?.value ?? 0);
}

/** Application details for wallet transaction popups. */
const appDetails = {
  name: 'AhhbitTracker',
  icon: window.location.origin + '/logos/icon-only-dark.jpg',
};

/**
 * Contract service for habit tracker operations.
 * Provides methods for both write operations (transactions) and read-only queries.
 */
export const contractService = {
  async readHabit(habitId: number): Promise<Habit | null> {
    return cacheHabitRead(habitId, () =>
      sdkGetHabit(habitId, NETWORK, {
        contractAddress: CONTRACT_ADDRESS,
        contractName: CONTRACT_NAME,
      })
    );
  },

  invalidateHabitReadCache(habitId: number): void {
    clearHabitReadCache(habitId);
  },

  invalidateAddressReadCache(userAddress: string): void {
    clearUserReadCache(userAddress);
  },

  invalidatePoolReadCache(): void {
    clearPoolReadCache();
  },

  invalidateAllReadCache(): void {
    clearAllContractReadCache();
  },

  async readUserHabits(userAddress: string): Promise<number[]> {
    const result = await cacheUserHabitsRead(userAddress, () =>
      sdkGetUserHabits(userAddress, NETWORK, {
        contractAddress: CONTRACT_ADDRESS,
        contractName: CONTRACT_NAME,
      })
    );

    return result.habitIds;
  },

  async readPoolBalance(): Promise<number> {
    return cachePoolBalanceRead(() =>
      sdkGetPoolBalance(NETWORK, {
        contractAddress: CONTRACT_ADDRESS,
        contractName: CONTRACT_NAME,
      })
    );
  },

  async readEstimatedBonusShare(): Promise<number> {
    const response = await fetchCallReadOnlyFunction({
      contractAddress: CONTRACT_ADDRESS,
      contractName: CONTRACT_NAME,
      functionName: 'get-estimated-bonus-share',
      functionArgs: [],
      network: NETWORK,
      senderAddress: CONTRACT_ADDRESS,
    });

    return unwrapOkNumber(cvToJSON(response));
  },

  async readUnclaimedCompletedHabits(): Promise<number> {
    const response = await fetchCallReadOnlyFunction({
      contractAddress: CONTRACT_ADDRESS,
      contractName: CONTRACT_NAME,
      functionName: 'get-unclaimed-completed-habits',
      functionArgs: [],
      network: NETWORK,
      senderAddress: CONTRACT_ADDRESS,
    });

    return unwrapOkNumber(cvToJSON(response));
  },

  async readUserStats(userAddress: string): Promise<UserStats> {
    return cacheUserStatsRead(userAddress, () =>
      sdkGetUserStats(userAddress, NETWORK, {
        contractAddress: CONTRACT_ADDRESS,
        contractName: CONTRACT_NAME,
      })
    );
  },

  /**
   * Create a new habit with the specified stake.
   *
   * @param name - Habit name (max 50 UTF-8 characters)
   * @param stakeAmount - Stake amount in microSTX
   * @returns Transaction ID for tracking
   * @throws Error if wallet not connected or transaction cancelled
   */
  async createHabit(name: string, stakeAmount: number): Promise<string> {
    const userAddress = walletService.getAddress();
    if (!userAddress) {
      throw new Error('Wallet not connected');
    }

    const txPayload = buildCreateHabit(name, stakeAmount, userAddress, {
      contractAddress: CONTRACT_ADDRESS,
      contractName: CONTRACT_NAME,
    });

    return new Promise((resolve, reject) => {
      showContractCall({
        ...txPayload,
        network: NETWORK,
        appDetails,
        userSession: walletService.getUserSession(),
        onFinish: (data) => {
          resolve(data.txId);
        },
        onCancel: () => {
          reject(new Error('Transaction cancelled'));
        },
      });
    });
  },

  /**
   * Record a check-in for a habit.
   *
   * @param habitId - The habit ID to check in for
   * @returns Transaction ID for tracking
   * @throws Error if transaction cancelled
   */
  async checkIn(habitId: number): Promise<string> {
    const userAddress = walletService.getAddress();
    if (!userAddress) {
      throw new Error('Wallet not connected');
    }

    const txPayload = buildCheckIn(habitId, {
      contractAddress: CONTRACT_ADDRESS,
      contractName: CONTRACT_NAME,
    });

    return new Promise((resolve, reject) => {
      showContractCall({
        ...txPayload,
        network: NETWORK,
        appDetails,
        userSession: walletService.getUserSession(),
        onFinish: (data) => {
          resolve(data.txId);
        },
        onCancel: () => {
          reject(new Error('Transaction cancelled'));
        },
      });
    });
  },

  /**
   * Withdraw stake from a completed habit.
   *
   * @param habitId - The habit ID to withdraw from
   * @param stakeAmount - Expected stake amount in microSTX (for post-condition)
   * @returns Transaction ID for tracking
   * @throws Error if wallet not connected or transaction cancelled
   */
  async withdrawStake(habitId: number, stakeAmount: number): Promise<string> {
    const userAddress = walletService.getAddress();
    if (!userAddress) {
      throw new Error('Wallet not connected');
    }

    const txPayload = buildWithdrawStake(habitId, stakeAmount, {
      contractAddress: CONTRACT_ADDRESS,
      contractName: CONTRACT_NAME,
    });

    return new Promise((resolve, reject) => {
      showContractCall({
        ...txPayload,
        network: NETWORK,
        appDetails,
        userSession: walletService.getUserSession(),
        onFinish: (data) => {
          resolve(data.txId);
        },
        onCancel: () => {
          reject(new Error('Transaction cancelled'));
        },
      });
    });
  },

  /**
   * Claim bonus from the forfeited pool for a streak achievement.
   *
   * @param habitId - The habit ID to claim bonus for
   * @returns Transaction ID for tracking
   * @throws Error if wallet not connected or transaction cancelled
   */
  async claimBonus(habitId: number): Promise<string> {
    const userAddress = walletService.getAddress();
    if (!userAddress) {
      throw new Error('Wallet not connected');
    }

    const txPayload = buildClaimBonus(habitId, {
      contractAddress: CONTRACT_ADDRESS,
      contractName: CONTRACT_NAME,
    });

    return new Promise((resolve, reject) => {
      showContractCall({
        ...txPayload,
        network: NETWORK,
        appDetails,
        userSession: walletService.getUserSession(),
        onFinish: (data) => {
          resolve(data.txId);
        },
        onCancel: () => {
          reject(new Error('Transaction cancelled'));
        },
      });
    });
  },

  /**
   * Slash an expired habit to move its stake to the forfeited pool.
   * This is a public function that anyone can call.
   *
   * @param habitId - The habit ID to slash
   * @returns Transaction ID for tracking
   * @throws Error if transaction cancelled
   */
  async slashHabit(habitId: number): Promise<string> {
    const userAddress = walletService.getAddress();
    if (!userAddress) {
      throw new Error('Wallet not connected');
    }

    const txPayload = buildSlashHabit(habitId, {
      contractAddress: CONTRACT_ADDRESS,
      contractName: CONTRACT_NAME,
    });

    return new Promise((resolve, reject) => {
      showContractCall({
        ...txPayload,
        network: NETWORK,
        appDetails,
        userSession: walletService.getUserSession(),
        onFinish: (data) => {
          resolve(data.txId);
        },
        onCancel: () => {
          reject(new Error('Transaction cancelled'));
        },
      });
    });
  },
};
