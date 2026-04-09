import { createNetwork } from '@stacks/network';

export type NetworkMode = 'mainnet' | 'testnet';

export interface NetworkFactoryOptions {
  mode: NetworkMode;
  baseUrl?: string;
}

export function defaultHiroApiBaseUrl(mode: NetworkMode): string {
  return mode === 'mainnet' ? 'https://api.mainnet.hiro.so' : 'https://api.testnet.hiro.so';
}

export function createStacksNetwork(options: NetworkFactoryOptions) {
  return createNetwork({
    network: options.mode,
    client: {
      baseUrl: options.baseUrl ?? defaultHiroApiBaseUrl(options.mode),
    },
  });
}