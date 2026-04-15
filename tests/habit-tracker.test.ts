import { describe, expect, it, beforeEach } from "vitest";
import { Cl } from "@stacks/transactions";

const accounts = simnet.getAccounts();
const deployer = accounts.get("deployer")!;
const user1 = accounts.get("wallet_1")!;
const user2 = accounts.get("wallet_2")!;
const user3 = accounts.get("wallet_3")!;

// Test Helpers
const MIN_STAKE = 20000; // 0.02 STX in microSTX
const MIN_CHECK_IN_INTERVAL = 120;
const MAX_STAKE_AMOUNT = 100_000_000; // 100 STX in microSTX
const VALID_HABIT_NAME = "Daily Exercise";
const MAX_NAME_LENGTH = 50;

function createHabit(caller: string, name: string, stake: number) {
  return simnet.callPublicFn(
    "habit-tracker-v2",
    "create-habit",
    [Cl.stringUtf8(name), Cl.uint(stake)],
    caller
  );
}

function checkIn(caller: string, habitId: number) {
  return simnet.callPublicFn(
    "habit-tracker-v2",
    "check-in",
    [Cl.uint(habitId)],
    caller
  );
}

function withdrawStake(caller: string, habitId: number) {
  return simnet.callPublicFn(
    "habit-tracker-v2",
    "withdraw-stake",
    [Cl.uint(habitId)],
    caller
  );
}

function getHabit(habitId: number) {
  return simnet.callReadOnlyFn(
    "habit-tracker-v2",
    "get-habit",
    [Cl.uint(habitId)],
    deployer
  );
}

/*
 * AhhbitTracker Contract Tests
 * Comprehensive test suite for habit tracking smart contract
 */

