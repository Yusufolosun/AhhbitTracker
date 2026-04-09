import type { Habit, UserHabits, UserStats } from './types';

function unwrapValue(input: unknown): unknown {
  if (!input || typeof input !== 'object') return input;
  if (!('value' in input)) return input;
  return unwrapValue((input as { value: unknown }).value);
}

function readNumber(input: unknown, fallback = 0): number {
  const unwrapped = unwrapValue(input);
  if (typeof unwrapped === 'number') return unwrapped;
  if (typeof unwrapped === 'string') {
    const parsed = Number(unwrapped);
    return Number.isFinite(parsed) ? parsed : fallback;
  }
  return fallback;
}

function readString(input: unknown, fallback = ''): string {
  const unwrapped = unwrapValue(input);
  return typeof unwrapped === 'string' ? unwrapped : fallback;
}

function readBoolean(input: unknown, fallback = false): boolean {
  const unwrapped = unwrapValue(input);
  return typeof unwrapped === 'boolean' ? unwrapped : fallback;
}

function asRecord(input: unknown): Record<string, unknown> {
  if (input && typeof input === 'object') {
    return input as Record<string, unknown>;
  }
  return {};
}

export function parseHabit(json: unknown): Habit | null {
  const root = asRecord(json);

  if (!json || root.value === null || String(root.type ?? '').includes('optional none')) {
    return null;
  }

  const firstLevel = asRecord(root.value ?? json);
  const tuple = firstLevel.value && typeof firstLevel.value === 'object'
    ? asRecord(firstLevel.value)
    : firstLevel;

  return {
    owner: readString(tuple.owner),
    name: readString(tuple.name),
    stakeAmount: readNumber(tuple['stake-amount']),
    currentStreak: readNumber(tuple['current-streak']),
    lastCheckInBlock: readNumber(tuple['last-check-in-block']),
    createdAtBlock: readNumber(tuple['created-at-block']),
    isActive: readBoolean(tuple['is-active']),
    isCompleted: readBoolean(tuple['is-completed']),
    bonusClaimed: readBoolean(tuple['bonus-claimed']),
  };
}

export function parseUserHabits(json: unknown): UserHabits {
  const root = asRecord(json);
  const rootValue = asRecord(root.value);
  const nested = asRecord(rootValue['habit-ids']);
  const list =
    (Array.isArray(nested.value) && nested.value) ||
    (Array.isArray(root['habit-ids']) && root['habit-ids']) ||
    [];

  return {
    habitIds: list.map((item) => readNumber(item)).filter((value) => Number.isFinite(value)),
  };
}

export function parseUserStats(json: unknown): UserStats {
  const root = asRecord(json);
  const rootValue = asRecord(root.value ?? root);
  const idsWrapper = asRecord(rootValue['habit-ids']);
  const ids = Array.isArray(idsWrapper.value) ? idsWrapper.value : [];

  return {
    totalHabits: readNumber(rootValue['total-habits']),
    habitIds: ids.map((item) => readNumber(item)).filter((value) => Number.isFinite(value)),
  };
}

export function unwrapOkNumber(json: unknown): number {
  const root = asRecord(json);

  if (root.success === true) {
    return readNumber(root.value, 0);
  }

  if (root.type === 'ok' || root.type === 'response_ok') {
    return readNumber(root.value, 0);
  }

  if (typeof root.type === 'string' && root.type.includes('uint')) {
    return readNumber(root.value, 0);
  }

  return readNumber(root.value, 0);
}