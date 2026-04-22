import { describe, expect, it } from 'vitest';
import { anonymizeAddress, sanitizePayload } from '../mobile/src/analytics/privacy';

describe('mobile analytics privacy', () => {
  it('hashes addresses deterministically', () => {
    const address = 'SP1N3809W9CBWWX04KN3TCQHP8A9GN520BD4JMP8Z';
    const first = anonymizeAddress(address);
    const second = anonymizeAddress(address);

    expect(first).toBeDefined();
    expect(first).toBe(second);
    expect(first).not.toContain('SP1N3809');
  });

  it('truncates long error payloads', () => {
    const payload = sanitizePayload({
      errorMessage: 'y'.repeat(400),
      source: 'unit-test',
    });

    expect(payload?.source).toBe('unit-test');
    expect(payload?.errorMessage?.length).toBeLessThanOrEqual(160);
  });
});