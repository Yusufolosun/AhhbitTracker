import { describe, expect, it } from 'vitest';
import {
  buildWalletPreviewLink,
  buildWalletReturnLink,
  hasWalletInteractionPayload,
  parseWalletInteractionState,
} from '../mobile/src/features/wallet/linking';
import type { ContractCallPreview } from '../mobile/src/core/types';

describe('wallet deep-link helpers', () => {
  const preview: ContractCallPreview = {
    contractAddress: 'SP1N3809W9CBWWX04KN3TCQHP8A9GN520BD4JMP8Z',
    contractName: 'habit-tracker-v2',
    functionName: 'check-in',
    functionArgsHex: ['0x01'],
    postConditionMode: 'Deny',
    postConditions: [],
  };

  it('builds and parses preview links', () => {
    const link = buildWalletPreviewLink(preview);

    expect(link).toContain('preview');
    expect(link).toContain('payload=');
    expect(hasWalletInteractionPayload(link)).toBe(true);

    const parsed = parseWalletInteractionState(link);

    expect(parsed?.preview).toEqual(preview);
    expect(parsed?.previewLink).toBe(link);
    expect(parsed?.returnLink).toBeNull();
    expect(parsed?.txId).toBeNull();
    expect(parsed?.status).toBeNull();
  });

  it('builds and parses return links', () => {
    const link = buildWalletReturnLink('0xabc', 'success');

    expect(link).toContain('preview');
    expect(link).toContain('result=');

    const parsed = parseWalletInteractionState(link);

    expect(parsed?.preview).toBeNull();
    expect(parsed?.returnLink).toBe(link);
    expect(parsed?.txId).toBe('0xabc');
    expect(parsed?.status).toBe('success');
  });

  it('rejects unrelated urls', () => {
    expect(parseWalletInteractionState('https://example.com')).toBeNull();
    expect(hasWalletInteractionPayload('https://example.com')).toBe(false);
  });
});
