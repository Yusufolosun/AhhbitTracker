import { STACKS_MAINNET, STACKS_TESTNET } from '@stacks/network';
import { createStacksNetwork } from '@yusufolosun/ahhbit-tracker-sdk';
import { networkConfig } from '@/core/config';

const selectedNetwork = networkConfig.networkMode === 'testnet' ? STACKS_TESTNET : STACKS_MAINNET;

export const stacksNetwork = createStacksNetwork({
  mode: networkConfig.networkMode,
  baseUrl: networkConfig.hiroApiBaseUrl,
});

export const chainId = selectedNetwork.chainId;
