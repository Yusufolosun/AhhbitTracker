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
  it('keeps sync targets deterministic for all supported transaction types', () => {
    const cases = [
      ['create-habit', false],
      ['check-in', false],
      ['withdraw-stake', true],
      ['claim-bonus', true],
    ] as const;

    for (const [functionName, expectsPoolRefresh] of cases) {
      const result = getWalletInteractionSyncTargets(functionName);

      expect(result).toEqual({
        invalidateHabits: true,
        invalidateUserStats: true,
        invalidatePoolBalance: expectsPoolRefresh,
      });
    }
  });

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

    expect(getWalletInteractionSyncTargets('unexpected' as any)).toEqual({
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
    } as Response) as any;

    await expect(fetchWalletTransactionStatus('0xtx-success')).resolves.toBe('confirmed');
  });

  it('maps aborted tx status to failed', async () => {
    globalThis.fetch = vi.fn().mockResolvedValue({
      ok: true,
      status: 200,
      json: async () => ({ tx_status: 'abort_by_response' }),
    } as Response) as any;

    await expect(fetchWalletTransactionStatus('0xtx-abort')).resolves.toBe('failed');
  });

  it('treats missing tx status as pending', async () => {
    globalThis.fetch = vi.fn().mockResolvedValue({
      ok: false,
      status: 404,
      json: async () => ({}),
    } as Response) as any;

    await expect(fetchWalletTransactionStatus('0xtx-missing')).resolves.toBe('pending');
  });

  it('maps uppercase status field from fallback payload key to confirmed', async () => {
    globalThis.fetch = vi.fn().mockResolvedValue({
      ok: true,
      status: 200,
      json: async () => ({ status: 'SUCCESS' }),
    } as Response) as any;

    await expect(fetchWalletTransactionStatus('0xtx-uppercase')).resolves.toBe('confirmed');
  });

  it('treats unknown successful statuses as pending', async () => {
    globalThis.fetch = vi.fn().mockResolvedValue({
      ok: true,
      status: 200,
      json: async () => ({ tx_status: 'pending' }),
    } as Response) as any;

    await expect(fetchWalletTransactionStatus('0xtx-pending')).resolves.toBe('pending');
  });

  it('returns pending when Hiro API request throws unexpectedly', async () => {
    globalThis.fetch = vi.fn().mockRejectedValue(new Error('network interrupted')) as any;

    await expect(fetchWalletTransactionStatus('0xtx-error')).resolves.toBe('pending');
  });
});