import { describe, expect, it } from 'vitest';
import { appStateActions } from '../mobile/src/app/state/actions';

describe('mobile app state actions', () => {
  it('creates hydration actions', () => {
    expect(appStateActions.hydrateStart()).toEqual({ type: 'hydrate:start' });
    expect(appStateActions.hydrateComplete('SP123')).toEqual({
      type: 'hydrate:complete',
      payload: { trackedAddress: 'SP123' },
    });
  });

  it('creates address actions', () => {
    expect(appStateActions.setAddress('SPABC')).toEqual({
      type: 'address:set',
      payload: { trackedAddress: 'SPABC' },
    });
    expect(appStateActions.clearAddress()).toEqual({ type: 'address:clear' });
  });

  it('creates preview actions', () => {
    const preview = {
      contractAddress: 'SP1N3809W9CBWWX04KN3TCQHP8A9GN520BD4JMP8Z',
      contractName: 'habit-tracker-v2',
      functionName: 'create-habit' as const,
      functionArgsHex: ['0x01'],
      postConditionMode: 'Deny',
      postConditions: [],
    };

    expect(appStateActions.setPreview(preview)).toEqual({
      type: 'preview:set',
      payload: { preview },
    });
    expect(appStateActions.clearPreview()).toEqual({ type: 'preview:clear' });
  });

  it('creates wallet interaction actions', () => {
    const walletInteraction = {
      preview: null,
      previewLink: null,
      returnLink: 'ahhbittracker://preview?result=abc',
      txId: '0xtx-1',
      status: 'success' as const,
      functionName: 'check-in' as const,
    };

    expect(appStateActions.setWalletInteraction(walletInteraction)).toEqual({
      type: 'wallet-interaction:set',
      payload: { walletInteraction },
    });
    expect(appStateActions.clearWalletInteraction()).toEqual({ type: 'wallet-interaction:clear' });
  });
});
