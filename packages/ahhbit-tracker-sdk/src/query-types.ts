import type { fetchCallReadOnlyFunction } from '@stacks/transactions';
import type { ContractId } from './types';

export type StacksReadOnlyNetwork = Parameters<
  typeof fetchCallReadOnlyFunction
>[0]['network'];

export interface RetryOptions {
  maxRetries: number;
  baseDelayMs: number;
  maxDelayMs: number;
}

export interface ReadOnlyQueryOptions {
  timeoutMs?: number;
  retry?: Partial<RetryOptions>;
  senderAddress?: string;
}

export interface ReadOnlyQueryRequest {
  functionName: string;
  functionArgs: Parameters<typeof fetchCallReadOnlyFunction>[0]['functionArgs'];
  network: StacksReadOnlyNetwork;
  contract?: Partial<ContractId>;
  options?: ReadOnlyQueryOptions;
}

export interface ContractInteractionErrorContext {
  functionName?: string;
  contractAddress?: string;
  contractName?: string;
  statusCode?: number;
  retriable?: boolean;
}