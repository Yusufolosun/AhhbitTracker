import {
  buildCheckIn,
  buildClaimBonus,
  buildCreateHabit,
  buildWithdrawStake,
} from '@yusufolosun/ahhbit-tracker-sdk';
import { cvToHex, PostConditionMode } from '@stacks/transactions';
import { networkConfig } from '@/core/config';
import type { ContractCallPreview, MobileTxType } from '@/core/types';

function jsonBigIntReplacer(_key: string, value: unknown): unknown {
  if (typeof value === 'bigint') {
    return value.toString();
  }
  return value;
}

function toPreview(
  payload: {
    contractAddress: string;
    contractName: string;
    functionName: MobileTxType;
    functionArgs: unknown[];
    postConditions: unknown[];
    postConditionMode: number;
  },
): ContractCallPreview {
  return {
    contractAddress: payload.contractAddress,
    contractName: payload.contractName,
    functionName: payload.functionName,
    functionArgsHex: payload.functionArgs.map((arg) => cvToHex(arg as Parameters<typeof cvToHex>[0])),
    postConditionMode:
      payload.postConditionMode === PostConditionMode.Allow ? 'Allow' : 'Deny',
    postConditions: payload.postConditions.map((value) =>
      JSON.stringify(value, jsonBigIntReplacer),
    ),
  };
}

export function buildCreateHabitPreview(
  senderAddress: string,
  name: string,
  stakeAmount: number,
): ContractCallPreview {
  const payload = buildCreateHabit(name, stakeAmount, senderAddress, networkConfig.contract);
  return toPreview(payload);
}

export function buildCheckInPreview(habitId: number): ContractCallPreview {
  const payload = buildCheckIn(habitId, networkConfig.contract);
  return toPreview(payload);
}

export function buildWithdrawStakePreview(
  habitId: number,
  stakeAmount: number,
): ContractCallPreview {
  const payload = buildWithdrawStake(habitId, stakeAmount, networkConfig.contract);
  return toPreview(payload);
}

export function buildClaimBonusPreview(habitId: number): ContractCallPreview {
  const payload = buildClaimBonus(habitId, networkConfig.contract);
  return toPreview(payload);
}
