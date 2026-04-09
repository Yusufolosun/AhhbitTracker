import { cvToJSON, fetchCallReadOnlyFunction } from '@stacks/transactions';
import { resolveContract } from './contract';
import { toContractInteractionError } from './query-error';
import { computeRetryDelay, mergeRetryOptions, sleep } from './query-retry';
import { withTimeout } from './query-timeout';
import type { ReadOnlyQueryRequest } from './query-types';

type QueryParser<T> = (json: unknown) => T;

export async function queryReadOnlyJson(request: ReadOnlyQueryRequest): Promise<unknown> {
  const contract = resolveContract(request.contract);
  const retry = mergeRetryOptions(request.options?.retry);
  const senderAddress = request.options?.senderAddress ?? contract.contractAddress;
  const maxAttempts = retry.maxRetries + 1;

  for (let attempt = 1; attempt <= maxAttempts; attempt++) {
    try {
      const clarityValue = await withTimeout(
        fetchCallReadOnlyFunction({
          contractAddress: contract.contractAddress,
          contractName: contract.contractName,
          functionName: request.functionName,
          functionArgs: request.functionArgs,
          network: request.network,
          senderAddress,
        }),
        request.options?.timeoutMs,
      );

      return cvToJSON(clarityValue);
    } catch (error) {
      const normalized = toContractInteractionError(error, {
        functionName: request.functionName,
        contractAddress: contract.contractAddress,
        contractName: contract.contractName,
      });

      const shouldRetry = normalized.retriable && attempt < maxAttempts;
      if (!shouldRetry) {
        throw normalized;
      }

      await sleep(computeRetryDelay(attempt, retry));
    }
  }

  throw new Error('Unreachable query retry state');
}

export async function queryReadOnly<T>(
  request: ReadOnlyQueryRequest,
  parser: QueryParser<T>,
): Promise<T> {
  const json = await queryReadOnlyJson(request);
  return parser(json);
}