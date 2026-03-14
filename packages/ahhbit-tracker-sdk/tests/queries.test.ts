import { describe, it, expect, vi, beforeEach } from 'vitest';
import * as stxTx from '@stacks/transactions';
import {
  getHabit,
  getUserHabits,
  getHabitStreak,
  getPoolBalance,
  getTotalHabits,
  getUserStats,
} from '../src/client';
import { MAINNET_CONTRACT } from '../src/constants';

// Mock fetchCallReadOnlyFunction so tests don't hit the network
vi.mock('@stacks/transactions', async () => {
  const actual = await vi.importActual<typeof stxTx>('@stacks/transactions');
  return {
    ...actual,
    fetchCallReadOnlyFunction: vi.fn(),
  };
});

const mockFetch = stxTx.fetchCallReadOnlyFunction as ReturnType<typeof vi.fn>;
const NETWORK = 'mainnet';
const USER = 'SP1N3809W9CBWWX04KN3TCQHP8A9GN520BD4JMP8Z';

beforeEach(() => {
  mockFetch.mockReset();
});

// ── getHabit ────────────────────────────────────────────────

describe('getHabit', () => {
  it('passes correct arguments to the readonly call', async () => {
    mockFetch.mockResolvedValue(stxTx.Cl.none());

    await getHabit(1, NETWORK);

    expect(mockFetch).toHaveBeenCalledWith(
      expect.objectContaining({
        contractAddress: MAINNET_CONTRACT.contractAddress,
        contractName: MAINNET_CONTRACT.contractName,
        functionName: 'get-habit',
        senderAddress: MAINNET_CONTRACT.contractAddress,
        network: NETWORK,
      }),
    );
  });

  it('returns null when the contract responds with none', async () => {
    mockFetch.mockResolvedValue(stxTx.Cl.none());

    const result = await getHabit(42, NETWORK);
    expect(result).toBeNull();
  });

  it('parses a valid habit response into the Habit type', async () => {
    mockFetch.mockResolvedValue(
      stxTx.Cl.some(
        stxTx.Cl.tuple({
          owner: stxTx.Cl.principal(USER),
          name: stxTx.Cl.stringUtf8('Exercise'),
          'stake-amount': stxTx.Cl.uint(20000),
          'current-streak': stxTx.Cl.uint(5),
          'last-check-in-block': stxTx.Cl.uint(100),
          'created-at-block': stxTx.Cl.uint(90),
          'is-active': stxTx.Cl.bool(true),
          'is-completed': stxTx.Cl.bool(false),
          'bonus-claimed': stxTx.Cl.bool(false),
        }),
      ),
    );

    const habit = await getHabit(1, NETWORK);

    expect(habit).not.toBeNull();
    expect(habit!.owner).toBe(USER);
    expect(habit!.name).toBe('Exercise');
    expect(habit!.stakeAmount).toBe(20000);
    expect(habit!.currentStreak).toBe(5);
    expect(habit!.lastCheckInBlock).toBe(100);
    expect(habit!.createdAtBlock).toBe(90);
    expect(habit!.isActive).toBe(true);
    expect(habit!.isCompleted).toBe(false);
    expect(habit!.bonusClaimed).toBe(false);
  });

  it('uses a custom contract override when provided', async () => {
    mockFetch.mockResolvedValue(stxTx.Cl.none());

    const custom = { contractAddress: 'ST1X', contractName: 'custom' };
    await getHabit(1, NETWORK, custom);

    expect(mockFetch).toHaveBeenCalledWith(
      expect.objectContaining({
        contractAddress: 'ST1X',
        contractName: 'custom',
      }),
    );
  });
});

// ── getUserHabits ───────────────────────────────────────────

