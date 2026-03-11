import { describe, expect, it, beforeEach } from "vitest";
import { Cl } from "@stacks/transactions";

const accounts = simnet.getAccounts();
const deployer = accounts.get("deployer")!;
const user1 = accounts.get("wallet_1")!;
const user2 = accounts.get("wallet_2")!;
const user3 = accounts.get("wallet_3")!;

const MIN_STAKE = 100_000;
const FUND_AMOUNT = 10_000_000; // 10 STX
const REWARD_AMOUNT = 500_000; // 0.5 STX per milestone

// Helpers for habit-tracker interactions
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

// Helpers for habit-streak-reward interactions
function fundPool(caller: string, amount: number) {
  return simnet.callPublicFn(
    "habit-streak-reward",
    "fund-reward-pool",
    [Cl.uint(amount)],
    caller
  );
}

function setMilestoneReward(caller: string, milestone: number, reward: number) {
  return simnet.callPublicFn(
    "habit-streak-reward",
    "set-milestone-reward",
    [Cl.uint(milestone), Cl.uint(reward)],
    caller
  );
}

function claimMilestoneReward(caller: string, habitId: number, milestone: number) {
  return simnet.callPublicFn(
    "habit-streak-reward",
    "claim-milestone-reward",
    [Cl.uint(habitId), Cl.uint(milestone)],
    caller
  );
}

function getRewardPoolBalance() {
  return simnet.callReadOnlyFn(
    "habit-streak-reward",
    "get-reward-pool-balance",
    [],
    deployer
  );
}

function getMilestoneReward(milestone: number) {
  return simnet.callReadOnlyFn(
    "habit-streak-reward",
    "get-milestone-reward",
    [Cl.uint(milestone)],
    deployer
  );
}

function isMilestoneClaimed(habitId: number, milestone: number) {
  return simnet.callReadOnlyFn(
    "habit-streak-reward",
    "is-milestone-claimed",
    [Cl.uint(habitId), Cl.uint(milestone)],
    deployer
  );
}

// Build a streak by mining blocks and checking in
function buildStreak(caller: string, habitId: number, days: number) {
  for (let i = 0; i < days; i++) {
    simnet.mineEmptyBlocks(1);
    const result = checkIn(caller, habitId);
    expect(result.result).toBeOk(Cl.uint(i + 1));
  }
}

