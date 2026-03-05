import { describe, it, expect } from 'vitest';
import {
  buildCreateHabit,
  buildCheckIn,
  buildSlashHabit,
  buildWithdrawStake,
  buildClaimBonus,
} from '../src/client';
import { MAINNET_CONTRACT } from '../src/constants';
import { PostConditionMode } from '@stacks/transactions';

const SENDER = 'SP1M46W6CVGAMH3ZJD3TKMY5KCY48HWAZK0DYG193';
const CUSTOM: { contractAddress: string; contractName: string } = {
  contractAddress: 'ST1SJ3DTE5DN7X54YDH5D64R3BCB6A2AG2ZQ8YPD5',
  contractName: 'custom-tracker',
};

describe('buildCreateHabit', () => {
  it('returns correct function name and args', () => {
    const tx = buildCreateHabit('Exercise', 200_000, SENDER);
    expect(tx.functionName).toBe('create-habit');
    expect(tx.contractAddress).toBe(MAINNET_CONTRACT.contractAddress);
    expect(tx.contractName).toBe(MAINNET_CONTRACT.contractName);
    expect(tx.functionArgs).toHaveLength(2);
    expect(tx.postConditions).toHaveLength(1);
    expect(tx.postConditionMode).toBe(PostConditionMode.Deny);
  });

  it('uses custom contract when provided', () => {
    const tx = buildCreateHabit('Read', 100_000, SENDER, CUSTOM);
    expect(tx.contractAddress).toBe('ST1SJ3DTE5DN7X54YDH5D64R3BCB6A2AG2ZQ8YPD5');
    expect(tx.contractName).toBe('custom-tracker');
  });
});

describe('buildCheckIn', () => {
  it('returns correct function name', () => {
    const tx = buildCheckIn(1);
    expect(tx.functionName).toBe('check-in');
    expect(tx.functionArgs).toHaveLength(1);
    expect(tx.postConditions).toHaveLength(0);
    expect(tx.postConditionMode).toBe(PostConditionMode.Deny);
  });

  it('uses custom contract', () => {
    const tx = buildCheckIn(5, CUSTOM);
    expect(tx.contractAddress).toBe('ST1SJ3DTE5DN7X54YDH5D64R3BCB6A2AG2ZQ8YPD5');
  });
});

describe('buildSlashHabit', () => {
  it('returns correct function name', () => {
    const tx = buildSlashHabit(3);
    expect(tx.functionName).toBe('slash-habit');
    expect(tx.functionArgs).toHaveLength(1);
    expect(tx.postConditions).toHaveLength(0);
  });
});

describe('buildWithdrawStake', () => {
  it('includes post-condition for contract sending STX', () => {
    const tx = buildWithdrawStake(1, 500_000);
    expect(tx.functionName).toBe('withdraw-stake');
    expect(tx.postConditions).toHaveLength(1);
    expect(tx.postConditionMode).toBe(PostConditionMode.Deny);
  });

  it('uses custom contract in post-condition', () => {
    const tx = buildWithdrawStake(1, 100_000, CUSTOM);
    expect(tx.contractAddress).toBe('ST1SJ3DTE5DN7X54YDH5D64R3BCB6A2AG2ZQ8YPD5');
    expect(tx.postConditions).toHaveLength(1);
  });
});

describe('buildClaimBonus', () => {
  it('includes post-condition for at least 1 microSTX', () => {
    const tx = buildClaimBonus(2);
    expect(tx.functionName).toBe('claim-bonus');
    expect(tx.postConditions).toHaveLength(1);
    expect(tx.postConditionMode).toBe(PostConditionMode.Deny);
  });
});
