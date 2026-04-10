import { STACKS_MAINNET, STACKS_TESTNET } from '@stacks/network';
import { networkConfig } from '@/core/config';

const selectedNetwork = networkConfig.networkMode === 'testnet' ? STACKS_TESTNET : STACKS_MAINNET;

export const stacksNetwork = selectedNetwork;

export const chainId = selectedNetwork.chainId;
