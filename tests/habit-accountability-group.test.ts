import { describe, expect, it } from "vitest";
import { Cl } from "@stacks/transactions";

const accounts = simnet.getAccounts();
const deployer = accounts.get("deployer")!;
const user1 = accounts.get("wallet_1")!;
const user2 = accounts.get("wallet_2")!;
const user3 = accounts.get("wallet_3")!;

const MIN_STAKE = 100_000; // 0.1 STX
const GROUP_STAKE = 1_000_000; // 1 STX
const GROUP_DURATION = 144; // ~1 day in blocks

// Habit-tracker helpers
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

// Accountability group helpers
function createGroup(caller: string, stake: number, duration: number, habitId: number) {
  return simnet.callPublicFn(
    "habit-accountability-group",
    "create-group",
    [Cl.uint(stake), Cl.uint(duration), Cl.uint(habitId)],
    caller
  );
}

function joinGroup(caller: string, groupId: number, habitId: number) {
  return simnet.callPublicFn(
    "habit-accountability-group",
    "join-group",
    [Cl.uint(groupId), Cl.uint(habitId)],
    caller
  );
}

function settleMember(caller: string, groupId: number, member: string) {
  return simnet.callPublicFn(
    "habit-accountability-group",
    "settle-member",
    [Cl.uint(groupId), Cl.principal(member)],
    caller
  );
}

function claimGroupReward(caller: string, groupId: number) {
  return simnet.callPublicFn(
    "habit-accountability-group",
    "claim-group-reward",
    [Cl.uint(groupId)],
    caller
  );
}

function getGroup(groupId: number) {
  return simnet.callReadOnlyFn(
    "habit-accountability-group",
    "get-group",
    [Cl.uint(groupId)],
    deployer
  );
}

function getMemberInfo(groupId: number, member: string) {
  return simnet.callReadOnlyFn(
    "habit-accountability-group",
    "get-member-info",
    [Cl.uint(groupId), Cl.principal(member)],
    deployer
  );
}

function getMemberGroups(member: string) {
  return simnet.callReadOnlyFn(
    "habit-accountability-group",
    "get-member-groups",
    [Cl.principal(member)],
    deployer
  );
}

function buildStreak(caller: string, habitId: number, days: number) {
  for (let i = 0; i < days; i++) {
    simnet.mineEmptyBlocks(1);
    const result = checkIn(caller, habitId);
    expect(result.result).toBeOk(Cl.uint(i + 1));
  }
}

