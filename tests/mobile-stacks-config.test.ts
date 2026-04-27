import { describe, expect, it } from 'vitest';
import { resolveMobileNetworkConfig, toAppStage } from '../mobile/src/core/config/stacksConfig';

describe('mobile stacks config resolver', () => {
  it('defaults invalid stage values to production', () => {
    expect(toAppStage(undefined)).toBe('production');
    expect(toAppStage('invalid')).toBe('production');
    expect(toAppStage('  STAGING  ')).toBe('staging');
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

  it('uses stage defaults when optional values are omitted', () => {
    const config = resolveMobileNetworkConfig({
      appStage: 'development',
    });

    expect(config.appStage).toBe('development');
    expect(config.networkMode).toBe('testnet');
    expect(config.hiroApiBaseUrl).toBe('https://api.testnet.hiro.so');
  });

  it('accepts localhost http API URL for local development', () => {
    const config = resolveMobileNetworkConfig({
      appStage: 'development',
      stacksNetwork: 'testnet',
      hiroApiBaseUrl: 'http://localhost:3999',
      contractAddress: 'ST1M46W6CVGAMH3ZJD3TKMY5KCY48HWAZK1GA0CF0',
      contractName: 'habit-tracker-v2',
    });

    expect(config.hiroApiBaseUrl).toBe('http://localhost:3999');
  });

  it('rejects non-localhost http API URLs', () => {
    expect(() =>
      resolveMobileNetworkConfig({
        appStage: 'production',
        stacksNetwork: 'mainnet',
        hiroApiBaseUrl: 'http://api.mainnet.hiro.so',
        contractAddress: 'SP1N3809W9CBWWX04KN3TCQHP8A9GN520BD4JMP8Z',
        contractName: 'habit-tracker-v2',
      }),
    ).toThrow('must use https');
  });

  it('rejects invalid contract names', () => {
    expect(() =>
      resolveMobileNetworkConfig({
        appStage: 'production',
        stacksNetwork: 'mainnet',
        hiroApiBaseUrl: 'https://api.mainnet.hiro.so',
        contractAddress: 'SP1N3809W9CBWWX04KN3TCQHP8A9GN520BD4JMP8Z',
        contractName: '2invalid',
      }),
    ).toThrow('Invalid contract name');
  });
});
