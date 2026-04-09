/**
 * @module contractService
 * Service for interacting with the AhhbitTracker smart contract.
 */
import { showContractCall } from '@stacks/connect';
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
    return sdkGetHabit(habitId, NETWORK, {
      contractAddress: CONTRACT_ADDRESS,
      contractName: CONTRACT_NAME,
    });
  },

  async readUserHabits(userAddress: string): Promise<number[]> {
    const result = await sdkGetUserHabits(userAddress, NETWORK, {
      contractAddress: CONTRACT_ADDRESS,
      contractName: CONTRACT_NAME,
    });

    return result.habitIds;
  },

  async readPoolBalance(): Promise<number> {
    return sdkGetPoolBalance(NETWORK, {
      contractAddress: CONTRACT_ADDRESS,
      contractName: CONTRACT_NAME,
    });
  },

  async readUserStats(userAddress: string): Promise<UserStats> {
    return sdkGetUserStats(userAddress, NETWORK, {
      contractAddress: CONTRACT_ADDRESS,
      contractName: CONTRACT_NAME,
    });
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
};
