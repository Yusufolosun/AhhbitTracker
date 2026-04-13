import type { ContractCallPreview } from '@/core/types';

export type WalletReturnStatus = 'success' | 'cancelled' | 'expired';

export interface WalletPreviewLinkPayload {
  version: 1;
  preview: ContractCallPreview;
}

export interface WalletReturnLinkPayload {
  version: 1;
  txId: string;
  status: WalletReturnStatus;
}

export interface WalletInteractionState {
  preview: ContractCallPreview | null;
  previewLink: string | null;
  returnLink: string | null;
  txId: string | null;
  status: WalletReturnStatus | null;
}
