import { describe, expect, it } from 'vitest';
import { appStateReducer, createInitialAppState } from '../mobile/src/app/state/reducer';
import type { AppState } from '../mobile/src/app/state/types';

function withState(overrides: Partial<AppState> = {}): AppState {
  return {
    trackedAddress: 'SP1N3809W9CBWWX04KN3TCQHP8A9GN520BD4JMP8Z',
    isHydrating: false,
    preview: {
      contractAddress: 'SP1N3809W9CBWWX04KN3TCQHP8A9GN520BD4JMP8Z',
      contractName: 'habit-tracker-v2',
      functionName: 'check-in',
      functionArgsHex: ['0x01'],
      postConditionMode: 'Deny',
      postConditions: [],
    },
    walletInteraction: {
      preview: null,
      previewLink: null,
      returnLink: 'ahhbittracker://preview?result=x',
      txId: '0xtx-1',
      status: 'success',
      functionName: 'check-in',
    },
    ...overrides,
  };
}

describe('mobile app state reducer', () => {
  it('creates initial state with hydration enabled', () => {
    expect(createInitialAppState()).toEqual({
      trackedAddress: null,
      isHydrating: true,
      preview: null,
      walletInteraction: null,
    });
  });

  it('hydrates state and clears transient preview and wallet interaction', () => {
    const next = appStateReducer(
      withState(),
      {
        type: 'hydrate:complete',
        payload: { trackedAddress: 'ST1M46W6CVGAMH3ZJD3TKMY5KCY48HWAZK1GA0CF0' },
      },
    );

    expect(next).toMatchObject({
      trackedAddress: 'ST1M46W6CVGAMH3ZJD3TKMY5KCY48HWAZK1GA0CF0',
      isHydrating: false,
      preview: null,
      walletInteraction: null,
    });
  });

  it('sets address and clears transient wallet preview state', () => {
    const next = appStateReducer(
      withState(),
      {
        type: 'address:set',
        payload: { trackedAddress: 'SP2CY5V39NHDPWSXMW9QDT3HC3GD6Q6XX4CFRK9AG' },
      },
    );

    expect(next.trackedAddress).toBe('SP2CY5V39NHDPWSXMW9QDT3HC3GD6Q6XX4CFRK9AG');
    expect(next.preview).toBeNull();
    expect(next.walletInteraction).toBeNull();
  });

  it('supports preview and wallet interaction updates independently', () => {
    const withoutPreview = withState({ preview: null, walletInteraction: null });
    const withPreview = appStateReducer(withoutPreview, {
      type: 'preview:set',
      payload: {
        preview: {
          contractAddress: 'SP1N3809W9CBWWX04KN3TCQHP8A9GN520BD4JMP8Z',
          contractName: 'habit-tracker-v2',
          functionName: 'withdraw-stake',
          functionArgsHex: ['0x02'],
          postConditionMode: 'Deny',
          postConditions: [],
        },
      },
    });

    const withInteraction = appStateReducer(withPreview, {
      type: 'wallet-interaction:set',
      payload: {
        walletInteraction: {
          preview: null,
          previewLink: null,
          returnLink: 'ahhbittracker://preview?result=y',
          txId: '0xtx-2',
          status: 'cancelled',
          functionName: 'withdraw-stake',
        },
      },
    });

    expect(withInteraction.preview?.functionName).toBe('withdraw-stake');
    expect(withInteraction.walletInteraction?.status).toBe('cancelled');
  });

  it('returns existing state object for unknown action type', () => {
    const initial = withState();
    const next = appStateReducer(initial, { type: 'unknown:action' } as any);

    expect(next).toBe(initial);
  });
});
