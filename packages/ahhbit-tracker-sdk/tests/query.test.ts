import { beforeEach, describe, expect, it, vi } from 'vitest';
import * as stxTx from '@stacks/transactions';
import { queryReadOnly, queryReadOnlyJson } from '../src/query';

vi.mock('@stacks/transactions', async () => {
  const actual = await vi.importActual<typeof stxTx>('@stacks/transactions');
  return {
    ...actual,
    fetchCallReadOnlyFunction: vi.fn(),
  };
});

const mockFetch = stxTx.fetchCallReadOnlyFunction as ReturnType<typeof vi.fn>;
const NETWORK = 'mainnet';

describe('queryReadOnlyJson', () => {
  beforeEach(() => {
    mockFetch.mockReset();
  });

  it('returns cvToJSON output for a successful call', async () => {
    mockFetch.mockResolvedValue(stxTx.Cl.ok(stxTx.Cl.uint(7)));

    const result = await queryReadOnlyJson({
      functionName: 'get-habit-streak',
      functionArgs: [stxTx.Cl.uint(1)],
      network: NETWORK,
    });

    expect(result).toBeTruthy();
    expect(typeof (result as { type?: unknown }).type).toBe('string');
    expect(mockFetch).toHaveBeenCalledWith(
      expect.objectContaining({ functionName: 'get-habit-streak' }),
    );
  });

  it('retries retriable failures and succeeds', async () => {
    mockFetch
      .mockRejectedValueOnce(new Error('Failed to fetch'))
      .mockResolvedValueOnce(stxTx.Cl.ok(stxTx.Cl.uint(3)));

    const result = await queryReadOnlyJson({
      functionName: 'get-total-habits',
      functionArgs: [],
      network: NETWORK,
      options: {
        retry: {
          maxRetries: 1,
          baseDelayMs: 0,
          maxDelayMs: 0,
        },
      },
    });

    expect(result).toBeTruthy();
    expect(typeof (result as { type?: unknown }).type).toBe('string');
    expect(mockFetch).toHaveBeenCalledTimes(2);
  });

  it('throws on non-retriable failures', async () => {
    mockFetch.mockRejectedValue(new Error('Invalid function arguments'));

    await expect(
      queryReadOnlyJson({
        functionName: 'get-habit',
        functionArgs: [stxTx.Cl.uint(1)],
        network: NETWORK,
        options: {
          retry: {
            maxRetries: 1,
            baseDelayMs: 0,
            maxDelayMs: 0,
          },
        },
      }),
    ).rejects.toMatchObject({
      name: 'ContractInteractionError',
      functionName: 'get-habit',
    });

    expect(mockFetch).toHaveBeenCalledTimes(1);
  });
});

describe('queryReadOnly', () => {
  it('applies custom parser to the JSON payload', async () => {
    mockFetch.mockResolvedValue(stxTx.Cl.ok(stxTx.Cl.uint(9)));

    const streak = await queryReadOnly(
      {
        functionName: 'get-habit-streak',
        functionArgs: [stxTx.Cl.uint(1)],
        network: NETWORK,
      },
      (json) => Number((json as { value?: { value?: string } }).value?.value ?? 0),
    );

    expect(streak).toBe(9);
  });
});
