import { describe, expect, it } from 'vitest';
import {
  buildCheckInPreview,
  buildClaimBonusPreview,
  buildCreateHabitPreview,
  buildWithdrawStakePreview,
} from '../mobile/src/features/transactions/data/transactionBuilder';

describe('mobile transaction preview builder', () => {
  it('builds create-habit preview with encoded args and post conditions', () => {
    const preview = buildCreateHabitPreview(
      'SP1N3809W9CBWWX04KN3TCQHP8A9GN520BD4JMP8Z',
      'Morning run',
      100_000,
    );

    expect(preview).toMatchObject({
      contractAddress: 'SP1N3809W9CBWWX04KN3TCQHP8A9GN520BD4JMP8Z',
      contractName: 'habit-tracker-v2',
      functionName: 'create-habit',
      postConditionMode: 'Deny',
    });
    expect(preview.functionArgsHex).toHaveLength(2);
    expect(preview.functionArgsHex[0]).toMatch(/^0x/);
    expect(preview.postConditions).toHaveLength(1);
  });

  it('builds check-in preview with one encoded argument', () => {
    const preview = buildCheckInPreview(15);

    expect(preview).toMatchObject({
      contractAddress: 'SP1N3809W9CBWWX04KN3TCQHP8A9GN520BD4JMP8Z',
      contractName: 'habit-tracker-v2',
      functionName: 'check-in',
      postConditionMode: 'Deny',
    });
    expect(preview.functionArgsHex).toHaveLength(1);
    expect(preview.functionArgsHex[0]).toMatch(/^0x/);
  });

  it('builds withdraw preview with deny mode and one post condition', () => {
    const preview = buildWithdrawStakePreview(9, 250_000);

    expect(preview).toMatchObject({
      contractAddress: 'SP1N3809W9CBWWX04KN3TCQHP8A9GN520BD4JMP8Z',
      contractName: 'habit-tracker-v2',
      functionName: 'withdraw-stake',
      postConditionMode: 'Deny',
    });
    expect(preview.functionArgsHex).toHaveLength(1);
    expect(preview.postConditions).toHaveLength(1);
  });

  it('builds claim-bonus preview with standard post conditions', () => {
    const claimPreview = buildClaimBonusPreview(9);

    expect(claimPreview).toMatchObject({
      contractAddress: 'SP1N3809W9CBWWX04KN3TCQHP8A9GN520BD4JMP8Z',
      contractName: 'habit-tracker-v2',
      functionName: 'claim-bonus',
      postConditionMode: 'Deny',
    });
    expect(claimPreview.functionArgsHex).toHaveLength(1);
    expect(claimPreview.postConditions).toHaveLength(1);
  });

  it('produces deterministic preview output for identical create-habit input', () => {
    const sender = 'SP1N3809W9CBWWX04KN3TCQHP8A9GN520BD4JMP8Z';
    const first = buildCreateHabitPreview(sender, 'Read for 30 minutes', 250_000);
    const second = buildCreateHabitPreview(sender, 'Read for 30 minutes', 250_000);

    expect(first.functionArgsHex).toEqual(second.functionArgsHex);
    expect(first.postConditions).toEqual(second.postConditions);
    expect(first.contractAddress).toBe(sender);
  });
});
