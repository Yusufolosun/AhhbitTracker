import { describe, expect, it } from "vitest";
import { Cl } from "@stacks/transactions";
import {
  buildStreak,
  checkIn,
  createHabit,
  mineBlocks,
  readOkUint,
  slashHabit,
} from "./helpers/habit-flow";

const accounts = simnet.getAccounts();
const deployer = accounts.get("deployer")!;
const user1 = accounts.get("wallet_1")!;
const user2 = accounts.get("wallet_2")!;

const MIN_STAKE = 20_000;

describe("expired habit e2e", () => {
  it("slashes an expired habit and moves stake to pool", () => {
    const created = createHabit(user1, "Expire Me", MIN_STAKE);
    const habitId = readOkUint(created);

    buildStreak(user1, habitId, 1);
    mineBlocks(150);

    const slash = slashHabit(user2, habitId);
    expect(slash.result).toBeOk(Cl.bool(true));

    const pool = simnet.callReadOnlyFn(
      "habit-tracker-v2",
      "get-pool-balance",
      [],
      deployer,
    );
    expect(pool.result).toBeOk(Cl.uint(MIN_STAKE));

    const habit = simnet.callReadOnlyFn(
      "habit-tracker-v2",
      "get-habit",
      [Cl.uint(habitId)],
      deployer,
    );
    expect(habit.result).not.toBeNone();

    const lateCheckIn = checkIn(user1, habitId);
    expect(lateCheckIn.result).toBeErr(Cl.uint(108));
  });
});