describe('getUserHabits', () => {
  it('passes the user principal to the readonly call', async () => {
    mockFetch.mockResolvedValue(
      stxTx.Cl.tuple({ 'habit-ids': stxTx.Cl.list([]) }),
    );

    await getUserHabits(USER, NETWORK);

    expect(mockFetch).toHaveBeenCalledWith(
      expect.objectContaining({
        functionName: 'get-user-habits',
      }),
    );
  });

  it('parses habit IDs from the response', async () => {
    mockFetch.mockResolvedValue(
      stxTx.Cl.tuple({
        'habit-ids': stxTx.Cl.list([stxTx.Cl.uint(1), stxTx.Cl.uint(3)]),
      }),
    );

    const result = await getUserHabits(USER, NETWORK);
    expect(result.habitIds).toEqual([1, 3]);
  });

  it('returns empty array when user has no habits', async () => {
    mockFetch.mockResolvedValue(
      stxTx.Cl.tuple({ 'habit-ids': stxTx.Cl.list([]) }),
    );

    const result = await getUserHabits(USER, NETWORK);
    expect(result.habitIds).toEqual([]);
  });
});

// ── getHabitStreak ──────────────────────────────────────────

describe('getHabitStreak', () => {
  it('calls the correct function name', async () => {
    mockFetch.mockResolvedValue(stxTx.Cl.ok(stxTx.Cl.uint(7)));

    await getHabitStreak(1, NETWORK);

    expect(mockFetch).toHaveBeenCalledWith(
      expect.objectContaining({ functionName: 'get-habit-streak' }),
    );
  });

  it('unwraps the ok response to a number', async () => {
    mockFetch.mockResolvedValue(stxTx.Cl.ok(stxTx.Cl.uint(7)));

    const streak = await getHabitStreak(1, NETWORK);
    expect(streak).toBe(7);
  });
});

// ── getPoolBalance ──────────────────────────────────────────

describe('getPoolBalance', () => {
  it('calls get-pool-balance with no arguments', async () => {
    mockFetch.mockResolvedValue(stxTx.Cl.ok(stxTx.Cl.uint(500000)));

    await getPoolBalance(NETWORK);

    expect(mockFetch).toHaveBeenCalledWith(
      expect.objectContaining({
        functionName: 'get-pool-balance',
        functionArgs: [],
      }),
    );
  });

  it('returns the balance as a number', async () => {
    mockFetch.mockResolvedValue(stxTx.Cl.ok(stxTx.Cl.uint(1000000)));

    const balance = await getPoolBalance(NETWORK);
    expect(balance).toBe(1000000);
  });
});

// ── getTotalHabits ──────────────────────────────────────────

describe('getTotalHabits', () => {
  it('calls get-total-habits', async () => {
    mockFetch.mockResolvedValue(stxTx.Cl.ok(stxTx.Cl.uint(42)));

    await getTotalHabits(NETWORK);

    expect(mockFetch).toHaveBeenCalledWith(
      expect.objectContaining({ functionName: 'get-total-habits' }),
    );
  });

  it('returns the count as a number', async () => {
    mockFetch.mockResolvedValue(stxTx.Cl.ok(stxTx.Cl.uint(42)));

    const total = await getTotalHabits(NETWORK);
    expect(total).toBe(42);
  });
});

// ── getUserStats ────────────────────────────────────────────

describe('getUserStats', () => {
  it('passes the user address to the call', async () => {
    mockFetch.mockResolvedValue(
      stxTx.Cl.ok(
        stxTx.Cl.tuple({
          'total-habits': stxTx.Cl.uint(3),
          'habit-ids': stxTx.Cl.list([
            stxTx.Cl.uint(1),
            stxTx.Cl.uint(2),
            stxTx.Cl.uint(5),
          ]),
        }),
      ),
    );

    await getUserStats(USER, NETWORK);

    expect(mockFetch).toHaveBeenCalledWith(
      expect.objectContaining({ functionName: 'get-user-stats' }),
    );
  });

  it('parses stats into the UserStats type', async () => {
    mockFetch.mockResolvedValue(
      stxTx.Cl.ok(
        stxTx.Cl.tuple({
          'total-habits': stxTx.Cl.uint(3),
          'habit-ids': stxTx.Cl.list([
            stxTx.Cl.uint(1),
            stxTx.Cl.uint(2),
            stxTx.Cl.uint(5),
          ]),
        }),
      ),
    );

    const stats = await getUserStats(USER, NETWORK);

    expect(stats.totalHabits).toBe(3);
    expect(stats.habitIds).toEqual([1, 2, 5]);
  });
});
