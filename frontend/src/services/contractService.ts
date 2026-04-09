/**
 * @module contractService
 * Service for interacting with the AhhbitTracker smart contract.
 */
import { showContractCall } from '@stacks/connect';
import {
  uintCV,
  principalCV,
  fetchCallReadOnlyFunction,
  cvToJSON,
} from '@stacks/transactions';
import {
  buildCheckIn,
  buildClaimBonus,
  buildCreateHabit,
  buildSlashHabit,
  buildWithdrawStake,
} from '@yusufolosun/ahhbit-tracker-sdk';
import { CONTRACT_ADDRESS, CONTRACT_NAME, NETWORK } from '../utils/constants';
import { walletService } from './walletService';
import type {
  HabitContractResponse,
  UserHabitsContractResponse,
  UserStatsContractResponse,
} from '../types/habit';

/**
 * Races a promise against a timeout to prevent API calls from hanging.
 *
 * @param promise - The promise to race
 * @param ms - Timeout in milliseconds (default: 10000)
 * @returns The promise result or throws on timeout
 */
function withTimeout<T>(promise: Promise<T>, ms = 10_000): Promise<T> {
  return Promise.race([
    promise,
    new Promise<never>((_, reject) =>
      setTimeout(() => reject(new Error('API request timed out')), ms),
    ),
  ]);
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

  /**
   * Get details for a specific habit.
   *
   * @param habitId - The habit ID to query
   * @returns Habit data or null if not found
   */
  async getHabit(habitId: number): Promise<HabitContractResponse> {
    const result = await withTimeout(fetchCallReadOnlyFunction({
      contractAddress: CONTRACT_ADDRESS,
      contractName: CONTRACT_NAME,
      functionName: 'get-habit',
      functionArgs: [uintCV(habitId)],
      network: NETWORK,
      senderAddress: CONTRACT_ADDRESS,
    }));

    return cvToJSON(result) as HabitContractResponse;
  },

  /**
   * Get all habits for a user.
   *
   * @param userAddress - Stacks address to query
   * @returns List of habit IDs owned by the user
   */
  async getUserHabits(userAddress: string): Promise<UserHabitsContractResponse> {
    const result = await withTimeout(fetchCallReadOnlyFunction({
      contractAddress: CONTRACT_ADDRESS,
      contractName: CONTRACT_NAME,
      functionName: 'get-user-habits',
      functionArgs: [principalCV(userAddress)],
      network: NETWORK,
      senderAddress: CONTRACT_ADDRESS,
    }));

    return cvToJSON(result) as UserHabitsContractResponse;
  },

  /**
   * Get the current forfeited pool balance.
   *
   * @returns Pool balance in microSTX
   */
  async getPoolBalance(): Promise<number> {
    const result = await withTimeout(fetchCallReadOnlyFunction({
      contractAddress: CONTRACT_ADDRESS,
      contractName: CONTRACT_NAME,
      functionName: 'get-pool-balance',
      functionArgs: [],
      network: NETWORK,
      senderAddress: CONTRACT_ADDRESS,
    }));

    const json = cvToJSON(result);
    return parseInt(json.value.value);
  },

  /**
   * Get statistics for a user.
   *
   * @param userAddress - Stacks address to query
   * @returns User statistics including total habits and streaks
   */
  async getUserStats(userAddress: string): Promise<UserStatsContractResponse> {
    const result = await withTimeout(fetchCallReadOnlyFunction({
      contractAddress: CONTRACT_ADDRESS,
      contractName: CONTRACT_NAME,
      functionName: 'get-user-stats',
      functionArgs: [principalCV(userAddress)],
      network: NETWORK,
      senderAddress: CONTRACT_ADDRESS,
    }));

    return cvToJSON(result) as UserStatsContractResponse;
  },
};
