import { describe, expect, it } from 'vitest';
import {
  createStacksNetwork,
  defaultHiroApiBaseUrl,
} from '../src/network';

describe('defaultHiroApiBaseUrl', () => {
  it('returns mainnet Hiro API URL', () => {
    expect(defaultHiroApiBaseUrl('mainnet')).toBe('https://api.mainnet.hiro.so');
  });

  it('returns testnet Hiro API URL', () => {
    expect(defaultHiroApiBaseUrl('testnet')).toBe('https://api.testnet.hiro.so');
  });
});

describe('createStacksNetwork', () => {
  it('uses default baseUrl when none is provided', () => {
    const network = createStacksNetwork({ mode: 'mainnet' });
    expect(network.client.baseUrl).toBe('https://api.mainnet.hiro.so');
  });

  it('uses explicit baseUrl overrides', () => {
    const network = createStacksNetwork({
      mode: 'mainnet',
      baseUrl: 'https://custom-api.example.com',
    });

    expect(network.client.baseUrl).toBe('https://custom-api.example.com');
  });
});
