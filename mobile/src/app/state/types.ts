import type { ContractCallPreview } from '@/core/types';
import type { WalletInteractionState } from '@/features/wallet/types';

export interface AppState {
  trackedAddress: string | null;
  isHydrating: boolean;
  preview: ContractCallPreview | null;
  walletInteraction: WalletInteractionState | null;
}

export interface PersistedAppState {
  version: 1;
  trackedAddress: string | null;
}