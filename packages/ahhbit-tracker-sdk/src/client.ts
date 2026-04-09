import {
  uintCV,
  stringUtf8CV,
  principalCV,
  Pc,
  PostConditionMode,
} from '@stacks/transactions';
import type { ContractId, Habit, UserHabits, UserStats } from './types';
import { contractPrincipal, resolveContract } from './contract';
import { parseHabit, parseUserHabits, parseUserStats, unwrapOkNumber } from './parsers';
import { queryReadOnly } from './query';
import type { StacksReadOnlyNetwork } from './query-types';

// ────────────────────────────────────────────────
// Helpers
// ────────────────────────────────────────────────

// ────────────────────────────────────────────────
// Transaction argument builders
// ────────────────────────────────────────────────

/**
 * Build arguments for `create-habit` contract call.
 *
 * @param name  Habit name (1-50 UTF-8 characters)
 * @param stakeAmount  Stake in microSTX (>= 100 000)
 * @param senderAddress  Address of the caller (for post-conditions)
 * @param contract  Optional contract override (defaults to mainnet)
 */
export function buildCreateHabit(
  name: string,
  stakeAmount: number,
  senderAddress: string,
  contract?: Partial<ContractId>,
) {
  const c = resolveContract(contract);
  return {
    contractAddress: c.contractAddress,
    contractName: c.contractName,
    functionName: 'create-habit' as const,
    functionArgs: [stringUtf8CV(name), uintCV(stakeAmount)],
    postConditions: [Pc.principal(senderAddress).willSendEq(stakeAmount).ustx()],
    postConditionMode: PostConditionMode.Deny,
  };
}

/**
 * Build arguments for `check-in` contract call.
 */
export function buildCheckIn(habitId: number, contract?: Partial<ContractId>) {
  const c = resolveContract(contract);
  return {
    contractAddress: c.contractAddress,
    contractName: c.contractName,
    functionName: 'check-in' as const,
    functionArgs: [uintCV(habitId)],
    postConditions: [],
    postConditionMode: PostConditionMode.Deny,
  };
}

/**
 * Build arguments for `slash-habit` contract call.
 */
export function buildSlashHabit(habitId: number, contract?: Partial<ContractId>) {
  const c = resolveContract(contract);
  return {
    contractAddress: c.contractAddress,
    contractName: c.contractName,
    functionName: 'slash-habit' as const,
    functionArgs: [uintCV(habitId)],
    postConditions: [],
    postConditionMode: PostConditionMode.Deny,
  };
}

/**
 * Build arguments for `withdraw-stake` contract call.
 *
 * @param habitId  Habit to withdraw from
 * @param stakeAmount  Expected stake amount in microSTX (for post-condition)
 * @param contract  Optional contract override
 */
export function buildWithdrawStake(
  habitId: number,
  stakeAmount: number,
  contract?: Partial<ContractId>,
) {
  const c = resolveContract(contract);
  return {
    contractAddress: c.contractAddress,
    contractName: c.contractName,
    functionName: 'withdraw-stake' as const,
    functionArgs: [uintCV(habitId)],
    postConditions: [Pc.principal(contractPrincipal(c)).willSendEq(stakeAmount).ustx()],
    postConditionMode: PostConditionMode.Deny,
  };
}

/**
 * Build arguments for `claim-bonus` contract call.
 */
export function buildClaimBonus(habitId: number, contract?: Partial<ContractId>) {
  const c = resolveContract(contract);
  return {
    contractAddress: c.contractAddress,
    contractName: c.contractName,
    functionName: 'claim-bonus' as const,
    functionArgs: [uintCV(habitId)],
    postConditions: [Pc.principal(contractPrincipal(c)).willSendGte(1).ustx()],
    postConditionMode: PostConditionMode.Deny,
  };
}

// ────────────────────────────────────────────────
// Read-only queries
// ────────────────────────────────────────────────

/**
 * Fetch a habit by ID.  Returns `null` if not found.
 */
export async function getHabit(
  habitId: number,
  network: StacksReadOnlyNetwork,
  contract?: Partial<ContractId>,
): Promise<Habit | null> {
  return queryReadOnly(
    {
      functionName: 'get-habit',
      functionArgs: [uintCV(habitId)],
      network,
      contract,
    },
    parseHabit,
  );
}

/**
 * Fetch all habit IDs belonging to a user.
 */
export async function getUserHabits(
  userAddress: string,
  network: StacksReadOnlyNetwork,
  contract?: Partial<ContractId>,
): Promise<UserHabits> {
  return queryReadOnly(
    {
      functionName: 'get-user-habits',
      functionArgs: [principalCV(userAddress)],
      network,
      contract,
    },
    parseUserHabits,
  );
}

/**
 * Fetch the current streak for a habit.
 */
export async function getHabitStreak(
  habitId: number,
  network: StacksReadOnlyNetwork,
  contract?: Partial<ContractId>,
): Promise<number> {
  return queryReadOnly(
    {
      functionName: 'get-habit-streak',
      functionArgs: [uintCV(habitId)],
      network,
      contract,
    },
    unwrapOkNumber,
  );
}

/**
 * Fetch the current forfeited pool balance in microSTX.
 */
export async function getPoolBalance(
  network: StacksReadOnlyNetwork,
  contract?: Partial<ContractId>,
): Promise<number> {
  return queryReadOnly(
    {
      functionName: 'get-pool-balance',
      functionArgs: [],
      network,
      contract,
    },
    unwrapOkNumber,
  );
}

/**
 * Fetch the total number of habits created.
 */
export async function getTotalHabits(
  network: StacksReadOnlyNetwork,
  contract?: Partial<ContractId>,
): Promise<number> {
  return queryReadOnly(
    {
      functionName: 'get-total-habits',
      functionArgs: [],
      network,
      contract,
    },
    unwrapOkNumber,
  );
}

/**
 * Fetch aggregated stats for a user.
 */
export async function getUserStats(
  userAddress: string,
  network: StacksReadOnlyNetwork,
  contract?: Partial<ContractId>,
): Promise<UserStats> {
  return queryReadOnly(
    {
      functionName: 'get-user-stats',
      functionArgs: [principalCV(userAddress)],
      network,
      contract,
    },
    (json) => parseUserStats((json as { value?: unknown })?.value ?? json),
  );
}
