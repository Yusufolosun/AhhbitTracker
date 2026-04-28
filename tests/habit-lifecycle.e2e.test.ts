import { describe, expect, it } from "vitest";
import { Cl } from "@stacks/transactions";
import { buildStreak, createHabit, readOkUint, withdrawStake } from "./helpers/habit-flow";

const accounts = simnet.getAccounts();
const deployer = accounts.get("deployer")!;
const user1 = accounts.get("wallet_1")!;

const MIN_STAKE = 20_000;

describe("habit lifecycle e2e", () => {
  it("creates, checks in for 7 days, and withdraws stake", () => {
    const created = createHabit(user1, "Morning Run", MIN_STAKE);
    expect(created.result).toBeOk(Cl.uint(1));

    const habitId = readOkUint(created);
    buildStreak(user1, habitId, 7);

    const withdrawal = withdrawStake(user1, habitId);
    expect(withdrawal.result).toBeOk(Cl.uint(MIN_STAKE));

    const habit = simnet.callReadOnlyFn(
      "habit-tracker-v2",
      "get-habit",
      [Cl.uint(habitId)],
      deployer,
    );
    expect(habit.result).not.toBeNone();

    const streak = simnet.callReadOnlyFn(
      "habit-tracker-v2",
      "get-habit-streak",
      [Cl.uint(habitId)],
      deployer,
    );
    expect(streak.result).toBeOk(Cl.uint(7));

    const unclaimed = simnet.callReadOnlyFn(
      "habit-tracker-v2",
      "get-unclaimed-completed-habits",
      [],
      deployer,
    );
    expect(unclaimed.result).toBeOk(Cl.uint(1));
  });
});