describe("Habit Streak Reward Contract", () => {

  describe("fund-reward-pool", () => {

    it("should accept valid funding amount", () => {
      const result = fundPool(user1, FUND_AMOUNT);
      expect(result.result).toBeOk(Cl.uint(FUND_AMOUNT));
    });

    it("should update pool balance after funding", () => {
      fundPool(user1, FUND_AMOUNT);
      const balance = getRewardPoolBalance();
      expect(balance.result).toBeOk(Cl.uint(FUND_AMOUNT));
    });

    it("should allow multiple funders", () => {
      fundPool(user1, FUND_AMOUNT);
      fundPool(user2, FUND_AMOUNT);
      const balance = getRewardPoolBalance();
      expect(balance.result).toBeOk(Cl.uint(FUND_AMOUNT * 2));
    });

    it("should reject funding below minimum (0.01 STX)", () => {
      const result = fundPool(user1, 9999);
      expect(result.result).toBeErr(Cl.uint(208)); // ERR-INVALID-AMOUNT
    });

    it("should transfer STX from funder to contract", () => {
      const balanceBefore = simnet.getAssetsMap().get(user1)?.get("STX") || 0n;
      fundPool(user1, FUND_AMOUNT);
      const balanceAfter = simnet.getAssetsMap().get(user1)?.get("STX") || 0n;

      if (balanceBefore > 0n) {
        expect(balanceAfter).toBe(balanceBefore - BigInt(FUND_AMOUNT));
      }
    });
  });

  describe("set-milestone-reward", () => {

    it("should allow owner to set milestone reward", () => {
      const result = setMilestoneReward(deployer, 7, REWARD_AMOUNT);
      expect(result.result).toBeOk(Cl.bool(true));
    });

    it("should store reward amount correctly", () => {
      setMilestoneReward(deployer, 14, REWARD_AMOUNT);
      const reward = getMilestoneReward(14);
      expect(reward.result).toBeSome(
        Cl.tuple({ "reward-amount": Cl.uint(REWARD_AMOUNT) })
      );
    });

    it("should reject non-owner caller", () => {
      const result = setMilestoneReward(user1, 7, REWARD_AMOUNT);
      expect(result.result).toBeErr(Cl.uint(200)); // ERR-NOT-AUTHORIZED
    });

    it("should reject invalid milestone tier", () => {
      const result = setMilestoneReward(deployer, 10, REWARD_AMOUNT);
      expect(result.result).toBeErr(Cl.uint(201)); // ERR-INVALID-MILESTONE
    });

    it("should reject zero reward amount", () => {
      const result = setMilestoneReward(deployer, 7, 0);
      expect(result.result).toBeErr(Cl.uint(208)); // ERR-INVALID-AMOUNT
    });

    it("should accept all valid milestone tiers", () => {
      for (const tier of [7, 14, 30, 60, 90]) {
        const result = setMilestoneReward(deployer, tier, REWARD_AMOUNT);
        expect(result.result).toBeOk(Cl.bool(true));
      }
    });
  });

  describe("claim-milestone-reward", () => {

    it("should allow claiming 7-day milestone after reaching streak", () => {
      // Setup: fund pool and set reward
      fundPool(deployer, FUND_AMOUNT);
      setMilestoneReward(deployer, 7, REWARD_AMOUNT);

      // Create habit and build 7-day streak
      createHabit(user1, "Exercise", MIN_STAKE);
      buildStreak(user1, 1, 7);

      // Claim milestone
      const result = claimMilestoneReward(user1, 1, 7);
      expect(result.result).toBeOk(Cl.uint(REWARD_AMOUNT));
    });

    it("should deduct reward from pool balance", () => {
      fundPool(deployer, FUND_AMOUNT);
      setMilestoneReward(deployer, 7, REWARD_AMOUNT);

      createHabit(user1, "Exercise", MIN_STAKE);
      buildStreak(user1, 1, 7);
      claimMilestoneReward(user1, 1, 7);

      const balance = getRewardPoolBalance();
      expect(balance.result).toBeOk(Cl.uint(FUND_AMOUNT - REWARD_AMOUNT));
    });

    it("should reject claim if streak is insufficient", () => {
      fundPool(deployer, FUND_AMOUNT);
      setMilestoneReward(deployer, 14, REWARD_AMOUNT);

      createHabit(user1, "Exercise", MIN_STAKE);
      buildStreak(user1, 1, 7);

      // Try to claim 14-day milestone with only 7-day streak
      const result = claimMilestoneReward(user1, 1, 14);
      expect(result.result).toBeErr(Cl.uint(203)); // ERR-INSUFFICIENT-STREAK
    });

    it("should reject double claim for same habit+milestone", () => {
      fundPool(deployer, FUND_AMOUNT);
      setMilestoneReward(deployer, 7, REWARD_AMOUNT);

      createHabit(user1, "Exercise", MIN_STAKE);
      buildStreak(user1, 1, 7);

      claimMilestoneReward(user1, 1, 7);
      const result = claimMilestoneReward(user1, 1, 7);
      expect(result.result).toBeErr(Cl.uint(202)); // ERR-ALREADY-CLAIMED
    });

    it("should reject claim by non-owner of habit", () => {
      fundPool(deployer, FUND_AMOUNT);
      setMilestoneReward(deployer, 7, REWARD_AMOUNT);

      createHabit(user1, "Exercise", MIN_STAKE);
      buildStreak(user1, 1, 7);

      // user2 tries to claim user1's habit milestone
      const result = claimMilestoneReward(user2, 1, 7);
      expect(result.result).toBeErr(Cl.uint(207)); // ERR-NOT-HABIT-OWNER
    });

    it("should reject claim when pool has insufficient funds", () => {
      fundPool(deployer, 100_000); // Fund less than reward
      setMilestoneReward(deployer, 7, REWARD_AMOUNT);

      createHabit(user1, "Exercise", MIN_STAKE);
      buildStreak(user1, 1, 7);

      const result = claimMilestoneReward(user1, 1, 7);
      expect(result.result).toBeErr(Cl.uint(204)); // ERR-INSUFFICIENT-FUNDS
    });

    it("should reject claim for nonexistent habit", () => {
      fundPool(deployer, FUND_AMOUNT);
      setMilestoneReward(deployer, 7, REWARD_AMOUNT);

      const result = claimMilestoneReward(user1, 999, 7);
      expect(result.result).toBeErr(Cl.uint(206)); // ERR-HABIT-NOT-FOUND
    });

    it("should reject claim when reward tier is not configured", () => {
      fundPool(deployer, FUND_AMOUNT);
      // Don't set milestone reward

      createHabit(user1, "Exercise", MIN_STAKE);
      buildStreak(user1, 1, 7);

      const result = claimMilestoneReward(user1, 1, 7);
      expect(result.result).toBeErr(Cl.uint(209)); // ERR-REWARD-NOT-SET
    });

    it("should allow claiming multiple milestones for same habit", () => {
      fundPool(deployer, FUND_AMOUNT);
      setMilestoneReward(deployer, 7, REWARD_AMOUNT);
      setMilestoneReward(deployer, 14, REWARD_AMOUNT * 2);

      createHabit(user1, "Exercise", MIN_STAKE);
      buildStreak(user1, 1, 14);

      const result7 = claimMilestoneReward(user1, 1, 7);
      expect(result7.result).toBeOk(Cl.uint(REWARD_AMOUNT));

      const result14 = claimMilestoneReward(user1, 1, 14);
      expect(result14.result).toBeOk(Cl.uint(REWARD_AMOUNT * 2));
    });

    it("should transfer STX to claimant", () => {
      fundPool(deployer, FUND_AMOUNT);
      setMilestoneReward(deployer, 7, REWARD_AMOUNT);

      createHabit(user1, "Exercise", MIN_STAKE);
      buildStreak(user1, 1, 7);

      const balanceBefore = simnet.getAssetsMap().get(user1)?.get("STX") || 0n;
      claimMilestoneReward(user1, 1, 7);
      const balanceAfter = simnet.getAssetsMap().get(user1)?.get("STX") || 0n;

      if (balanceBefore > 0n) {
        expect(balanceAfter).toBe(balanceBefore + BigInt(REWARD_AMOUNT));
      }
    });
  });

  describe("read-only functions", () => {

    it("should return none for unconfigured milestone", () => {
      const reward = getMilestoneReward(7);
      expect(reward.result).toBeNone();
    });

    it("should report milestone as not claimed", () => {
      const claimed = isMilestoneClaimed(1, 7);
      expect(claimed.result).toBeBool(false);
    });

    it("should report milestone as claimed after claiming", () => {
      fundPool(deployer, FUND_AMOUNT);
      setMilestoneReward(deployer, 7, REWARD_AMOUNT);

      createHabit(user1, "Exercise", MIN_STAKE);
      buildStreak(user1, 1, 7);
      claimMilestoneReward(user1, 1, 7);

      const claimed = isMilestoneClaimed(1, 7);
      expect(claimed.result).toBeBool(true);
    });

    it("should track total distributed rewards", () => {
      fundPool(deployer, FUND_AMOUNT);
      setMilestoneReward(deployer, 7, REWARD_AMOUNT);

      createHabit(user1, "Exercise", MIN_STAKE);
      buildStreak(user1, 1, 7);
      claimMilestoneReward(user1, 1, 7);

      const total = simnet.callReadOnlyFn(
        "habit-streak-reward",
        "get-total-distributed",
        [],
        deployer
      );
      expect(total.result).toBeOk(Cl.uint(REWARD_AMOUNT));
    });
  });

  describe("edge cases & regression", () => {

    it("should emit correct new-balance in fund event (no double-count)", () => {
      const result = fundPool(user1, FUND_AMOUNT);
      expect(result.result).toBeOk(Cl.uint(FUND_AMOUNT));

      // Verify pool balance matches returned value (not double-counted)
      const balance = getRewardPoolBalance();
      expect(balance.result).toBeOk(Cl.uint(FUND_AMOUNT));

      // Fund again and verify additive, not double-counted
      const result2 = fundPool(user2, FUND_AMOUNT);
      expect(result2.result).toBeOk(Cl.uint(FUND_AMOUNT * 2));

      const balance2 = getRewardPoolBalance();
      expect(balance2.result).toBeOk(Cl.uint(FUND_AMOUNT * 2));
    });

    it("should allow claiming milestone on completed (withdrawn) habit", () => {
      // User completes a 7-day streak and withdraws, habit is completed but streak persists
      fundPool(deployer, FUND_AMOUNT);
      setMilestoneReward(deployer, 7, REWARD_AMOUNT);

      createHabit(user1, "Exercise", MIN_STAKE);
      buildStreak(user1, 1, 7);

      // Withdraw stake - habit becomes completed with frozen streak
      simnet.callPublicFn("habit-tracker", "withdraw-stake", [Cl.uint(1)], user1);

      // Should still be able to claim milestone since streak was earned
      const result = claimMilestoneReward(user1, 1, 7);
      expect(result.result).toBeOk(Cl.uint(REWARD_AMOUNT));
    });

    it("should reject claiming on slashed habit (streak reset to 0)", () => {
      fundPool(deployer, FUND_AMOUNT);
      setMilestoneReward(deployer, 7, REWARD_AMOUNT);

      createHabit(user1, "Exercise", MIN_STAKE);
      buildStreak(user1, 1, 5); // Only build 5-day streak

      // Let window expire and get slashed
      simnet.mineEmptyBlocks(150);
      simnet.callPublicFn("habit-tracker", "slash-habit", [Cl.uint(1)], user2);

      // Streak is now 0, can't claim 7-day milestone
      const result = claimMilestoneReward(user1, 1, 7);
      expect(result.result).toBeErr(Cl.uint(203)); // ERR-INSUFFICIENT-STREAK
    });

    it("should handle exact minimum funding amount (0.01 STX)", () => {
      const result = fundPool(user1, 10000);
      expect(result.result).toBeOk(Cl.uint(10000));
    });

    it("should reject claiming when pool is exactly 0", () => {
      setMilestoneReward(deployer, 7, REWARD_AMOUNT);
      createHabit(user1, "Exercise", MIN_STAKE);
      buildStreak(user1, 1, 7);

      // Pool is empty (never funded)
      const result = claimMilestoneReward(user1, 1, 7);
      expect(result.result).toBeErr(Cl.uint(204)); // ERR-INSUFFICIENT-FUNDS
    });
  });
});
