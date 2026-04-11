import type { ContractCallPreview } from '@/core/types';

export interface AppState {
  trackedAddress: string | null;
  isHydrating: boolean;
  preview: ContractCallPreview | null;
}

export interface PersistedAppState {
  version: 1;
  trackedAddress: string | null;
}