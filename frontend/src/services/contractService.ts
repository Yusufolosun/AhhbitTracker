import { openContractCall } from '@stacks/connect';
import {
  uintCV,
  stringUtf8CV,
  principalCV,
  callReadOnlyFunction,
  cvToJSON,
} from '@stacks/transactions';
import { CONTRACT_ADDRESS, CONTRACT_NAME, NETWORK } from '../utils/constants';

export const contractService = {
  /**
   * Create a new habit
   */
  async createHabit(name: string, stakeAmount: number): Promise<void> {
    return openContractCall({
      contractAddress: CONTRACT_ADDRESS,
      contractName: CONTRACT_NAME,
      functionName: 'create-habit',
      functionArgs: [stringUtf8CV(name), uintCV(stakeAmount)],
      network: NETWORK,
      appDetails: {
        name: 'AhhbitTracker',
        icon: window.location.origin + '/logo.svg',
      },
      onFinish: (data) => {
        console.log('Transaction submitted:', data.txId);
      },
    });
  },

  /**
   * Check in to a habit
   */
  async checkIn(habitId: number): Promise<void> {
    return openContractCall({
      contractAddress: CONTRACT_ADDRESS,
      contractName: CONTRACT_NAME,
      functionName: 'check-in',
      functionArgs: [uintCV(habitId)],
      network: NETWORK,
      appDetails: {
        name: 'AhhbitTracker',
        icon: window.location.origin + '/logo.svg',
      },
    });
  },

  /**
   * Withdraw stake
   */
  async withdrawStake(habitId: number): Promise<void> {
    return openContractCall({
      contractAddress: CONTRACT_ADDRESS,
      contractName: CONTRACT_NAME,
      functionName: 'withdraw-stake',
      functionArgs: [uintCV(habitId)],
      network: NETWORK,
      appDetails: {
        name: 'AhhbitTracker',
        icon: window.location.origin + '/logo.svg',
      },
    });
  },

  /**
   * Claim bonus
   */
  async claimBonus(habitId: number): Promise<void> {
    return openContractCall({
      contractAddress: CONTRACT_ADDRESS,
      contractName: CONTRACT_NAME,
      functionName: 'claim-bonus',
      functionArgs: [uintCV(habitId)],
      network: NETWORK,
      appDetails: {
        name: 'AhhbitTracker',
        icon: window.location.origin + '/logo.svg',
      },
    });
  },

  /**
   * Get habit details
   */
  async getHabit(habitId: number): Promise<any> {
    const result = await callReadOnlyFunction({
      contractAddress: CONTRACT_ADDRESS,
      contractName: CONTRACT_NAME,
      functionName: 'get-habit',
      functionArgs: [uintCV(habitId)],
      network: NETWORK,
      senderAddress: CONTRACT_ADDRESS,
    });

    return cvToJSON(result);
  },

  /**
   * Get user habits
   */
  async getUserHabits(userAddress: string): Promise<any> {
    const result = await callReadOnlyFunction({
      contractAddress: CONTRACT_ADDRESS,
      contractName: CONTRACT_NAME,
      functionName: 'get-user-habits',
      functionArgs: [principalCV(userAddress)],
      network: NETWORK,
      senderAddress: CONTRACT_ADDRESS,
    });

    return cvToJSON(result);
  },

  /**
   * Get habit streak
   */
  async getHabitStreak(habitId: number): Promise<number> {
    const result = await callReadOnlyFunction({
      contractAddress: CONTRACT_ADDRESS,
      contractName: CONTRACT_NAME,
      functionName: 'get-habit-streak',
      functionArgs: [uintCV(habitId)],
      network: NETWORK,
      senderAddress: CONTRACT_ADDRESS,
    });

    const json = cvToJSON(result);
    return json.type === 'ok' ? parseInt(json.value.value) : 0;
  },

  /**
   * Get forfeited pool balance
   */
  async getPoolBalance(): Promise<number> {
    const result = await callReadOnlyFunction({
      contractAddress: CONTRACT_ADDRESS,
      contractName: CONTRACT_NAME,
      functionName: 'get-forfeited-pool-balance',
      functionArgs: [],
      network: NETWORK,
      senderAddress: CONTRACT_ADDRESS,
    });

    const json = cvToJSON(result);
    return parseInt(json.value.value);
  },

  /**
   * Get user stats
   */
  async getUserStats(userAddress: string): Promise<any> {
    const result = await callReadOnlyFunction({
      contractAddress: CONTRACT_ADDRESS,
      contractName: CONTRACT_NAME,
      functionName: 'get-user-stats',
      functionArgs: [principalCV(userAddress)],
      network: NETWORK,
      senderAddress: CONTRACT_ADDRESS,
    });

    return cvToJSON(result);
  },
};
