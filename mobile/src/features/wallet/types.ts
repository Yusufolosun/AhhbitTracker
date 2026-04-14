import type { ContractCallPreview, MobileTxType } from '@/core/types';

export type WalletReturnStatus = 'success' | 'cancelled' | 'expired';

export interface WalletPreviewLinkPayload {
  version: 1;
  preview: ContractCallPreview;
}

export interface WalletReturnLinkPayload {
  version: 1;
  txId: string;
  status: WalletReturnStatus;
  functionName?: MobileTxType;
}

export interface WalletInteractionRouteParams {
  payload?: string;
  result?: string;
}

export interface WalletInteractionState {
  preview: ContractCallPreview | null;
  previewLink: string | null;
  returnLink: string | null;
  txId: string | null;
  status: WalletReturnStatus | null;
  functionName: MobileTxType | null;
}
