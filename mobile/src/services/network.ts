import { STACKS_MAINNET, STACKS_TESTNET, createNetwork } from '@stacks/network';
import { networkConfig } from '../config/env';

const selectedNetwork = networkConfig.networkMode === 'testnet' ? STACKS_TESTNET : STACKS_MAINNET;

export const stacksNetwork = createNetwork({
  network: networkConfig.networkMode,
  client: {
    baseUrl: networkConfig.hiroApiBaseUrl,
  },
});

export const chainId = selectedNetwork.chainId;
