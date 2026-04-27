import { beforeAll, describe, expect, it, vi } from 'vitest';
import type { ContractCallPreview } from '../mobile/src/core/types';

vi.mock('@/core/config', () => ({
  APP_LINK_SCHEME: 'ahhbittracker',
}));

vi.mock(
  'expo-linking',
  () => ({
    createURL: (path: string) => `ahhbittracker://${path}`,
    parse: (url: string) => {
      const parsed = new URL(url);
      const queryParams = Object.fromEntries(parsed.searchParams.entries());
      return {
        scheme: parsed.protocol.replace(':', ''),
        queryParams,
      };
    },
  }),
  { virtual: true },
);

let buildWalletPreviewLink: (preview: ContractCallPreview) => string;
let buildWalletReturnLink: (
  txId: string,
  status: 'success' | 'cancelled' | 'expired',
  functionName?: ContractCallPreview['functionName'],
) => string;
let parseWalletInteractionState: (url: string) => {
  txId: string | null;
  status: string | null;
  functionName: string | null;
  preview: ContractCallPreview | null;
} | null;

beforeAll(async () => {
  ({
    buildWalletPreviewLink,
    buildWalletReturnLink,
    parseWalletInteractionState,
  } = await import('../mobile/src/features/wallet/linking'));
});

function createPreview(functionName: ContractCallPreview['functionName']): ContractCallPreview {
  return {
    contractAddress: 'SP1N3809W9CBWWX04KN3TCQHP8A9GN520BD4JMP8Z',
    contractName: 'habit-tracker-v2',
    functionName,
    functionArgsHex: ['0x01'],
    postConditionMode: 'Deny',
    postConditions: ['{}'],
  };
}

describe('mobile wallet linking', () => {
  it('builds and parses preview links with serialized payloads', () => {
    const preview = createPreview('create-habit');

    const link = buildWalletPreviewLink(preview);
    const parsed = parseWalletInteractionState(link);

    expect(link).toContain('payload=');
    expect(parsed?.preview).toEqual(preview);
    expect(parsed?.functionName).toBe('create-habit');
    expect(parsed?.txId).toBeNull();
  });

  it('builds and parses wallet return links for confirmed transactions', () => {
    const link = buildWalletReturnLink('0xtx-success', 'success', 'check-in');
    const parsed = parseWalletInteractionState(link);

    expect(link).toContain('result=');
    expect(parsed?.preview).toBeNull();
    expect(parsed?.txId).toBe('0xtx-success');
    expect(parsed?.status).toBe('success');
    expect(parsed?.functionName).toBe('check-in');
  });

  it('supports return links without functionName metadata', () => {
    const link = buildWalletReturnLink('0xtx-cancelled', 'cancelled');
    const parsed = parseWalletInteractionState(link);

    expect(parsed?.txId).toBe('0xtx-cancelled');
    expect(parsed?.status).toBe('cancelled');
    expect(parsed?.functionName).toBeNull();
  });

  it('returns null when link query is missing wallet payload', () => {
    expect(parseWalletInteractionState('ahhbittracker://preview')).toBeNull();
  });
});
