import { STACKS_MAINNET, STACKS_TESTNET } from '@stacks/network';
import { networkConfig } from '@/core/config';

const selectedNetwork = networkConfig.networkMode === 'testnet' ? STACKS_TESTNET : STACKS_MAINNET;

/** The Stacks network instance resolved from the current configuration mode. */
export const stacksNetwork = selectedNetwork;

export const chainId = selectedNetwork.chainId;
