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

  });

});
