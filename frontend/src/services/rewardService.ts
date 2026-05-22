/**
 * @module rewardService
 * Service for interacting with the Habit Streak Reward smart contract.
 */
import { showContractCall } from '@stacks/connect';
import { cvToJSON, fetchCallReadOnlyFunction } from '@stacks/transactions';
import { CONTRACT_ADDRESS, NETWORK, REWARD_CONTRACT_NAME } from '../utils/constants';
import { walletService } from './walletService';

/** Application details for wallet transaction popups. */
const appDetails = {
  name: 'AhhbitTracker',
  icon: window.location.origin + '/logos/icon-only-dark.jpg',
};

export const rewardService = {
  async readMilestoneReward(milestone: number): Promise<number> {
    const response = await fetchCallReadOnlyFunction({
      contractAddress: CONTRACT_ADDRESS,
      contractName: REWARD_CONTRACT_NAME,
      functionName: 'get-milestone-reward',
      functionArgs: [{ type: 'uint', value: milestone.toString() } as any],
      network: NETWORK,
      senderAddress: CONTRACT_ADDRESS,
    });

    const json = cvToJSON(response);
    if (json?.success === true) {
      return Number(json.value?.value?.['reward-amount']?.value || 0);
    }
    return Number(json?.value?.['reward-amount']?.value || 0);
  },

  async readRewardPoolBalance(): Promise<number> {
    const response = await fetchCallReadOnlyFunction({
      contractAddress: CONTRACT_ADDRESS,
      contractName: REWARD_CONTRACT_NAME,
      functionName: 'get-reward-pool-balance',
      functionArgs: [],
      network: NETWORK,
      senderAddress: CONTRACT_ADDRESS,
    });

    const json = cvToJSON(response);
    if (json?.success === true) {
      return Number(json.value?.value || 0);
    }
    return Number(json?.value || 0);
  },

  async readIsMilestoneClaimed(habitId: number, milestone: number): Promise<boolean> {
    const response = await fetchCallReadOnlyFunction({
      contractAddress: CONTRACT_ADDRESS,
      contractName: REWARD_CONTRACT_NAME,
      functionName: 'is-milestone-claimed',
      functionArgs: [
        { type: 'uint', value: habitId.toString() } as any,
        { type: 'uint', value: milestone.toString() } as any,
      ],
      network: NETWORK,
      senderAddress: CONTRACT_ADDRESS,
    });

    const json = cvToJSON(response);
    // is-milestone-claimed returns a bare bool, not ok-wrapped.
    // cvToJSON renders it as { type: 'bool', value: true/false }.
    if (json?.type === 'bool') {
      return Boolean(json.value);
    }
    return json?.success === true ? Boolean(json.value?.value) : Boolean(json?.value);
  },

  async claimMilestoneReward(habitId: number, milestone: number): Promise<string> {
    const userAddress = walletService.getAddress();
    if (!userAddress) {
      throw new Error('Wallet not connected');
    }

    return new Promise((resolve, reject) => {
      showContractCall({
        contractAddress: CONTRACT_ADDRESS,
        contractName: REWARD_CONTRACT_NAME,
        functionName: 'claim-milestone-reward',
        functionArgs: [
          { type: 'uint', value: habitId.toString() } as any,
          { type: 'uint', value: milestone.toString() } as any,
        ],
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

  async fundRewardPool(amount: number): Promise<string> {
    return new Promise((resolve, reject) => {
      showContractCall({
        contractAddress: CONTRACT_ADDRESS,
        contractName: REWARD_CONTRACT_NAME,
        functionName: 'fund-reward-pool',
        functionArgs: [{ type: 'uint', value: amount.toString() } as any],
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
