import { describe, expect, it } from 'vitest';
import { resolveFrontendRuntimeConfig, toFrontendStage } from '../utils/stacksConfig';

describe('stacksConfig', () => {
  it('derives stage from dev mode when no explicit stage is set', () => {
    expect(toFrontendStage(undefined, true, 'development')).toBe('development');
    expect(toFrontendStage(undefined, false, 'production')).toBe('production');
  });

  it('resolves a valid production config', () => {
    const config = resolveFrontendRuntimeConfig({
      MODE: 'production',
      DEV: false,
      VITE_APP_STAGE: 'production',
      VITE_STACKS_NETWORK: 'mainnet',
      VITE_STACKS_API_URL: 'https://api.mainnet.hiro.so',
      VITE_CONTRACT_ADDRESS: 'SP1N3809W9CBWWX04KN3TCQHP8A9GN520BD4JMP8Z',
      VITE_CONTRACT_NAME: 'habit-tracker-v2',
      VITE_APP_URL: 'https://ahhbit-tracker.vercel.app',
    });

    expect(config.stacksNetwork).toBe('mainnet');
    expect(config.stacksApiUrl).toBe('https://api.mainnet.hiro.so');
    expect(config.contractAddress).toBe('SP1N3809W9CBWWX04KN3TCQHP8A9GN520BD4JMP8Z');
  });

  it('rejects network/api mismatches', () => {
    expect(() =>
      resolveFrontendRuntimeConfig({
        MODE: 'production',
        DEV: false,
        VITE_APP_STAGE: 'production',
        VITE_STACKS_NETWORK: 'mainnet',
        VITE_STACKS_API_URL: 'https://api.testnet.hiro.so',
        VITE_CONTRACT_ADDRESS: 'SP1N3809W9CBWWX04KN3TCQHP8A9GN520BD4JMP8Z',
        VITE_CONTRACT_NAME: 'habit-tracker-v2',
        VITE_APP_URL: 'https://ahhbit-tracker.vercel.app',
      }),
    ).toThrow('points to testnet');
  });

  it('rejects malformed contract addresses', () => {
    expect(() =>
      resolveFrontendRuntimeConfig({
        MODE: 'production',
        DEV: false,
        VITE_APP_STAGE: 'production',
        VITE_STACKS_NETWORK: 'mainnet',
        VITE_STACKS_API_URL: 'https://api.mainnet.hiro.so',
        VITE_CONTRACT_ADDRESS: 'not-an-address',
        VITE_CONTRACT_NAME: 'habit-tracker-v2',
        VITE_APP_URL: 'https://ahhbit-tracker.vercel.app',
      }),
    ).toThrow('Invalid Stacks address');
  });
});
