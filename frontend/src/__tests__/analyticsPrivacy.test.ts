import { describe, expect, it } from 'vitest';
import { anonymizeAddress, sanitizePayload } from '../analytics/privacy';

describe('analytics privacy helpers', () => {
  it('hashes wallet addresses deterministically', () => {
    const address = 'SP1N3809W9CBWWX04KN3TCQHP8A9GN520BD4JMP8Z';
    const first = anonymizeAddress(address);
    const second = anonymizeAddress(address);

    expect(first).toBeDefined();
    expect(first).toBe(second);
    expect(first).not.toContain('SP1N3809');
  });

  it('drops tx ids and truncates long errors', () => {
    const payload = sanitizePayload({
      txId: '0xabc123',
      errorMessage: 'x'.repeat(200),
      habitId: 4,
    });

    expect(payload?.txId).toBeUndefined();
    expect(payload?.habitId).toBe(4);
    expect(payload?.errorMessage?.length).toBeLessThanOrEqual(160);
  });
});