import { showContractCall } from '@stacks/connect';
import {
  uintCV,
  stringUtf8CV,
  principalCV,
  fetchCallReadOnlyFunction,
  cvToJSON,
  PostConditionMode,
  Pc,
} from '@stacks/transactions';
import { CONTRACT_ADDRESS, CONTRACT_NAME, NETWORK } from '../utils/constants';
import { walletService } from './walletService';
import type {
  HabitContractResponse,
  UserHabitsContractResponse,
  UserStatsContractResponse,
} from '../types/habit';

/** Races a promise against a 10-second timeout so API calls don't hang. */
function withTimeout<T>(promise: Promise<T>, ms = 10_000): Promise<T> {
  return Promise.race([
    promise,
    new Promise<never>((_, reject) =>
      setTimeout(() => reject(new Error('API request timed out')), ms),
    ),
  ]);
}

const appDetails = {
  name: 'AhhbitTracker',
  icon: window.location.origin + '/logos/icon-only-dark.jpg',
};

export const contractService = {
  /**
   * Create a new habit
   * Returns the transaction ID on success for tracking
   */
  async createHabit(name: string, stakeAmount: number): Promise<string> {
    const userAddress = walletService.getAddress();
    if (!userAddress) {
      throw new Error('Wallet not connected');
    }

    // Post-condition: User must transfer exactly the stake amount to the contract
    const postConditions = [
      Pc.principal(userAddress).willSendEq(stakeAmount).ustx(),
    ];

    return new Promise((resolve, reject) => {
      showContractCall({
        contractAddress: CONTRACT_ADDRESS,
        contractName: CONTRACT_NAME,
        functionName: 'create-habit',
        functionArgs: [stringUtf8CV(name), uintCV(stakeAmount)],
        network: NETWORK,
        postConditions,
        postConditionMode: PostConditionMode.Deny,
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
   * Check in to a habit
   * Returns the transaction ID on success for tracking
   */
  async checkIn(habitId: number): Promise<string> {
    return new Promise((resolve, reject) => {
      showContractCall({
        contractAddress: CONTRACT_ADDRESS,
        contractName: CONTRACT_NAME,
        functionName: 'check-in',
        functionArgs: [uintCV(habitId)],
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
   * Withdraw stake
   * Returns the transaction ID on success for tracking
   */
  async withdrawStake(habitId: number, stakeAmount: number): Promise<string> {
    const userAddress = walletService.getAddress();
    if (!userAddress) {
      throw new Error('Wallet not connected');
    }

    // Post-condition: Contract must transfer exactly the staked amount back to the user
    const postConditions = [
      Pc.principal(`${CONTRACT_ADDRESS}.${CONTRACT_NAME}`).willSendEq(stakeAmount).ustx(),
    ];

    return new Promise((resolve, reject) => {
      showContractCall({
        contractAddress: CONTRACT_ADDRESS,
        contractName: CONTRACT_NAME,
        functionName: 'withdraw-stake',
        functionArgs: [uintCV(habitId)],
        network: NETWORK,
        postConditions,
        postConditionMode: PostConditionMode.Deny,
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
   * Claim bonus
   * Returns the transaction ID on success for tracking
   */
  async claimBonus(habitId: number): Promise<string> {
    const userAddress = walletService.getAddress();
    if (!userAddress) {
      throw new Error('Wallet not connected');
    }

    // Post-condition: Contract must transfer at least 1 microSTX from the pool
    const postConditions = [
      Pc.principal(`${CONTRACT_ADDRESS}.${CONTRACT_NAME}`).willSendGte(1).ustx(),
    ];

    return new Promise((resolve, reject) => {
      showContractCall({
        contractAddress: CONTRACT_ADDRESS,
        contractName: CONTRACT_NAME,
        functionName: 'claim-bonus',
        functionArgs: [uintCV(habitId)],
        network: NETWORK,
        postConditions,
        postConditionMode: PostConditionMode.Deny,
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
   * Slash an expired habit (anyone can call this)
   * Moves the stake from an expired habit into the forfeited pool
   * Returns the transaction ID on success for tracking
   */
  async slashHabit(habitId: number): Promise<string> {
    return new Promise((resolve, reject) => {
      showContractCall({
        contractAddress: CONTRACT_ADDRESS,
        contractName: CONTRACT_NAME,
        functionName: 'slash-habit',
        functionArgs: [uintCV(habitId)],
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
   * Get habit details
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
   * Get user habits
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
   * Get forfeited pool balance
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
   * Get user stats
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
