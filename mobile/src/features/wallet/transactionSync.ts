import type { MobileTxType } from '../../core/types';

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

function getHiroApiBaseUrl(): string {
  return (
    process.env.EXPO_PUBLIC_HIRO_API_BASE_URL ??
    (process.env.EXPO_PUBLIC_STACKS_NETWORK === 'testnet'
      ? 'https://api.testnet.hiro.so'
      : 'https://api.mainnet.hiro.so')
  );
}

export function getWalletInteractionSyncTargets(
  functionName: MobileTxType | null,
): WalletInteractionSyncTargets {
  if (!functionName) {
    return FALLBACK_SYNC_TARGETS;
  }

  return SYNC_TARGETS[functionName] ?? FALLBACK_SYNC_TARGETS;
}

export async function fetchWalletTransactionStatus(txId: string): Promise<WalletTransactionStatus> {
  const response = await fetch(`${getHiroApiBaseUrl()}/extended/v1/tx/${txId}`);

  if (!response.ok) {
    return response.status === 404 ? 'pending' : 'pending';
  }

  const payload: any = await response.json();
  const status = String(payload.tx_status ?? payload.status ?? '').toLowerCase();

  if (status === 'success') {
    return 'confirmed';
  }

  if (status.startsWith('abort')) {
    return 'failed';
  }

  return 'pending';
}