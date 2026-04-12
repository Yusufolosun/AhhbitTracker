import { describe, expect, it } from 'vitest';
import { resolveMobileNetworkConfig, toAppStage } from '../mobile/src/core/config/stacksConfig';

describe('mobile stacks config resolver', () => {
  it('defaults invalid stage values to production', () => {
    expect(toAppStage(undefined)).toBe('production');
    expect(toAppStage('invalid')).toBe('production');
  });

  it('resolves a valid mainnet config', () => {
    const config = resolveMobileNetworkConfig({
      appStage: 'production',
      stacksNetwork: 'mainnet',
      hiroApiBaseUrl: 'https://api.mainnet.hiro.so',
      contractAddress: 'SP1N3809W9CBWWX04KN3TCQHP8A9GN520BD4JMP8Z',
      contractName: 'habit-tracker-v2',
    });

    expect(config.networkMode).toBe('mainnet');
    expect(config.hiroApiBaseUrl).toBe('https://api.mainnet.hiro.so');
  });

  it('rejects invalid contract addresses', () => {
    expect(() =>
      resolveMobileNetworkConfig({
        appStage: 'production',
        stacksNetwork: 'mainnet',
        hiroApiBaseUrl: 'https://api.mainnet.hiro.so',
        contractAddress: 'bad-address',
        contractName: 'habit-tracker-v2',
      }),
    ).toThrow('Invalid Stacks address');
  });

  it('rejects network/API mismatches', () => {
    expect(() =>
      resolveMobileNetworkConfig({
        appStage: 'production',
        stacksNetwork: 'mainnet',
        hiroApiBaseUrl: 'https://api.testnet.hiro.so',
        contractAddress: 'SP1N3809W9CBWWX04KN3TCQHP8A9GN520BD4JMP8Z',
        contractName: 'habit-tracker-v2',
      }),
    ).toThrow('points to testnet');
  });
});
