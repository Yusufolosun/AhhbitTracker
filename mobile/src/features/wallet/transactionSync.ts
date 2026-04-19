import type { MobileTxType } from '../../core/types';
import { fetchHiroJson, HiroApiError } from '../../core/network';

export interface WalletInteractionSyncTargets {
  invalidateHabits: boolean;
  invalidateUserStats: boolean;
  invalidatePoolBalance: boolean;
}

const FALLBACK_SYNC_TARGETS: WalletInteractionSyncTargets = {
  invalidateHabits: true,
  invalidateUserStats: true,
  invalidatePoolBalance: true,
};

const SYNC_TARGETS: Record<MobileTxType, WalletInteractionSyncTargets> = {
  'create-habit': {
    invalidateHabits: true,
    invalidateUserStats: true,
    invalidatePoolBalance: false,
  },
  'check-in': {
    invalidateHabits: true,
    invalidateUserStats: true,
    invalidatePoolBalance: false,
  },
  'withdraw-stake': {
    invalidateHabits: true,
    invalidateUserStats: true,
    invalidatePoolBalance: true,
  },
  'claim-bonus': {
    invalidateHabits: true,
    invalidateUserStats: true,
    invalidatePoolBalance: true,
  },
};

export type WalletTransactionStatus = 'pending' | 'confirmed' | 'failed';

export function getWalletInteractionSyncTargets(
  functionName: MobileTxType | null,
): WalletInteractionSyncTargets {
  if (!functionName) {
    return FALLBACK_SYNC_TARGETS;
  }

  return SYNC_TARGETS[functionName] ?? FALLBACK_SYNC_TARGETS;
}

export async function fetchWalletTransactionStatus(txId: string): Promise<WalletTransactionStatus> {
  try {
    const payload = await fetchHiroJson<any>(`/extended/v1/tx/${txId}`, {
      ttlMs: 5_000,
      retries: 1,
    });
    const status = String(payload.tx_status ?? payload.status ?? '').toLowerCase();

    if (status === 'success') {
      return 'confirmed';
    }

    if (status.startsWith('abort')) {
      return 'failed';
    }

    return 'pending';
  } catch (error) {
    if (error instanceof HiroApiError && error.status === 404) {
      return 'pending';
    }

    return 'pending';
  }
}