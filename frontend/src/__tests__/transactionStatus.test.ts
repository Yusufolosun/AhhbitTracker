import { describe, expect, it } from 'vitest';
import {
  extractClarityErrorCode,
  normalizeTxId,
  summarizeTransactionStatus,
} from '../utils/transactionStatus';

describe('normalizeTxId', () => {
  it('adds 0x prefix when missing', () => {
    expect(normalizeTxId('abc123')).toBe('0xabc123');
  });

  it('keeps prefixed ids unchanged', () => {
    expect(normalizeTxId('0xabc123')).toBe('0xabc123');
  });
});

describe('extractClarityErrorCode', () => {
  it('parses Clarity error repr values', () => {
    expect(extractClarityErrorCode('(err u105)')).toBe(105);
  });

  it('returns null for non-error repr values', () => {
    expect(extractClarityErrorCode('(ok true)')).toBeNull();
    expect(extractClarityErrorCode(undefined)).toBeNull();
  });
});

describe('summarizeTransactionStatus', () => {
  it('classifies success as confirmed', () => {
    expect(summarizeTransactionStatus({ tx_status: 'success' })).toEqual({ status: 'confirmed' });
  });

  it('classifies pending as pending', () => {
    expect(summarizeTransactionStatus({ tx_status: 'pending' })).toEqual({ status: 'pending' });
  });

  it('classifies abort statuses as failed with decoded message', () => {
    const summary = summarizeTransactionStatus({
      tx_status: 'abort_by_response',
      tx_result: { repr: '(err u114)' },
    });

    expect(summary.status).toBe('failed');
    expect(summary.errorCode).toBe(114);
    expect(summary.errorMessage).toContain('auto-slashed');
  });

  it('keeps raw status when no Clarity error code exists', () => {
    const summary = summarizeTransactionStatus({
      tx_status: 'dropped_replace_by_fee',
      tx_result: { repr: '(ok true)' },
    });

    expect(summary).toEqual({
      status: 'failed',
      errorMessage: 'dropped_replace_by_fee',
    });
  });
});
