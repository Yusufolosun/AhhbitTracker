import { describe, it, expect } from 'vitest';
import {
  MAINNET_CONTRACT,
  MIN_STAKE_AMOUNT,
  MAX_HABIT_NAME_LENGTH,
  CHECK_IN_WINDOW,
  MIN_STREAK_FOR_WITHDRAWAL,
  ErrorCode,
  errorMessages,
} from '../src/constants';

describe('constants', () => {
  it('exports mainnet contract identifiers', () => {
    expect(MAINNET_CONTRACT.contractAddress).toBe(
      'SP1N3809W9CBWWX04KN3TCQHP8A9GN520BD4JMP8Z',
    );
    expect(MAINNET_CONTRACT.contractName).toBe('habit-tracker-v2');
  });

  it('matches on-chain constant values', () => {
    expect(MIN_STAKE_AMOUNT).toBe(20_000);
    expect(MAX_HABIT_NAME_LENGTH).toBe(50);
    expect(CHECK_IN_WINDOW).toBe(144);
    expect(MIN_STREAK_FOR_WITHDRAWAL).toBe(7);
  });

  it('defines all error codes', () => {
    expect(ErrorCode.NOT_AUTHORIZED).toBe(100);
    expect(ErrorCode.INVALID_STAKE_AMOUNT).toBe(101);
    expect(ErrorCode.INVALID_HABIT_NAME).toBe(102);
    expect(ErrorCode.HABIT_NOT_FOUND).toBe(103);
    expect(ErrorCode.NOT_HABIT_OWNER).toBe(104);
    expect(ErrorCode.ALREADY_CHECKED_IN).toBe(105);
    expect(ErrorCode.CHECK_IN_WINDOW_EXPIRED).toBe(106);
    expect(ErrorCode.INSUFFICIENT_STREAK).toBe(107);
    expect(ErrorCode.HABIT_ALREADY_COMPLETED).toBe(108);
    expect(ErrorCode.POOL_INSUFFICIENT_BALANCE).toBe(109);
    expect(ErrorCode.TRANSFER_FAILED).toBe(110);
    expect(ErrorCode.BONUS_ALREADY_CLAIMED).toBe(111);
  });

  it('has an error message for every error code', () => {
    const codes = Object.values(ErrorCode);
    for (const code of codes) {
      expect(errorMessages[code]).toBeDefined();
      expect(typeof errorMessages[code]).toBe('string');
    }
  });
});