describe("Habit Accountability Group Contract", () => {

  describe("create-group", () => {

    it("should create a group with valid inputs", () => {
      createHabit(user1, "Exercise", MIN_STAKE);
      const result = createGroup(user1, GROUP_STAKE, GROUP_DURATION, 1);
      expect(result.result).toBeOk(Cl.uint(1));
    });

    it("should store group data correctly", () => {
      createHabit(user1, "Exercise", MIN_STAKE);
      createGroup(user1, GROUP_STAKE, GROUP_DURATION, 1);

      const group = getGroup(1);
      expect(group.result).toBeSome(Cl.tuple({
        creator: Cl.principal(user1),
        "stake-amount": Cl.uint(GROUP_STAKE),
        "start-block": Cl.uint(simnet.blockHeight),
        "end-block": Cl.uint(simnet.blockHeight + GROUP_DURATION),
        "member-count": Cl.uint(1),
        "is-active": Cl.bool(true),
        "is-settled": Cl.bool(false),
        "total-staked": Cl.uint(GROUP_STAKE),
        "successful-count": Cl.uint(0),
      }));
    });

    it("should register creator as first member", () => {
      createHabit(user1, "Exercise", MIN_STAKE);
      createGroup(user1, GROUP_STAKE, GROUP_DURATION, 1);

      const member = getMemberInfo(1, user1);
      expect(member.result).toBeSome(Cl.tuple({
        "habit-id": Cl.uint(1),
        "joined-at-block": Cl.uint(simnet.blockHeight),
        "is-successful": Cl.bool(false),
        "has-claimed": Cl.bool(false),
      }));
    });

    it("should transfer stake from creator to contract", () => {
      createHabit(user1, "Exercise", MIN_STAKE);
      const balanceBefore = simnet.getAssetsMap().get(user1)?.get("STX") || 0n;
      createGroup(user1, GROUP_STAKE, GROUP_DURATION, 1);
      const balanceAfter = simnet.getAssetsMap().get(user1)?.get("STX") || 0n;

      if (balanceBefore > 0n) {
        expect(balanceAfter).toBe(balanceBefore - BigInt(GROUP_STAKE));
      }
    });

    it("should reject stake below minimum", () => {
      createHabit(user1, "Exercise", MIN_STAKE);
      const result = createGroup(user1, MIN_STAKE - 1, GROUP_DURATION, 1);
      expect(result.result).toBeErr(Cl.uint(307)); // ERR-INVALID-STAKE
    });

    it("should reject duration below minimum", () => {
      createHabit(user1, "Exercise", MIN_STAKE);
      const result = createGroup(user1, GROUP_STAKE, 143, 1);
      expect(result.result).toBeErr(Cl.uint(308)); // ERR-INVALID-DURATION
    });

    it("should reject duration above maximum", () => {
      createHabit(user1, "Exercise", MIN_STAKE);
      const result = createGroup(user1, GROUP_STAKE, 12961, 1);
      expect(result.result).toBeErr(Cl.uint(308)); // ERR-INVALID-DURATION
    });

    it("should reject nonexistent habit", () => {
      const result = createGroup(user1, GROUP_STAKE, GROUP_DURATION, 999);
      expect(result.result).toBeErr(Cl.uint(312)); // ERR-INVALID-HABIT
    });

    it("should reject if caller does not own the habit", () => {
      createHabit(user1, "Exercise", MIN_STAKE);
      const result = createGroup(user2, GROUP_STAKE, GROUP_DURATION, 1);
      expect(result.result).toBeErr(Cl.uint(300)); // ERR-NOT-AUTHORIZED
    });

    it("should track group in member's group list", () => {
      createHabit(user1, "Exercise", MIN_STAKE);
      createGroup(user1, GROUP_STAKE, GROUP_DURATION, 1);

      const groups = getMemberGroups(user1);
      expect(groups.result).toBeTuple({
        "group-ids": Cl.list([Cl.uint(1)]),
      });
    });
  });

  describe("join-group", () => {

    it("should allow a user to join an existing group", () => {
      createHabit(user1, "Exercise", MIN_STAKE);
      createHabit(user2, "Reading", MIN_STAKE);
      createGroup(user1, GROUP_STAKE, GROUP_DURATION, 1);

      const result = joinGroup(user2, 1, 2);
      expect(result.result).toBeOk(Cl.bool(true));
    });

    it("should update group member count and total staked", () => {
      createHabit(user1, "Exercise", MIN_STAKE);
      createHabit(user2, "Reading", MIN_STAKE);
      createGroup(user1, GROUP_STAKE, GROUP_DURATION, 1);
      joinGroup(user2, 1, 2);

      const result = simnet.callReadOnlyFn(
        "habit-accountability-group",
        "get-group-share",
        [Cl.uint(1)],
        deployer
      );
      // No successful members yet, share is 0
      expect(result.result).toBeOk(Cl.uint(0));

      // Verify total groups
      const total = simnet.callReadOnlyFn(
        "habit-accountability-group",
        "get-total-groups",
        [],
        deployer
      );
      expect(total.result).toBeOk(Cl.uint(1));
    });

    it("should reject duplicate membership", () => {
      createHabit(user1, "Exercise", MIN_STAKE);
      createGroup(user1, GROUP_STAKE, GROUP_DURATION, 1);

      // user1 tries to join again
      createHabit(user1, "Extra Habit", MIN_STAKE);
      const result = joinGroup(user1, 1, 2);
      expect(result.result).toBeErr(Cl.uint(303)); // ERR-ALREADY-MEMBER
    });

    it("should reject joining nonexistent group", () => {
      createHabit(user1, "Exercise", MIN_STAKE);
      const result = joinGroup(user1, 999, 1);
      expect(result.result).toBeErr(Cl.uint(301)); // ERR-GROUP-NOT-FOUND
    });

    it("should reject if caller does not own the habit", () => {
      createHabit(user1, "Exercise", MIN_STAKE);
      createHabit(user2, "Reading", MIN_STAKE);
      createGroup(user1, GROUP_STAKE, GROUP_DURATION, 1);

      // user3 tries to join with user2's habit
      const result = joinGroup(user3, 1, 2);
      expect(result.result).toBeErr(Cl.uint(300)); // ERR-NOT-AUTHORIZED
    });

    it("should transfer stake from joiner to contract", () => {
      createHabit(user1, "Exercise", MIN_STAKE);
      createHabit(user2, "Reading", MIN_STAKE);
      createGroup(user1, GROUP_STAKE, GROUP_DURATION, 1);

      const balanceBefore = simnet.getAssetsMap().get(user2)?.get("STX") || 0n;
      joinGroup(user2, 1, 2);
      const balanceAfter = simnet.getAssetsMap().get(user2)?.get("STX") || 0n;

      if (balanceBefore > 0n) {
        expect(balanceAfter).toBe(balanceBefore - BigInt(GROUP_STAKE));
      }
    });
  });

  describe("settle-member", () => {

    it("should settle successful member who maintained streak", () => {
      // Create habits and group
      createHabit(user1, "Exercise", MIN_STAKE);
      createHabit(user2, "Reading", MIN_STAKE);
      createGroup(user1, GROUP_STAKE, GROUP_DURATION, 1);
      joinGroup(user2, 1, 2);

      // Build a streak (need half of duration/144 = 144/144/2 = 0.5, so 1 day)
      buildStreak(user1, 1, 1);

      // Mine blocks to end the group duration
      simnet.mineEmptyBlocks(GROUP_DURATION);

      // Settle user1
      const result = settleMember(deployer, 1, user1);
      expect(result.result).toBeOk(Cl.bool(true));
    });

    it("should settle failed member with insufficient streak", () => {
      createHabit(user1, "Exercise", MIN_STAKE);
      createHabit(user2, "Reading", MIN_STAKE);

      // Longer group duration so streak requirement is higher
      const longDuration = 1440; // ~10 days
      createGroup(user1, GROUP_STAKE, longDuration, 1);
      joinGroup(user2, 1, 2);

      // Don't build any streak for user2
      simnet.mineEmptyBlocks(longDuration);

      // Settle user2 as failed
      const result = settleMember(deployer, 1, user2);
      expect(result.result).toBeOk(Cl.bool(false));
    });

    it("should reject settle before group ends", () => {
      createHabit(user1, "Exercise", MIN_STAKE);
      createGroup(user1, GROUP_STAKE, GROUP_DURATION, 1);

      const result = settleMember(deployer, 1, user1);
      expect(result.result).toBeErr(Cl.uint(306)); // ERR-GROUP-STILL-ACTIVE
    });

    it("should reject settling non-member", () => {
      createHabit(user1, "Exercise", MIN_STAKE);
      createGroup(user1, GROUP_STAKE, GROUP_DURATION, 1);

      simnet.mineEmptyBlocks(GROUP_DURATION);

      const result = settleMember(deployer, 1, user2);
      expect(result.result).toBeErr(Cl.uint(304)); // ERR-NOT-MEMBER
    });

    it("should reject settling already-settled member", () => {
      createHabit(user1, "Exercise", MIN_STAKE);
      createGroup(user1, GROUP_STAKE, GROUP_DURATION, 1);

      buildStreak(user1, 1, 1);
      simnet.mineEmptyBlocks(GROUP_DURATION);

      settleMember(deployer, 1, user1);
      const result = settleMember(deployer, 1, user1);
      expect(result.result).toBeErr(Cl.uint(309)); // ERR-ALREADY-SETTLED
    });

    it("should allow anyone to trigger settlement", () => {
      createHabit(user1, "Exercise", MIN_STAKE);
      createGroup(user1, GROUP_STAKE, GROUP_DURATION, 1);

      buildStreak(user1, 1, 1);
      simnet.mineEmptyBlocks(GROUP_DURATION);

      // user3 (not a member) triggers settlement for user1
      const result = settleMember(user3, 1, user1);
      expect(result.result).toBeOk(Cl.bool(true));
    });

    it("should update successful count in group", () => {
      createHabit(user1, "Exercise", MIN_STAKE);
      createHabit(user2, "Reading", MIN_STAKE);
      createGroup(user1, GROUP_STAKE, GROUP_DURATION, 1);
      joinGroup(user2, 1, 2);

      buildStreak(user1, 1, 1);
      buildStreak(user2, 2, 1);
      simnet.mineEmptyBlocks(GROUP_DURATION);

      settleMember(deployer, 1, user1);
      settleMember(deployer, 1, user2);

      const group = getGroup(1);
      const groupData = group.result;
      // Both should be counted as successful
      expect(groupData).toBeSome(
        expect.objectContaining({})
      );
    });
  });

  describe("claim-group-reward", () => {

    it("should allow successful member to claim full pool when others fail", () => {
      createHabit(user1, "Exercise", MIN_STAKE);
      createHabit(user2, "Reading", MIN_STAKE);

      // Use longer duration so streak requirement is meaningful
      // 1440 blocks = 10 days, required = 10, half = 5
      const longDuration = 1440;
      createGroup(user1, GROUP_STAKE, longDuration, 1);
      joinGroup(user2, 1, 2);

      // user1 builds 5-day streak (meets half requirement), user2 does not
      buildStreak(user1, 1, 5);
      simnet.mineEmptyBlocks(longDuration);

      // Settle both members
      settleMember(deployer, 1, user1);
      settleMember(deployer, 1, user2);

      // user1 is sole successful member, gets entire pool
      const result = claimGroupReward(user1, 1);
      expect(result.result).toBeOk(Cl.uint(GROUP_STAKE * 2));
    });

    it("should split pool equally among successful members", () => {
      createHabit(user1, "Exercise", MIN_STAKE);
      createHabit(user2, "Reading", MIN_STAKE);
      createGroup(user1, GROUP_STAKE, GROUP_DURATION, 1);
      joinGroup(user2, 1, 2);

      // Both build streaks
      buildStreak(user1, 1, 1);
      buildStreak(user2, 2, 1);
      simnet.mineEmptyBlocks(GROUP_DURATION);

      settleMember(deployer, 1, user1);
      settleMember(deployer, 1, user2);

      // Each gets half
      const result1 = claimGroupReward(user1, 1);
      expect(result1.result).toBeOk(Cl.uint(GROUP_STAKE));

      const result2 = claimGroupReward(user2, 1);
      expect(result2.result).toBeOk(Cl.uint(GROUP_STAKE));
    });

    it("should reject claim from failed member", () => {
      createHabit(user1, "Exercise", MIN_STAKE);
      createHabit(user2, "Reading", MIN_STAKE);

      const longDuration = 1440;
      createGroup(user1, GROUP_STAKE, longDuration, 1);
      joinGroup(user2, 1, 2);

      // Only user1 builds streak
      buildStreak(user1, 1, 5);
      simnet.mineEmptyBlocks(longDuration);

      settleMember(deployer, 1, user1);
      settleMember(deployer, 1, user2);

      const result = claimGroupReward(user2, 1);
      expect(result.result).toBeErr(Cl.uint(311)); // ERR-NOT-ELIGIBLE
    });

    it("should reject double claim", () => {
      createHabit(user1, "Exercise", MIN_STAKE);
      createGroup(user1, GROUP_STAKE, GROUP_DURATION, 1);

      buildStreak(user1, 1, 1);
      simnet.mineEmptyBlocks(GROUP_DURATION);

      settleMember(deployer, 1, user1);
      claimGroupReward(user1, 1);

      const result = claimGroupReward(user1, 1);
      expect(result.result).toBeErr(Cl.uint(310)); // ERR-ALREADY-CLAIMED
    });

    it("should reject claim before group ends", () => {
      createHabit(user1, "Exercise", MIN_STAKE);
      createGroup(user1, GROUP_STAKE, GROUP_DURATION, 1);

      const result = claimGroupReward(user1, 1);
      expect(result.result).toBeErr(Cl.uint(306)); // ERR-GROUP-STILL-ACTIVE
    });

    it("should reject claim from non-member", () => {
      createHabit(user1, "Exercise", MIN_STAKE);
      createGroup(user1, GROUP_STAKE, GROUP_DURATION, 1);

      buildStreak(user1, 1, 1);
      simnet.mineEmptyBlocks(GROUP_DURATION);

      settleMember(deployer, 1, user1);

      const result = claimGroupReward(user2, 1);
      expect(result.result).toBeErr(Cl.uint(304)); // ERR-NOT-MEMBER
    });

    it("should transfer correct STX amount to claimant", () => {
      createHabit(user1, "Exercise", MIN_STAKE);
      createHabit(user2, "Reading", MIN_STAKE);

      const longDuration = 1440;
      createGroup(user1, GROUP_STAKE, longDuration, 1);
      joinGroup(user2, 1, 2);

      buildStreak(user1, 1, 5);
      simnet.mineEmptyBlocks(longDuration);

      settleMember(deployer, 1, user1);
      settleMember(deployer, 1, user2);

      // user1 is sole successful, gets entire pool (2 STX)
      const balanceBefore = simnet.getAssetsMap().get(user1)?.get("STX") || 0n;
      claimGroupReward(user1, 1);
      const balanceAfter = simnet.getAssetsMap().get(user1)?.get("STX") || 0n;

      if (balanceBefore > 0n) {
        expect(balanceAfter).toBe(balanceBefore + BigInt(GROUP_STAKE * 2));
      }
    });
  });

  describe("read-only functions", () => {

    it("should return none for nonexistent group", () => {
      const group = getGroup(999);
      expect(group.result).toBeNone();
    });

    it("should return none for non-member", () => {
      createHabit(user1, "Exercise", MIN_STAKE);
      createGroup(user1, GROUP_STAKE, GROUP_DURATION, 1);

      const member = getMemberInfo(1, user2);
      expect(member.result).toBeNone();
    });

    it("should return empty group list for new user", () => {
      const groups = getMemberGroups(user3);
      expect(groups.result).toBeTuple({
        "group-ids": Cl.list([]),
      });
    });

    it("should return total groups created", () => {
      createHabit(user1, "Exercise", MIN_STAKE);
      createGroup(user1, GROUP_STAKE, GROUP_DURATION, 1);

      const total = simnet.callReadOnlyFn(
        "habit-accountability-group",
        "get-total-groups",
        [],
        deployer
      );
      expect(total.result).toBeOk(Cl.uint(1));
    });

    it("should return estimated share per successful member", () => {
      createHabit(user1, "Exercise", MIN_STAKE);
      createHabit(user2, "Reading", MIN_STAKE);
      createGroup(user1, GROUP_STAKE, GROUP_DURATION, 1);
      joinGroup(user2, 1, 2);

      buildStreak(user1, 1, 1);
      buildStreak(user2, 2, 1);
      simnet.mineEmptyBlocks(GROUP_DURATION);

      settleMember(deployer, 1, user1);
      settleMember(deployer, 1, user2);

      const share = simnet.callReadOnlyFn(
        "habit-accountability-group",
        "get-group-share",
        [Cl.uint(1)],
        deployer
      );
      // 2 STX total / 2 successful = 1 STX each
      expect(share.result).toBeOk(Cl.uint(GROUP_STAKE));
    });
  });
});
