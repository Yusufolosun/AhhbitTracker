/**
 * @module accountabilityService
 * Service for interacting with the Habit Accountability Group smart contract.
 */
import { showContractCall } from '@stacks/connect';
import { cvToJSON, fetchCallReadOnlyFunction } from '@stacks/transactions';
import {
  ACCOUNTABILITY_CONTRACT_NAME,
  CONTRACT_ADDRESS,
  NETWORK,
} from '../utils/constants';
import { walletService } from './walletService';

/** Application details for wallet transaction popups. */
const appDetails = {
  name: 'AhhbitTracker',
  icon: window.location.origin + '/logos/icon-only-dark.jpg',
};

export const accountabilityService = {
  async readGroup(groupId: number): Promise<any> {
    const response = await fetchCallReadOnlyFunction({
      contractAddress: CONTRACT_ADDRESS,
      contractName: ACCOUNTABILITY_CONTRACT_NAME,
      functionName: 'get-group',
      functionArgs: [{ type: 'uint', value: groupId.toString() } as any],
      network: NETWORK,
      senderAddress: CONTRACT_ADDRESS,
    });

    const json = cvToJSON(response);
    if (json?.success === true) {
      return json.value?.value;
    }
    return json?.value;
  },

  async readGroupMembers(groupId: number): Promise<string[]> {
    const response = await fetchCallReadOnlyFunction({
      contractAddress: CONTRACT_ADDRESS,
      contractName: ACCOUNTABILITY_CONTRACT_NAME,
      functionName: 'get-group-members',
      functionArgs: [{ type: 'uint', value: groupId.toString() } as any],
      network: NETWORK,
      senderAddress: CONTRACT_ADDRESS,
    });

    const json = cvToJSON(response);
    const value = json?.success === true ? json.value?.value : json?.value;
    return value?.members?.value?.map((v: any) => v.value) || [];
  },

  async readMemberInfo(groupId: number, memberAddress: string): Promise<any> {
    const response = await fetchCallReadOnlyFunction({
      contractAddress: CONTRACT_ADDRESS,
      contractName: ACCOUNTABILITY_CONTRACT_NAME,
      functionName: 'get-member-info',
      functionArgs: [
        { type: 'uint', value: groupId.toString() } as any,
        { type: 'principal', value: memberAddress } as any,
      ],
      network: NETWORK,
      senderAddress: CONTRACT_ADDRESS,
    });

    const json = cvToJSON(response);
    if (json?.success === true) {
      return json.value?.value;
    }
    return json?.value;
  },

  async readUserGroups(userAddress: string): Promise<number[]> {
    const response = await fetchCallReadOnlyFunction({
      contractAddress: CONTRACT_ADDRESS,
      contractName: ACCOUNTABILITY_CONTRACT_NAME,
      functionName: 'get-member-groups-list',
      functionArgs: [{ type: 'principal', value: userAddress } as any],
      network: NETWORK,
      senderAddress: CONTRACT_ADDRESS,
    });

    const json = cvToJSON(response);
    const value = json?.success === true ? json.value?.value : json?.value;
    return value?.['group-ids']?.value?.map((v: any) => Number(v.value)) || [];
  },

  async createGroup(stakeAmount: number, duration: number, habitId: number): Promise<string> {
    const userAddress = walletService.getAddress();
    if (!userAddress) {
      throw new Error('Wallet not connected');
    }

    return new Promise((resolve, reject) => {
      showContractCall({
        contractAddress: CONTRACT_ADDRESS,
        contractName: ACCOUNTABILITY_CONTRACT_NAME,
        functionName: 'create-group',
        functionArgs: [
          { type: 'uint', value: stakeAmount.toString() } as any,
          { type: 'uint', value: duration.toString() } as any,
          { type: 'uint', value: habitId.toString() } as any,
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

  async joinGroup(groupId: number, habitId: number): Promise<string> {
    const userAddress = walletService.getAddress();
    if (!userAddress) {
      throw new Error('Wallet not connected');
    }

    return new Promise((resolve, reject) => {
      showContractCall({
        contractAddress: CONTRACT_ADDRESS,
        contractName: ACCOUNTABILITY_CONTRACT_NAME,
        functionName: 'join-group',
        functionArgs: [
          { type: 'uint', value: groupId.toString() } as any,
          { type: 'uint', value: habitId.toString() } as any,
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

  async settleMember(groupId: number, memberAddress: string): Promise<string> {
    return new Promise((resolve, reject) => {
      showContractCall({
        contractAddress: CONTRACT_ADDRESS,
        contractName: ACCOUNTABILITY_CONTRACT_NAME,
        functionName: 'settle-member',
        functionArgs: [
          { type: 'uint', value: groupId.toString() } as any,
          { type: 'principal', value: memberAddress } as any,
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

  async claimGroupReward(groupId: number): Promise<string> {
    return new Promise((resolve, reject) => {
      showContractCall({
        contractAddress: CONTRACT_ADDRESS,
        contractName: ACCOUNTABILITY_CONTRACT_NAME,
        functionName: 'claim-group-reward',
        functionArgs: [{ type: 'uint', value: groupId.toString() } as any],
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
