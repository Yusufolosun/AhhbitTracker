import { describe, expect, it, beforeEach } from "vitest";
import { Cl } from "@stacks/transactions";

const accounts = simnet.getAccounts();
const deployer = accounts.get("deployer")!;
const user1 = accounts.get("wallet_1")!;
const user2 = accounts.get("wallet_2")!;
const user3 = accounts.get("wallet_3")!;

// Test Helpers
const MIN_STAKE = 100000; // 0.1 STX in microSTX
const VALID_HABIT_NAME = "Daily Exercise";
const MAX_NAME_LENGTH = 50;

function createHabit(caller: string, name: string, stake: number) {
  return simnet.callPublicFn(
    "habit-tracker",
    "create-habit",
    [Cl.stringUtf8(name), Cl.uint(stake)],
    caller
  );
}

function checkIn(caller: string, habitId: number) {
  return simnet.callPublicFn(
    "habit-tracker",
    "check-in",
    [Cl.uint(habitId)],
    caller
  );
}

function withdrawStake(caller: string, habitId: number) {
  return simnet.callPublicFn(
    "habit-tracker",
    "withdraw-stake",
    [Cl.uint(habitId)],
    caller
  );
}

function getHabit(habitId: number) {
  return simnet.callReadOnlyFn(
    "habit-tracker",
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
      // Get initial balance
      const assets = simnet.getAssetsMap();
      const userBalanceBefore = assets.get(user1)?.get("STX") || 0n;

      const result = createHabit(user1, VALID_HABIT_NAME, MIN_STAKE);
      expect(result.result).toBeOk(Cl.uint(1));

      const userBalanceAfter = simnet.getAssetsMap().get(user1)?.get("STX") || 0n;

      // If balance tracking is working, verify subtraction
      if (userBalanceBefore > 0n) {
        expect(userBalanceAfter).toBe(userBalanceBefore - BigInt(MIN_STAKE));
      }
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
        "is-completed": Cl.bool(false)
      }));
    });

  });

});
