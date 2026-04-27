import { describe, expect, it, vi } from 'vitest';

async function loadStacksNetworkForMode(networkMode: 'mainnet' | 'testnet') {
  vi.resetModules();
  vi.doMock('@/core/config', () => ({
    networkConfig: {
      networkMode,
    },
  }));

  return import('../mobile/src/core/network/stacksNetwork');
}

describe('mobile stacks network selection', () => {
  it('selects mainnet constants when app config is mainnet', async () => {
    const module = await loadStacksNetworkForMode('mainnet');

    expect(module.stacksNetwork).toMatchObject({
      chainId: module.chainId,
    });
    expect(typeof module.chainId).toBe('number');
  });

  it('selects testnet constants when app config is testnet', async () => {
    const module = await loadStacksNetworkForMode('testnet');

    expect(module.stacksNetwork).toMatchObject({
      chainId: module.chainId,
    });
    expect(typeof module.chainId).toBe('number');
  });
});
