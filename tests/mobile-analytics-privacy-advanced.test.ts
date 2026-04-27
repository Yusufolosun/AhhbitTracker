import { describe, expect, it } from 'vitest';
import { anonymizeAddress, sanitizePayload } from '../mobile/src/analytics/privacy';

describe('mobile analytics privacy advanced behavior', () => {
  it('returns undefined for missing wallet addresses', () => {
    expect(anonymizeAddress(undefined)).toBeUndefined();
    expect(anonymizeAddress(null)).toBeUndefined();
  });

  it('keeps short error messages intact while truncating only long payloads', () => {
    const payload = sanitizePayload({
      source: 'unit-test',
      errorMessage: 'short error',
    });

    expect(payload).toEqual({
      source: 'unit-test',
      errorMessage: 'short error',
    });
  });

  it('produces stable anonymization for mixed-case addresses', () => {
    const upper = anonymizeAddress('SP1N3809W9CBWWX04KN3TCQHP8A9GN520BD4JMP8Z');
    const lower = anonymizeAddress('sp1n3809w9cbwwx04kn3tcqhp8a9gn520bd4jmp8z');

    expect(upper).toBe(lower);
    expect(upper).toHaveLength(8);
  });
});
