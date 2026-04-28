import { describe, expect, it } from "vitest";
import { Cl } from "@stacks/transactions";
import {
  buildStreak,
  createHabit,
  mineBlocks,
  readOkUint,
  slashHabit,
  withdrawStake,
} from "./helpers/habit-flow";

const accounts = simnet.getAccounts();
const deployer = accounts.get("deployer")!;
const user1 = accounts.get("wallet_1")!;
const user2 = accounts.get("wallet_2")!;
const user3 = accounts.get("wallet_3")!;

const MIN_STAKE = 20_000;

describe("bonus claim e2e", () => {
  it("funds the pool and splits bonuses across claimants", () => {
    const failing = createHabit(user3, "Pool Source", MIN_STAKE * 3);
    const failingId = readOkUint(failing);
    buildStreak(user3, failingId, 1);

    mineBlocks(150);
    const slash = slashHabit(user2, failingId);
    expect(slash.result).toBeOk(Cl.bool(true));

    const habit1 = createHabit(user1, "Habit A", MIN_STAKE);
    const habit1Id = readOkUint(habit1);
    buildStreak(user1, habit1Id, 7);
    const withdrawal1 = withdrawStake(user1, habit1Id);
    expect(withdrawal1.result).toBeOk(Cl.uint(MIN_STAKE));

    const habit2 = createHabit(user2, "Habit B", MIN_STAKE);
    const habit2Id = readOkUint(habit2);
    buildStreak(user2, habit2Id, 7);
    const withdrawal2 = withdrawStake(user2, habit2Id);
    expect(withdrawal2.result).toBeOk(Cl.uint(MIN_STAKE));

    const unclaimed = simnet.callReadOnlyFn(
      "habit-tracker-v2",
      "get-unclaimed-completed-habits",
      [],
      deployer,
    );
    expect(unclaimed.result).toBeOk(Cl.uint(2));

    const pool = simnet.callReadOnlyFn(
      "habit-tracker-v2",
      "get-pool-balance",
      [],
      deployer,
    );
    expect(pool.result).toBeOk(Cl.uint(MIN_STAKE * 3));

    const claim1 = simnet.callPublicFn(
      "habit-tracker-v2",
      "claim-bonus",
      [Cl.uint(habit1Id)],
      user1,
    );
    const claim1Amount = readOkUint(claim1);
    expect(claim1.result).toBeOk(Cl.uint(claim1Amount));

    const claim2 = simnet.callPublicFn(
      "habit-tracker-v2",
      "claim-bonus",
      [Cl.uint(habit2Id)],
      user2,
    );
    const claim2Amount = readOkUint(claim2);
    expect(claim2.result).toBeOk(Cl.uint(claim2Amount));
    expect(claim1Amount).toBe(claim2Amount);

    const poolAfter = simnet.callReadOnlyFn(
      "habit-tracker-v2",
      "get-pool-balance",
      [],
      deployer,
    );
    expect(poolAfter.result).toBeOk(Cl.uint(0));

    const unclaimedAfter = simnet.callReadOnlyFn(
      "habit-tracker-v2",
      "get-unclaimed-completed-habits",
      [],
      deployer,
    );
    expect(unclaimedAfter.result).toBeOk(Cl.uint(0));
  });
});
