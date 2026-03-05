import {
  uintCV,
  stringUtf8CV,
  principalCV,
  fetchCallReadOnlyFunction,
  cvToJSON,
  Pc,
  PostConditionMode,
} from '@stacks/transactions';
import type { ContractId, Habit, UserHabits, UserStats } from './types';
import { MAINNET_CONTRACT } from './constants';

// ────────────────────────────────────────────────
// Helpers
// ────────────────────────────────────────────────

function resolveContract(override?: Partial<ContractId>): ContractId {
  return {
    contractAddress: override?.contractAddress ?? MAINNET_CONTRACT.contractAddress,
    contractName: override?.contractName ?? MAINNET_CONTRACT.contractName,
  };
}

function contractPrincipal(c: ContractId): string {
  return `${c.contractAddress}.${c.contractName}`;
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function parseHabit(json: any): Habit | null {
  if (!json || json.type === 'none') return null;
  const v = json.value ?? json;
  return {
    owner: v.owner?.value ?? v.owner,
    name: v.name?.value ?? v.name,
    stakeAmount: Number(v['stake-amount']?.value ?? v['stake-amount']),
    currentStreak: Number(v['current-streak']?.value ?? v['current-streak']),
    lastCheckInBlock: Number(v['last-check-in-block']?.value ?? v['last-check-in-block']),
    createdAtBlock: Number(v['created-at-block']?.value ?? v['created-at-block']),
    isActive: v['is-active']?.value ?? v['is-active'],
    isCompleted: v['is-completed']?.value ?? v['is-completed'],
    bonusClaimed: v['bonus-claimed']?.value ?? v['bonus-claimed'],
  };
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function parseUserHabits(json: any): UserHabits {
  const ids = json?.value?.['habit-ids']?.value ?? json?.['habit-ids']?.value ?? [];
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  return { habitIds: ids.map((v: any) => Number(v.value ?? v)) };
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function parseUserStats(json: any): UserStats {
  const v = json?.value ?? json;
  const ids = v['habit-ids']?.value ?? [];
  return {
    totalHabits: Number(v['total-habits']?.value ?? v['total-habits']),
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    habitIds: ids.map((i: any) => Number(i.value ?? i)),
  };
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function unwrapOkNumber(json: any): number {
  if (json?.type === 'ok') return Number(json.value.value);
  return Number(json?.value ?? 0);
}

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
  network: Parameters<typeof fetchCallReadOnlyFunction>[0]['network'],
  contract?: Partial<ContractId>,
): Promise<Habit | null> {
  const c = resolveContract(contract);
  const cv = await fetchCallReadOnlyFunction({
    contractAddress: c.contractAddress,
    contractName: c.contractName,
    functionName: 'get-habit',
    functionArgs: [uintCV(habitId)],
    network,
    senderAddress: c.contractAddress,
  });
  return parseHabit(cvToJSON(cv));
}

/**
 * Fetch all habit IDs belonging to a user.
 */
export async function getUserHabits(
  userAddress: string,
  network: Parameters<typeof fetchCallReadOnlyFunction>[0]['network'],
  contract?: Partial<ContractId>,
): Promise<UserHabits> {
  const c = resolveContract(contract);
  const cv = await fetchCallReadOnlyFunction({
    contractAddress: c.contractAddress,
    contractName: c.contractName,
    functionName: 'get-user-habits',
    functionArgs: [principalCV(userAddress)],
    network,
    senderAddress: c.contractAddress,
  });
  return parseUserHabits(cvToJSON(cv));
}

/**
 * Fetch the current streak for a habit.
 */
export async function getHabitStreak(
  habitId: number,
  network: Parameters<typeof fetchCallReadOnlyFunction>[0]['network'],
  contract?: Partial<ContractId>,
): Promise<number> {
  const c = resolveContract(contract);
  const cv = await fetchCallReadOnlyFunction({
    contractAddress: c.contractAddress,
    contractName: c.contractName,
    functionName: 'get-habit-streak',
    functionArgs: [uintCV(habitId)],
    network,
    senderAddress: c.contractAddress,
  });
  return unwrapOkNumber(cvToJSON(cv));
}

/**
 * Fetch the current forfeited pool balance in microSTX.
 */
export async function getPoolBalance(
  network: Parameters<typeof fetchCallReadOnlyFunction>[0]['network'],
  contract?: Partial<ContractId>,
): Promise<number> {
  const c = resolveContract(contract);
  const cv = await fetchCallReadOnlyFunction({
    contractAddress: c.contractAddress,
    contractName: c.contractName,
    functionName: 'get-pool-balance',
    functionArgs: [],
    network,
    senderAddress: c.contractAddress,
  });
  return unwrapOkNumber(cvToJSON(cv));
}

/**
 * Fetch the total number of habits created.
 */
export async function getTotalHabits(
  network: Parameters<typeof fetchCallReadOnlyFunction>[0]['network'],
  contract?: Partial<ContractId>,
): Promise<number> {
  const c = resolveContract(contract);
  const cv = await fetchCallReadOnlyFunction({
    contractAddress: c.contractAddress,
    contractName: c.contractName,
    functionName: 'get-total-habits',
    functionArgs: [],
    network,
    senderAddress: c.contractAddress,
  });
  return unwrapOkNumber(cvToJSON(cv));
}

/**
 * Fetch aggregated stats for a user.
 */
export async function getUserStats(
  userAddress: string,
  network: Parameters<typeof fetchCallReadOnlyFunction>[0]['network'],
  contract?: Partial<ContractId>,
): Promise<UserStats> {
  const c = resolveContract(contract);
  const cv = await fetchCallReadOnlyFunction({
    contractAddress: c.contractAddress,
    contractName: c.contractName,
    functionName: 'get-user-stats',
    functionArgs: [principalCV(userAddress)],
    network,
    senderAddress: c.contractAddress,
  });
  const json = cvToJSON(cv);
  return parseUserStats(json?.value ?? json);
}