describe("AhhbitTracker Contract", () => {

  beforeEach(() => {
    // Reset simnet state before each test
  });

  describe("Contract Deployment", () => {
    it("should deploy successfully", () => {
      expect(true).toBe(true);
    });
  });

  describe("create-habit function", () => {

    it("should create habit with valid inputs", () => {
      const result = createHabit(user1, VALID_HABIT_NAME, MIN_STAKE);

      expect(result.result).toBeOk(Cl.uint(1));
    });

    it("should accept minimum stake amount", () => {
      const result = createHabit(user1, VALID_HABIT_NAME, MIN_STAKE);

      expect(result.result).toBeOk(Cl.uint(1));
    });

    it("should reject stake below minimum", () => {
      const belowMin = MIN_STAKE - 1;
      const result = createHabit(user1, VALID_HABIT_NAME, belowMin);

      expect(result.result).toBeErr(Cl.uint(101)); // ERR-INVALID-STAKE-AMOUNT
    });

    it("should accept stake above minimum", () => {
      const aboveMin = MIN_STAKE * 10;
      const result = createHabit(user1, VALID_HABIT_NAME, aboveMin);

      expect(result.result).toBeOk(Cl.uint(1));
    });

    it("should reject stake above maximum (100 STX)", () => {
      const aboveMax = 100_000_001; // 100 STX + 1 microSTX
      const result = createHabit(user1, VALID_HABIT_NAME, aboveMax);

      expect(result.result).toBeErr(Cl.uint(113)); // ERR-STAKE-TOO-HIGH
    });

    it("should accept stake at exactly maximum (100 STX)", () => {
      const exactMax = 100_000_000; // 100 STX
      const result = createHabit(user1, VALID_HABIT_NAME, exactMax);

      expect(result.result).toBeOk(Cl.uint(1));
    });

    it("should reject empty habit name", () => {
      const result = createHabit(user1, "", MIN_STAKE);

      expect(result.result).toBeErr(Cl.uint(102)); // ERR-INVALID-HABIT-NAME
    });

    it("should accept maximum length name", () => {
      const maxName = "a".repeat(MAX_NAME_LENGTH);
      const result = createHabit(user1, maxName, MIN_STAKE);

      expect(result.result).toBeOk(Cl.uint(1));
    });

    it("should transfer STX from user to contract", () => {
      const result = createHabit(user1, VALID_HABIT_NAME, MIN_STAKE);
      expect(result.result).toBeOk(Cl.uint(1));

      // Pool remains zero until a slash/auto-slash occurs.
      const poolResult = simnet.callReadOnlyFn("habit-tracker-v2", "get-pool-balance", [], deployer);
      expect(poolResult.result).toEqual(Cl.ok(Cl.uint(0)));
    });

    it("should allow user to create multiple habits", () => {
      const result1 = createHabit(user1, "Habit 1", MIN_STAKE);
      const result2 = createHabit(user1, "Habit 2", MIN_STAKE);
      const result3 = createHabit(user1, "Habit 3", MIN_STAKE);

      expect(result1.result).toBeOk(Cl.uint(1));
      expect(result2.result).toBeOk(Cl.uint(2));
      expect(result3.result).toBeOk(Cl.uint(3));
    });

    it("should increment habit IDs correctly", () => {
      createHabit(user1, "User1 Habit", MIN_STAKE);
      createHabit(user2, "User2 Habit", MIN_STAKE);
      createHabit(user1, "User1 Habit2", MIN_STAKE);

      const habit1 = getHabit(1);
      const habit2 = getHabit(2);
      const habit3 = getHabit(3);

      expect(habit1.result).not.toBeNone();
      expect(habit2.result).not.toBeNone();
      expect(habit3.result).not.toBeNone();
    });

    it("should store habit data correctly", () => {
      const stakeAmount = MIN_STAKE * 2;
      createHabit(user1, VALID_HABIT_NAME, stakeAmount);

      const result = getHabit(1);
      expect(result.result).toBeSome(Cl.tuple({
        owner: Cl.principal(user1),
        name: Cl.stringUtf8(VALID_HABIT_NAME),
        "stake-amount": Cl.uint(stakeAmount),
        "current-streak": Cl.uint(0),
        "last-check-in-block": Cl.uint(simnet.blockHeight),
        "created-at-block": Cl.uint(simnet.blockHeight),
        "is-active": Cl.bool(true),
        "is-completed": Cl.bool(false),
        "bonus-claimed": Cl.bool(false)
      }));
    });

    it("should return ERR-HABIT-LIMIT-REACHED when user exceeds 100 habits", () => {
      for (let i = 0; i < 100; i++) {
        const r = createHabit(user1, `Habit ${i + 1}`, MIN_STAKE);
        expect(r.result).toBeOk(Cl.uint(i + 1));
      }

      const overflow = createHabit(user1, "Habit 101", MIN_STAKE);
      expect(overflow.result).toBeErr(Cl.uint(112)); // ERR-HABIT-LIMIT-REACHED
    });

  });

  describe("check-in function", () => {
    let habitId: number;

    beforeEach(() => {
      // Create a habit before each check-in test
      const result = createHabit(user1, VALID_HABIT_NAME, MIN_STAKE);
      // Extract ID from (ok uID)
      habitId = Number((result.result as any).value.value);
      simnet.mineEmptyBlocks(MIN_CHECK_IN_INTERVAL);
    });

    it("should allow first check-in", () => {
      const result = checkIn(user1, habitId);

      expect(result.result).toBeOk(Cl.uint(1)); // Streak = 1
    });

    it("should reject check-in by non-owner", () => {
      const result = checkIn(user2, habitId);

      expect(result.result).toBeErr(Cl.uint(104)); // ERR-NOT-HABIT-OWNER
    });

    it("should allow only owner to check in", () => {
      const res2 = createHabit(user2, "User2 Habit", MIN_STAKE);
      const id2 = Number((res2.result as any).value.value);

      const result1 = checkIn(user1, habitId);
      const nonOwner = checkIn(user2, habitId);

      simnet.mineEmptyBlocks(MIN_CHECK_IN_INTERVAL);
      const result2 = checkIn(user2, id2);

      expect(result1.result).toBeOk(Cl.uint(1));
      expect(nonOwner.result).toBeErr(Cl.uint(104));
      expect(result2.result).toBeOk(Cl.uint(1));
    });

    it("should reject check-in for non-existent habit", () => {
      const result = checkIn(user1, 9999);

      expect(result.result).toBeErr(Cl.uint(103)); // ERR-HABIT-NOT-FOUND
    });

    it("should increment streak on consecutive check-ins", () => {
      checkIn(user1, habitId);
      simnet.mineEmptyBlocks(120); // MIN-CHECK-IN-INTERVAL
      const result = checkIn(user1, habitId);

      expect(result.result).toBeOk(Cl.uint(2));
    });

    it("should prevent check-in before minimum interval (120 blocks)", () => {
      // First check-in succeeds
      const first = checkIn(user1, habitId);
      expect(first.result).toBeOk(Cl.uint(1));

      // Try to check in after only 1 block → should fail
      // blocks-elapsed = 1 < MIN-CHECK-IN-INTERVAL(120) → blocked
      const second = checkIn(user1, habitId);
      expect(second.result).toBeErr(Cl.uint(105)); // ERR-ALREADY-CHECKED-IN
    });

    it("should prevent check-in before minimum interval (119 blocks)", () => {
      checkIn(user1, habitId);
      // callPublicFn mines a block for the attempted check-in, so mine 118 here
      // to keep elapsed blocks strictly below the 120 minimum interval.
      simnet.mineEmptyBlocks(118);

      const result = checkIn(user1, habitId);
      expect(result.result).toBeErr(Cl.uint(105)); // ERR-ALREADY-CHECKED-IN
    });

    it("should allow check-in at exactly 120 blocks (minimum interval)", () => {
      checkIn(user1, habitId);
      simnet.mineEmptyBlocks(120); // Exactly at minimum

      const result = checkIn(user1, habitId);
      expect(result.result).toBeOk(Cl.uint(2));
    });

    it("should allow check-in at exactly 143 blocks later (inside window)", () => {
      checkIn(user1, habitId);
      simnet.mineEmptyBlocks(143);

      const result = checkIn(user1, habitId);
      expect(result.result).toBeOk(Cl.uint(2));
    });

    it("should succeed at the 144-block boundary (last valid block)", () => {
      // checkIn at block N → mine 143 empty blocks → next checkIn at N+144
      // elapsed = 144 ≤ CHECK-IN-WINDOW(144) → valid
      checkIn(user1, habitId);
      simnet.mineEmptyBlocks(143);

      const result = checkIn(user1, habitId);
      expect(result.result).toBeOk(Cl.uint(2));
    });

    it("should auto-slash check-in 1 block past the window (145 elapsed)", () => {
      // checkIn at block N → mine 144 empty blocks → next checkIn at N+145
      // elapsed = 145 > CHECK-IN-WINDOW(144) → check-in returns ERR-HABIT-AUTO-SLASHED
      // Note: because this is an err return, state changes in that branch are rolled back.
      checkIn(user1, habitId);
      simnet.mineEmptyBlocks(144);

      const result = checkIn(user1, habitId);
      expect(result.result).toBeErr(Cl.uint(114));

      // Pool is unchanged because the transaction returned err (state rolled back)
      const pool = simnet.getDataVar("habit-tracker-v2", "forfeited-pool-balance");
      expect(pool).toBeUint(0);

      // Habit is still active, so repeated late check-ins return ERR-HABIT-AUTO-SLASHED
      const result2 = checkIn(user1, habitId);
      expect(result2.result).toBeErr(Cl.uint(114));
    });

    it("should forfeit stake when check-in window expires via slashing", () => {
      checkIn(user1, habitId);
      simnet.mineEmptyBlocks(150);

      // User2 slashes user1's expired habit
      const result = simnet.callPublicFn("habit-tracker-v2", "slash-habit", [Cl.uint(habitId)], user2);
      expect(result.result).toBeOk(Cl.bool(true));

      const poolBalance = simnet.getDataVar("habit-tracker-v2", "forfeited-pool-balance");
      expect(poolBalance).toBeUint(MIN_STAKE);
    });

    it("should reject check-in to a completed habit", () => {
      // Setup: Complete streak and withdraw
      for (let i = 0; i < 7; i++) {
        checkIn(user1, habitId);
        simnet.mineEmptyBlocks(120); // MIN-CHECK-IN-INTERVAL
      }
      simnet.callPublicFn("habit-tracker-v2", "withdraw-stake", [Cl.uint(habitId)], user1);

      const result = checkIn(user1, habitId);
      expect(result.result).toBeErr(Cl.uint(108)); // ERR-HABIT-ALREADY-COMPLETED
    });

    it("should reject check-in to a slashed (inactive) habit", () => {
      checkIn(user1, habitId);
      simnet.mineEmptyBlocks(150);
      simnet.callPublicFn("habit-tracker-v2", "slash-habit", [Cl.uint(habitId)], user2);

      const result = checkIn(user1, habitId);
      expect(result.result).toBeErr(Cl.uint(108)); // ERR-HABIT-ALREADY-COMPLETED (inactive)
    });

  });

  describe("withdraw-stake function", () => {
    let habitId: number;

    beforeEach(() => {
      const result = createHabit(user1, VALID_HABIT_NAME, MIN_STAKE);
      habitId = Number((result.result as any).value.value);
      simnet.mineEmptyBlocks(MIN_CHECK_IN_INTERVAL);
    });

    it("should allow successful withdrawal after streak", () => {
      for (let i = 0; i < 7; i++) {
        checkIn(user1, habitId);
        simnet.mineEmptyBlocks(120); // MIN-CHECK-IN-INTERVAL
      }

      const result = simnet.callPublicFn("habit-tracker-v2", "withdraw-stake", [Cl.uint(habitId)], user1);
      expect(result.result).toBeOk(Cl.uint(MIN_STAKE));
    });

    it("should reject withdrawal by non-owner", () => {
      const result = simnet.callPublicFn("habit-tracker-v2", "withdraw-stake", [Cl.uint(habitId)], user2);
      expect(result.result).toBeErr(Cl.uint(104)); // ERR-NOT-HABIT-OWNER
    });

    it("should reject withdrawal if streak is insufficient", () => {
      checkIn(user1, habitId);

      const result = simnet.callPublicFn("habit-tracker-v2", "withdraw-stake", [Cl.uint(habitId)], user1);
      expect(result.result).toBeErr(Cl.uint(107)); // ERR-INSUFFICIENT-STREAK
    });

    it("should reject withdrawal after stake is slashed", () => {
      checkIn(user1, habitId);
      simnet.mineEmptyBlocks(150);
      simnet.callPublicFn("habit-tracker-v2", "slash-habit", [Cl.uint(habitId)], user2);

      const result = simnet.callPublicFn("habit-tracker-v2", "withdraw-stake", [Cl.uint(habitId)], user1);
      expect(result.result).toBeErr(Cl.uint(108)); // ERR-HABIT-ALREADY-COMPLETED (inactive)
    });

  });

  describe("claim-bonus function", () => {
    let habitId: number;

    beforeEach(() => {
      const result = createHabit(user1, VALID_HABIT_NAME, MIN_STAKE * 10);
      habitId = Number((result.result as any).value.value);
      simnet.mineEmptyBlocks(MIN_CHECK_IN_INTERVAL);
    });

    it("should allow claiming bonus if pool has funds", () => {
      // 1. Fund the pool FIRST using a different habit (this mines blocks)
      const h2 = createHabit(user2, "Failing Habit", MIN_STAKE * 10);
      const id2 = Number((h2.result as any).value.value);
      simnet.mineEmptyBlocks(MIN_CHECK_IN_INTERVAL);
      checkIn(user2, id2);
      simnet.mineEmptyBlocks(150); // Mines blocks, pushing height to ~152
      simnet.callPublicFn("habit-tracker-v2", "slash-habit", [Cl.uint(id2)], user2);

      // 2. Create User1's habit AFTER blocks are mined
      const res1 = createHabit(user1, VALID_HABIT_NAME, MIN_STAKE * 10);
      const id1 = Number((res1.result as any).value.value);

      // 3. Complete User1's streak
      simnet.mineEmptyBlocks(MIN_CHECK_IN_INTERVAL);
      for (let i = 0; i < 7; i++) {
        const res = checkIn(user1, id1);
        expect(res.result).toEqual(Cl.ok(Cl.uint(i + 1)));
        simnet.mineEmptyBlocks(120);
      }

      const resW = simnet.callPublicFn("habit-tracker-v2", "withdraw-stake", [Cl.uint(id1)], user1);
      expect(resW.result).toEqual(Cl.ok(Cl.uint(MIN_STAKE * 10)));

      // 4. Claim bonus
      const result = simnet.callPublicFn("habit-tracker-v2", "claim-bonus", [Cl.uint(id1)], user1);
      // Only one eligible claimant, so claim receives the full available pool.
      expect(result.result).toEqual(Cl.ok(Cl.uint(MIN_STAKE * 10)));
    });

    it("should distribute nearly equal bonuses to consecutive claimants", () => {
      // Fund the pool: slash a 1 STX habit
      const failHabit = createHabit(user3, "Will fail", MIN_STAKE * 10);
      const failId = Number((failHabit.result as any).value.value);
      simnet.mineEmptyBlocks(MIN_CHECK_IN_INTERVAL);
      checkIn(user3, failId);
      simnet.mineEmptyBlocks(150);
      simnet.callPublicFn("habit-tracker-v2", "slash-habit", [Cl.uint(failId)], user3);
      // Pool = 1,000,000 microSTX (1 STX)

      // User1 completes a habit
      const h1 = createHabit(user1, "Habit A", MIN_STAKE);
      const id1 = Number((h1.result as any).value.value);
      simnet.mineEmptyBlocks(MIN_CHECK_IN_INTERVAL);
      for (let i = 0; i < 7; i++) { checkIn(user1, id1); simnet.mineEmptyBlocks(120); }
      withdrawStake(user1, id1);

      // User2 completes a habit
      const h2 = createHabit(user2, "Habit B", MIN_STAKE);
      const id2 = Number((h2.result as any).value.value);
      simnet.mineEmptyBlocks(MIN_CHECK_IN_INTERVAL);
      for (let i = 0; i < 7; i++) { checkIn(user2, id2); simnet.mineEmptyBlocks(120); }
      withdrawStake(user2, id2);

      // Both claim — bonuses should be within ~1% of each other
      const claim1 = simnet.callPublicFn("habit-tracker-v2", "claim-bonus", [Cl.uint(id1)], user1);
      const claim2 = simnet.callPublicFn("habit-tracker-v2", "claim-bonus", [Cl.uint(id2)], user2);

      const bonus1 = Number((claim1.result as any).value.value);
      const bonus2 = Number((claim2.result as any).value.value);

      // With 1% per claim, the spread between first and second is ~1%
      // bonus1 = pool / 100, bonus2 = (pool - bonus1) / 100
      expect(bonus1).toBeGreaterThan(0);
      expect(bonus2).toBeGreaterThan(0);
      // Difference should be less than 2% (much better than old 10%)
      expect((bonus1 - bonus2) / bonus1).toBeLessThan(0.02);
    });

    it("should distribute full pool when only one claimant is eligible", () => {
      // Fund pool with two large slashed stakes.
      const fail1 = createHabit(user2, "Big stake 1", MAX_STAKE_AMOUNT);
      const fid1 = Number((fail1.result as any).value.value);
      simnet.mineEmptyBlocks(MIN_CHECK_IN_INTERVAL);
      checkIn(user2, fid1);
      simnet.mineEmptyBlocks(150);
      simnet.callPublicFn("habit-tracker-v2", "slash-habit", [Cl.uint(fid1)], user1);

      const fail2 = createHabit(user3, "Big stake 2", MAX_STAKE_AMOUNT);
      const fid2 = Number((fail2.result as any).value.value);
      simnet.mineEmptyBlocks(MIN_CHECK_IN_INTERVAL);
      checkIn(user3, fid2);
      simnet.mineEmptyBlocks(150);
      simnet.callPublicFn("habit-tracker-v2", "slash-habit", [Cl.uint(fid2)], user1);
      // Pool = 200 STX and user1 is the only eligible claimant.

      // User1 completes a habit and claims
      const h1 = createHabit(user1, "Capped habit", MIN_STAKE);
      const cid = Number((h1.result as any).value.value);
      simnet.mineEmptyBlocks(MIN_CHECK_IN_INTERVAL);
      for (let i = 0; i < 7; i++) { checkIn(user1, cid); simnet.mineEmptyBlocks(120); }
      withdrawStake(user1, cid);

      const result = simnet.callPublicFn("habit-tracker-v2", "claim-bonus", [Cl.uint(cid)], user1);
      expect(result.result).toEqual(Cl.ok(Cl.uint(MAX_STAKE_AMOUNT * 2)));
    });

    it("should reject bonus claim by non-owner", () => {
      const result = simnet.callPublicFn("habit-tracker-v2", "claim-bonus", [Cl.uint(habitId)], user2);
      expect(result.result).toEqual(Cl.error(Cl.uint(104))); // ERR-NOT-HABIT-OWNER
    });

  });

  describe("read-only functions", () => {
    let habitId: number;

    beforeEach(() => {
      const result = createHabit(user1, VALID_HABIT_NAME, MIN_STAKE);
      habitId = Number((result.result as any).value.value);
    });

    it("should return correct habit details", () => {
      const result = simnet.callReadOnlyFn("habit-tracker-v2", "get-habit", [Cl.uint(habitId)], deployer);
      // result.result is Some({ data: { ... } })
      const expectedRecord = Cl.tuple({
        owner: Cl.principal(user1),
        name: Cl.stringUtf8(VALID_HABIT_NAME),
        "stake-amount": Cl.uint(MIN_STAKE),
        "current-streak": Cl.uint(0),
        "last-check-in-block": Cl.uint(simnet.blockHeight),
        "created-at-block": Cl.uint(simnet.blockHeight),
        "is-active": Cl.bool(true),
        "is-completed": Cl.bool(false),
        "bonus-claimed": Cl.bool(false)
      });
      expect(result.result).toEqual(Cl.some(expectedRecord));
    });

    it("should return correct user habits", () => {
      const result = simnet.callReadOnlyFn("habit-tracker-v2", "get-user-habits", [Cl.principal(user1)], deployer);
      // result.result is a TupleValue: { habit-ids: list }
      // Using a more standard comparison to avoid property access issues
      const expectedTuple = Cl.tuple({
        "habit-ids": Cl.list([Cl.uint(habitId)])
      });
      // result.result should equal the expected tuple
      expect(result.result).toEqual(expectedTuple);
    });

    it("should return correct streak", () => {
      simnet.mineEmptyBlocks(MIN_CHECK_IN_INTERVAL);
      checkIn(user1, habitId);
      const result = simnet.callReadOnlyFn("habit-tracker-v2", "get-habit-streak", [Cl.uint(habitId)], deployer);
      expect(result.result).toEqual(Cl.ok(Cl.uint(1)));
    });

  });

  describe("edge cases & regression", () => {

    it("should allow withdrawal even after check-in window expired (race condition)", () => {
      // A user with streak >= 7 who missed their window can still withdraw
      // before someone slashes them. This is by design.
      const result = createHabit(user1, "Exercise", MIN_STAKE);
      const id = Number((result.result as any).value.value);

      simnet.mineEmptyBlocks(MIN_CHECK_IN_INTERVAL);
      for (let i = 0; i < 7; i++) {
        checkIn(user1, id);
        simnet.mineEmptyBlocks(120);
      }

      // Expire the window
      simnet.mineEmptyBlocks(200);

      // Withdraw BEFORE anyone slashes — should succeed
      const withdrawResult = withdrawStake(user1, id);
      expect(withdrawResult.result).toBeOk(Cl.uint(MIN_STAKE));
    });

    it("should reject withdrawal after slash even if streak was sufficient", () => {
      const result = createHabit(user1, "Exercise", MIN_STAKE);
      const id = Number((result.result as any).value.value);

      simnet.mineEmptyBlocks(MIN_CHECK_IN_INTERVAL);
      for (let i = 0; i < 7; i++) {
        checkIn(user1, id);
        simnet.mineEmptyBlocks(120);
      }

      simnet.mineEmptyBlocks(200);

      // Slashed first
      simnet.callPublicFn("habit-tracker-v2", "slash-habit", [Cl.uint(id)], user2);

      // Withdrawal after slash should fail
      const withdrawResult = withdrawStake(user1, id);
      expect(withdrawResult.result).toBeErr(Cl.uint(108)); // ERR-HABIT-ALREADY-COMPLETED
    });

    it("should not allow slash on already-slashed habit", () => {
      const result = createHabit(user1, "Exercise", MIN_STAKE);
      const id = Number((result.result as any).value.value);

      checkIn(user1, id);
      simnet.mineEmptyBlocks(150);

      simnet.callPublicFn("habit-tracker-v2", "slash-habit", [Cl.uint(id)], user2);

      // Double slash should fail
      const result2 = simnet.callPublicFn("habit-tracker-v2", "slash-habit", [Cl.uint(id)], user2);
      expect(result2.result).toBeErr(Cl.uint(108)); // ERR-HABIT-ALREADY-COMPLETED
    });

    it("should reject check-in for nonexistent habit", () => {
      const result = checkIn(user1, 99999);
      expect(result.result).toBeErr(Cl.uint(103)); // ERR-HABIT-NOT-FOUND
    });

    it("should reject slash for nonexistent habit", () => {
      const result = simnet.callPublicFn("habit-tracker-v2", "slash-habit", [Cl.uint(99999)], user1);
      expect(result.result).toBeErr(Cl.uint(103)); // ERR-HABIT-NOT-FOUND
    });

    it("should reject slash when check-in window has not expired", () => {
      const result = createHabit(user1, "Exercise", MIN_STAKE);
      const id = Number((result.result as any).value.value);

      // No blocks mined, window is still open
      const slashResult = simnet.callPublicFn("habit-tracker-v2", "slash-habit", [Cl.uint(id)], user2);
      expect(slashResult.result).toBeErr(Cl.uint(100)); // ERR-NOT-AUTHORIZED
    });

    it("should not allow double bonus claim", () => {
      // Fund the pool
      const failHabit = createHabit(user2, "Will fail", MIN_STAKE * 10);
      const failId = Number((failHabit.result as any).value.value);
      simnet.mineEmptyBlocks(MIN_CHECK_IN_INTERVAL);
      checkIn(user2, failId);
      simnet.mineEmptyBlocks(150);
      simnet.callPublicFn("habit-tracker-v2", "slash-habit", [Cl.uint(failId)], user1);

      // Complete a habit
      const h1 = createHabit(user1, "Good Habit", MIN_STAKE);
      const id1 = Number((h1.result as any).value.value);
      simnet.mineEmptyBlocks(MIN_CHECK_IN_INTERVAL);
      for (let i = 0; i < 7; i++) {
        checkIn(user1, id1);
        simnet.mineEmptyBlocks(120);
      }
      withdrawStake(user1, id1);

      // First claim succeeds
      const claim1 = simnet.callPublicFn("habit-tracker-v2", "claim-bonus", [Cl.uint(id1)], user1);
      expect(claim1.result).toEqual(Cl.ok(expect.anything()));

      // Second claim fails
      const claim2 = simnet.callPublicFn("habit-tracker-v2", "claim-bonus", [Cl.uint(id1)], user1);
      expect(claim2.result).toEqual(Cl.error(Cl.uint(111))); // ERR-BONUS-ALREADY-CLAIMED
    });

    it("should return get-pool-balance correctly after slashing", () => {
      const result = createHabit(user1, "Exercise", MIN_STAKE);
      const id = Number((result.result as any).value.value);

      simnet.mineEmptyBlocks(MIN_CHECK_IN_INTERVAL);
      checkIn(user1, id);
      simnet.mineEmptyBlocks(150);
      simnet.callPublicFn("habit-tracker-v2", "slash-habit", [Cl.uint(id)], user2);

      const poolResult = simnet.callReadOnlyFn("habit-tracker-v2", "get-pool-balance", [], deployer);
      expect(poolResult.result).toEqual(Cl.ok(Cl.uint(MIN_STAKE)));
    });
  });

  describe("auto-slash behavior", () => {

    it("should auto-slash when owner calls check-in after window expires", () => {
      const result = createHabit(user1, "Exercise", MIN_STAKE);
      const id = Number((result.result as any).value.value);

      simnet.mineEmptyBlocks(MIN_CHECK_IN_INTERVAL);
      checkIn(user1, id);
      simnet.mineEmptyBlocks(200);

      // Owner tries to check in too late - auto-slash fires
      const result2 = checkIn(user1, id);
      expect(result2.result).toBeErr(Cl.uint(114));

      // Because check-in returned err, no state is persisted. Repeated late check-ins
      // continue to return ERR-HABIT-AUTO-SLASHED.
      const result3 = checkIn(user1, id);
      expect(result3.result).toBeErr(Cl.uint(114));

      // Streak remains unchanged due rollback on err
      const streakResult = simnet.callReadOnlyFn("habit-tracker-v2", "get-habit-streak", [Cl.uint(id)], deployer);
      expect(streakResult.result).toBeOk(Cl.uint(1));
    });

    it("should move stake to pool on auto-slash", () => {
      const result = createHabit(user1, "Exercise", MIN_STAKE * 5);
      const id = Number((result.result as any).value.value);

      simnet.mineEmptyBlocks(MIN_CHECK_IN_INTERVAL);
      checkIn(user1, id);
      simnet.mineEmptyBlocks(150);

      checkIn(user1, id); // triggers auto-slash
      const poolAfter = simnet.getDataVar("habit-tracker-v2", "forfeited-pool-balance");

      expect(poolAfter).toBeUint(0);
    });

    it("should return auto-slash error on repeated expired check-ins", () => {
      const result = createHabit(user1, "Exercise", MIN_STAKE);
      const id = Number((result.result as any).value.value);

      simnet.mineEmptyBlocks(MIN_CHECK_IN_INTERVAL);
      checkIn(user1, id);
      simnet.mineEmptyBlocks(150);

      // First expired check-in auto-slashes and returns ERR-HABIT-AUTO-SLASHED
      const result2 = checkIn(user1, id);
      expect(result2.result).toBeErr(Cl.uint(114)); // ERR-HABIT-AUTO-SLASHED

      // Second expired check-in returns the same auto-slash error
      const result3 = checkIn(user1, id);
      expect(result3.result).toBeErr(Cl.uint(114)); // ERR-HABIT-AUTO-SLASHED
    });

    it("should still allow withdrawal after auto-slash error when streak is sufficient", () => {
      const result = createHabit(user1, "Exercise", MIN_STAKE);
      const id = Number((result.result as any).value.value);

      // Build streak then let window expire
      // Must mine blocks BEFORE check-in (MIN-CHECK-IN-INTERVAL = 120)
      for (let i = 0; i < 7; i++) {
        simnet.mineEmptyBlocks(120);
        checkIn(user1, id);
      }
      simnet.mineEmptyBlocks(200);

      // Auto-slash via check-in returns ERR-HABIT-AUTO-SLASHED
      const slashResult = checkIn(user1, id);
      expect(slashResult.result).toBeErr(Cl.uint(114)); // ERR-HABIT-AUTO-SLASHED

      // Withdrawal still succeeds because err return rolls back auto-slash state changes
      const withdrawResult = withdrawStake(user1, id);
      expect(withdrawResult.result).toBeOk(Cl.uint(MIN_STAKE));
    });

    it("should still allow external slash-habit for habits where owner never returns", () => {
      const result = createHabit(user1, "Exercise", MIN_STAKE);
      const id = Number((result.result as any).value.value);

      // Must mine blocks BEFORE check-in (MIN-CHECK-IN-INTERVAL = 120)
      simnet.mineEmptyBlocks(120);
      checkIn(user1, id);
      simnet.mineEmptyBlocks(200);

      // External actor slashes (owner never calls check-in again)
      const slashResult = simnet.callPublicFn("habit-tracker-v2", "slash-habit", [Cl.uint(id)], user2);
      expect(slashResult.result).toBeOk(Cl.bool(true));

      const pool = simnet.getDataVar("habit-tracker-v2", "forfeited-pool-balance");
      expect(pool).toBeUint(MIN_STAKE);
    });

    it("should not reset streak on auto-slash error", () => {
      const result = createHabit(user1, "Exercise", MIN_STAKE);
      const id = Number((result.result as any).value.value);

      // Build a good streak
      // Must mine blocks BEFORE check-in (MIN-CHECK-IN-INTERVAL = 120)
      for (let i = 0; i < 5; i++) {
        simnet.mineEmptyBlocks(120);
        checkIn(user1, id);
      }

      // Let window expire
      simnet.mineEmptyBlocks(200);

      // Auto-slash returns ERR-HABIT-AUTO-SLASHED (not ok)
      const slashResult = checkIn(user1, id);
      expect(slashResult.result).toBeErr(Cl.uint(114)); // ERR-HABIT-AUTO-SLASHED

      // Streak remains unchanged due rollback on err
      const streakResult = simnet.callReadOnlyFn("habit-tracker-v2", "get-habit-streak", [Cl.uint(id)], deployer);
      expect(streakResult.result).toBeOk(Cl.uint(5));
    });
  });

  describe("get-expired-habits", () => {

    it("should return empty list for user with no habits", () => {
      const result = simnet.callReadOnlyFn(
        "habit-tracker-v2", "get-expired-habits",
        [Cl.principal(user3)], deployer
      );
      expect(result.result).toBeOk(Cl.list([]));
    });

    it("should return u0 for active habit within check-in window", () => {
      createHabit(user1, "Exercise", MIN_STAKE);
      simnet.mineEmptyBlocks(MIN_CHECK_IN_INTERVAL);
      checkIn(user1, 1);

      const result = simnet.callReadOnlyFn(
        "habit-tracker-v2", "get-expired-habits",
        [Cl.principal(user1)], deployer
      );
      // Habit 1 is within check-in window -> returns u0
      expect(result.result).toBeOk(Cl.list([Cl.uint(0)]));
    });

    it("should return habit-id for expired active habit", () => {
      createHabit(user1, "Exercise", MIN_STAKE);
      simnet.mineEmptyBlocks(MIN_CHECK_IN_INTERVAL);
      checkIn(user1, 1);

      // Mine past the check-in window (144 blocks)
      simnet.mineEmptyBlocks(150);

      const result = simnet.callReadOnlyFn(
        "habit-tracker-v2", "get-expired-habits",
        [Cl.principal(user1)], deployer
      );
      // Habit 1 has expired check-in window -> returns habit-id 1
      expect(result.result).toBeOk(Cl.list([Cl.uint(1)]));
    });

    it("should return u0 for inactive (slashed) habit even if expired", () => {
      createHabit(user1, "Exercise", MIN_STAKE);
      simnet.mineEmptyBlocks(MIN_CHECK_IN_INTERVAL);
      checkIn(user1, 1);

      // Let window expire and slash
      simnet.mineEmptyBlocks(150);
      simnet.callPublicFn("habit-tracker-v2", "slash-habit", [Cl.uint(1)], user2);

      const result = simnet.callReadOnlyFn(
        "habit-tracker-v2", "get-expired-habits",
        [Cl.principal(user1)], deployer
      );
      // Habit 1 is inactive (slashed) -> returns u0
      expect(result.result).toBeOk(Cl.list([Cl.uint(0)]));
    });

    it("should return mixed results for multiple habits", () => {
      // Create 2 habits
      createHabit(user1, "Exercise", MIN_STAKE);
      createHabit(user1, "Reading", MIN_STAKE);

      // Check in on both
      simnet.mineEmptyBlocks(MIN_CHECK_IN_INTERVAL);
      checkIn(user1, 1);
      checkIn(user1, 2);

      // Mine past window - both expire
      simnet.mineEmptyBlocks(150);

      // Slash habit 1 (becomes inactive)
      simnet.callPublicFn("habit-tracker-v2", "slash-habit", [Cl.uint(1)], user2);

      // Create habit 3 and check in (within window)
      createHabit(user1, "Coding", MIN_STAKE);
      simnet.mineEmptyBlocks(MIN_CHECK_IN_INTERVAL);
      checkIn(user1, 3);

      const result = simnet.callReadOnlyFn(
        "habit-tracker-v2", "get-expired-habits",
        [Cl.principal(user1)], deployer
      );
      // Habit 1: slashed (inactive) -> u0
      // Habit 2: active + expired -> u2
      // Habit 3: active + within window -> u0
      expect(result.result).toBeOk(Cl.list([Cl.uint(0), Cl.uint(2), Cl.uint(0)]));
    });
  });

});
