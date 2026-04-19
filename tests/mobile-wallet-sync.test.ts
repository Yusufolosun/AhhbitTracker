import { afterEach, describe, expect, it, vi } from 'vitest';
import {
  fetchWalletTransactionStatus,
  getWalletInteractionSyncTargets,
} from '../mobile/src/features/wallet/transactionSync';

const originalFetch = globalThis.fetch;

afterEach(() => {
  globalThis.fetch = originalFetch;
  vi.restoreAllMocks();
});

describe('mobile wallet transaction sync targets', () => {
  it('keeps habit queries fresh for create and check-in actions', () => {
    expect(getWalletInteractionSyncTargets('create-habit')).toEqual({
      invalidateHabits: true,
      invalidateUserStats: true,
      invalidatePoolBalance: false,
    });

    expect(getWalletInteractionSyncTargets('check-in')).toEqual({
      invalidateHabits: true,
      invalidateUserStats: true,
      invalidatePoolBalance: false,
    });
  });

  it('refreshes pool state for withdrawal and bonus claims', () => {
    expect(getWalletInteractionSyncTargets('withdraw-stake')).toEqual({
      invalidateHabits: true,
      invalidateUserStats: true,
      invalidatePoolBalance: true,
    });

    expect(getWalletInteractionSyncTargets('claim-bonus')).toEqual({
      invalidateHabits: true,
      invalidateUserStats: true,
      invalidatePoolBalance: true,
    });
  });

  it('falls back to refreshing every habit query when the function is unknown', () => {
    expect(getWalletInteractionSyncTargets(null)).toEqual({
      invalidateHabits: true,
      invalidateUserStats: true,
      invalidatePoolBalance: true,
    });
  });

  it('maps successful tx status to confirmed', async () => {
    globalThis.fetch = vi.fn().mockResolvedValue({
      ok: true,
      status: 200,
      json: async () => ({ tx_status: 'success' }),
    } as Response) as unknown as typeof fetch;

    await expect(fetchWalletTransactionStatus('0xtx')).resolves.toBe('confirmed');
  });

  it('maps aborted tx status to failed', async () => {
    globalThis.fetch = vi.fn().mockResolvedValue({
      ok: true,
      status: 200,
      json: async () => ({ tx_status: 'abort_by_response' }),
    } as Response) as unknown as typeof fetch;

    await expect(fetchWalletTransactionStatus('0xtx')).resolves.toBe('failed');
  });

  it('treats missing tx status as pending', async () => {
    globalThis.fetch = vi.fn().mockResolvedValue({
      ok: false,
      status: 404,
      json: async () => ({}),
    } as Response) as unknown as typeof fetch;

    await expect(fetchWalletTransactionStatus('0xtx')).resolves.toBe('pending');
  });
});