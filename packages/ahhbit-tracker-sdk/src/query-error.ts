import type { ContractInteractionErrorContext } from './query-types';

const RATE_LIMIT_CODE = 429;

function extractErrorCode(message: string): number | undefined {
  const match = message.match(/u(\d{2,4})/i);
  if (!match) return undefined;
  return Number(match[1]);
}

function inferStatusCode(error: unknown): number | undefined {
  if (!error || typeof error !== 'object') return undefined;

  if ('status' in error && typeof (error as { status?: unknown }).status === 'number') {
    return (error as { status: number }).status;
  }

  if ('statusCode' in error && typeof (error as { statusCode?: unknown }).statusCode === 'number') {
    return (error as { statusCode: number }).statusCode;
  }

  return undefined;
}

function inferRetriable(message: string, statusCode?: number): boolean {
  if (statusCode === RATE_LIMIT_CODE) return true;

  const lower = message.toLowerCase();
  if (lower.includes('timeout') || lower.includes('timed out')) return true;
  if (lower.includes('429') || lower.includes('rate limit')) return true;
  if (lower.includes('network') || lower.includes('failed to fetch')) return true;
  return false;
}

export class ContractInteractionError extends Error {
  readonly functionName?: string;
  readonly contractAddress?: string;
  readonly contractName?: string;
  readonly statusCode?: number;
  readonly retriable: boolean;
  readonly errorCode?: number;

  constructor(message: string, context: ContractInteractionErrorContext = {}, cause?: unknown) {
    super(message, { cause });
    this.name = 'ContractInteractionError';
    this.functionName = context.functionName;
    this.contractAddress = context.contractAddress;
    this.contractName = context.contractName;
    this.statusCode = context.statusCode;
    this.retriable = context.retriable ?? inferRetriable(message, context.statusCode);
    this.errorCode = extractErrorCode(message);
  }
}

export function toContractInteractionError(
  error: unknown,
  context: ContractInteractionErrorContext = {},
): ContractInteractionError {
  if (error instanceof ContractInteractionError) {
    return error;
  }

  const message = error instanceof Error ? error.message : 'Unknown contract interaction failure';
  const statusCode = context.statusCode ?? inferStatusCode(error);
  const retriable = context.retriable ?? inferRetriable(message, statusCode);

  return new ContractInteractionError(
    message,
    {
      ...context,
      statusCode,
      retriable,
    },
    error,
  );
}