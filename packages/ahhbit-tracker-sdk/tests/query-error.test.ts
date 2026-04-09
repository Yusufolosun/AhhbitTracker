import { describe, expect, it } from 'vitest';
import {
  ContractInteractionError,
  toContractInteractionError,
} from '../src/query-error';

describe('ContractInteractionError', () => {
  it('extracts Clarity error code from message text', () => {
    const error = new ContractInteractionError('Contract returned (err u107)');
    expect(error.errorCode).toBe(107);
  });

  it('marks timeout failures as retriable', () => {
    const error = new ContractInteractionError('Read-only query timed out');
    expect(error.retriable).toBe(true);
  });

  it('preserves context metadata', () => {
    const error = new ContractInteractionError('Failure', {
      functionName: 'get-habit',
      contractAddress: 'SP123',
      contractName: 'tracker',
      statusCode: 429,
    });

    expect(error.functionName).toBe('get-habit');
    expect(error.contractAddress).toBe('SP123');
    expect(error.contractName).toBe('tracker');
    expect(error.statusCode).toBe(429);
    expect(error.retriable).toBe(true);
  });
});

describe('toContractInteractionError', () => {
  it('returns existing ContractInteractionError instances unchanged', () => {
    const existing = new ContractInteractionError('already normalized');
    expect(toContractInteractionError(existing)).toBe(existing);
  });

  it('normalizes unknown errors into ContractInteractionError', () => {
    const normalized = toContractInteractionError(new Error('network failed to fetch'));
    expect(normalized).toBeInstanceOf(ContractInteractionError);
    expect(normalized.retriable).toBe(true);
  });
});
