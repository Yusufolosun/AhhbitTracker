import { getErrorMessage } from './constants';

export type TrackedTxStatus = 'pending' | 'confirmed' | 'failed';

export interface TransactionStatusSummary {
  status: TrackedTxStatus;
  errorCode?: number;
  errorMessage?: string;
}

export interface HiroTransactionResponse {
  tx_status?: string;
  tx_result?: {
    repr?: string;
  };
}

const CLARITY_ERROR_RE = /^\(err u(\d+)\)$/;

export function normalizeTxId(txId: string): string {
  return txId.startsWith('0x') ? txId : `0x${txId}`;
}

export function extractClarityErrorCode(repr: string | undefined): number | null {
  if (!repr) {
    return null;
  }

  const match = repr.trim().match(CLARITY_ERROR_RE);
  if (!match) {
    return null;
  }

  return Number.parseInt(match[1], 10);
}

export function summarizeTransactionStatus(data: HiroTransactionResponse): TransactionStatusSummary {
  const rawStatus = data.tx_status ?? 'pending';

  if (rawStatus === 'success') {
    return { status: 'confirmed' };
  }

  if (rawStatus === 'pending') {
    return { status: 'pending' };
  }

  const isFailedStatus = rawStatus.startsWith('abort_') || rawStatus.startsWith('dropped_');
  if (!isFailedStatus) {
    return { status: 'pending' };
  }

  const errorCode = extractClarityErrorCode(data.tx_result?.repr);

  if (errorCode === null) {
    return {
      status: 'failed',
      errorMessage: rawStatus,
    };
  }

  return {
    status: 'failed',
    errorCode,
    errorMessage: getErrorMessage(errorCode),
  };
}
