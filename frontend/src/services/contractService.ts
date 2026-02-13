import { openContractCall } from '@stacks/connect';
import { uintCV, stringUtf8CV } from '@stacks/transactions';
import { StacksMainnet } from '@stacks/network';

const NETWORK = new StacksMainnet();
const CONTRACT_ADDRESS = 'SP1M46W6CVGAMH3ZJD3TKMY5KCY48HWAZK0DYG193';
const CONTRACT_NAME = 'habit-tracker';

export async function createHabit(name: string, stakeAmount: number) {
  const functionArgs = [stringUtf8CV(name), uintCV(stakeAmount)];

  return openContractCall({
    contractAddress: CONTRACT_ADDRESS,
    contractName: CONTRACT_NAME,
    functionName: 'create-habit',
    functionArgs,
    network: NETWORK,
    appDetails: {
      name: 'AhhbitTracker',
      icon: window.location.origin + '/logo.png',
    },
  });
}

export async function checkIn(habitId: number) {
  const functionArgs = [uintCV(habitId)];

  return openContractCall({
    contractAddress: CONTRACT_ADDRESS,
    contractName: CONTRACT_NAME,
    functionName: 'check-in',
    functionArgs,
    network: NETWORK,
    appDetails: {
      name: 'AhhbitTracker',
      icon: window.location.origin + '/logo.png',
    },
  });
}
