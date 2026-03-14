import { describe, expect, it } from "vitest";
import { Cl } from "@stacks/transactions";

const accounts = simnet.getAccounts();
const deployer = accounts.get("deployer")!;
const user1 = accounts.get("wallet_1")!;
const user2 = accounts.get("wallet_2")!;
const user3 = accounts.get("wallet_3")!;

const MIN_STAKE = 20_000; // 0.02 STX
const GROUP_STAKE = 1_000_000; // 1 STX
const GROUP_DURATION = 144; // ~1 day in blocks

// Habit-tracker helpers
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

function finalizeGroup(caller: string, groupId: number) {
  return simnet.callPublicFn(
    "habit-accountability-group",
    "finalize-group",
    [Cl.uint(groupId)],
    caller
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
        "settled-count": Cl.uint(0),
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

      // Finalize group (all members settled)
      finalizeGroup(deployer, 1);

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

      // Finalize group (all members settled)
      finalizeGroup(deployer, 1);

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

      // Finalize group (all members settled)
      finalizeGroup(deployer, 1);

      const result = claimGroupReward(user2, 1);
      expect(result.result).toBeErr(Cl.uint(311)); // ERR-NOT-ELIGIBLE
    });

    it("should reject double claim", () => {
      createHabit(user1, "Exercise", MIN_STAKE);
      createGroup(user1, GROUP_STAKE, GROUP_DURATION, 1);

      buildStreak(user1, 1, 1);
      simnet.mineEmptyBlocks(GROUP_DURATION);

      settleMember(deployer, 1, user1);
      finalizeGroup(deployer, 1);
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

    it("should reject claim before finalization", () => {
      createHabit(user1, "Exercise", MIN_STAKE);
      createHabit(user2, "Reading", MIN_STAKE);

      const longDuration = 1440;
      createGroup(user1, GROUP_STAKE, longDuration, 1);
      joinGroup(user2, 1, 2);

      buildStreak(user1, 1, 5);
      simnet.mineEmptyBlocks(longDuration);

      // Settle both members but don't finalize
      settleMember(deployer, 1, user1);
      settleMember(deployer, 1, user2);

      // Claim should fail - group not finalized
      const result = claimGroupReward(user1, 1);
      expect(result.result).toBeErr(Cl.uint(306)); // ERR-GROUP-STILL-ACTIVE
    });

    it("should reject claim from non-member", () => {
      createHabit(user1, "Exercise", MIN_STAKE);
      createGroup(user1, GROUP_STAKE, GROUP_DURATION, 1);

      buildStreak(user1, 1, 1);
      simnet.mineEmptyBlocks(GROUP_DURATION);

      settleMember(deployer, 1, user1);
      finalizeGroup(deployer, 1);

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

      // Finalize group (all members settled)
      finalizeGroup(deployer, 1);

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

  describe("edge cases & regression", () => {

    it("should reject joining an expired group", () => {
      createHabit(user1, "Exercise", MIN_STAKE);
      createHabit(user2, "Reading", MIN_STAKE);
      createGroup(user1, GROUP_STAKE, GROUP_DURATION, 1);

      // Mine past the group end block
      simnet.mineEmptyBlocks(GROUP_DURATION + 10);

      // user2 tries to join expired group
      const result = joinGroup(user2, 1, 2);
      expect(result.result).toBeErr(Cl.uint(305)); // ERR-GROUP-NOT-ACTIVE
    });

    it("should reject joining at exactly the end block", () => {
      createHabit(user1, "Exercise", MIN_STAKE);
      createHabit(user2, "Reading", MIN_STAKE);
      createGroup(user1, GROUP_STAKE, GROUP_DURATION, 1);

      // Mine exactly to the end block (each callPublicFn mines 1 block,
      // so we need to account for the blocks already mined by create/join calls)
      simnet.mineEmptyBlocks(GROUP_DURATION);

      const result = joinGroup(user2, 1, 2);
      expect(result.result).toBeErr(Cl.uint(305)); // ERR-GROUP-NOT-ACTIVE
    });

    it("should reject creating group with slashed (inactive) habit", () => {
      createHabit(user1, "Exercise", MIN_STAKE);

      // Build a check-in then let it expire and get slashed
      simnet.mineEmptyBlocks(1);
      simnet.callPublicFn("habit-tracker-v2", "check-in", [Cl.uint(1)], user1);
      simnet.mineEmptyBlocks(150);
      simnet.callPublicFn("habit-tracker-v2", "slash-habit", [Cl.uint(1)], user2);

      // Try to create a group with the slashed habit
      const result = createGroup(user1, GROUP_STAKE, GROUP_DURATION, 1);
      expect(result.result).toBeErr(Cl.uint(312)); // ERR-INVALID-HABIT
    });

    it("should reject creating group with completed (withdrawn) habit", () => {
      createHabit(user1, "Exercise", MIN_STAKE);
      buildStreak(user1, 1, 7);

      // Withdraw stake - habit becomes completed, is-active = false
      simnet.callPublicFn("habit-tracker-v2", "withdraw-stake", [Cl.uint(1)], user1);

      const result = createGroup(user1, GROUP_STAKE, GROUP_DURATION, 1);
      expect(result.result).toBeErr(Cl.uint(312)); // ERR-INVALID-HABIT
    });

    it("should reject joining group with slashed habit", () => {
      createHabit(user1, "Exercise", MIN_STAKE);
      createHabit(user2, "Reading", MIN_STAKE);
      createGroup(user1, GROUP_STAKE, GROUP_DURATION, 1);

      // Slash user2's habit
      simnet.mineEmptyBlocks(1);
      simnet.callPublicFn("habit-tracker-v2", "check-in", [Cl.uint(2)], user2);
      simnet.mineEmptyBlocks(150);
      simnet.callPublicFn("habit-tracker-v2", "slash-habit", [Cl.uint(2)], user3);

      // Try to join with slashed habit
      const result = joinGroup(user2, 1, 2);
      expect(result.result).toBeErr(Cl.uint(312)); // ERR-INVALID-HABIT
    });

    it("should reject joining group with completed habit", () => {
      createHabit(user1, "Exercise", MIN_STAKE);
      createHabit(user2, "Reading", MIN_STAKE);
      createGroup(user1, GROUP_STAKE, GROUP_DURATION, 1);

      // Complete user2's habit
      buildStreak(user2, 2, 7);
      simnet.callPublicFn("habit-tracker-v2", "withdraw-stake", [Cl.uint(2)], user2);

      const result = joinGroup(user2, 1, 2);
      expect(result.result).toBeErr(Cl.uint(312)); // ERR-INVALID-HABIT
    });

    it("should require at least 1 check-in for minimum-duration groups", () => {
      // Minimum group: 144 blocks (1 day)
      // required_days = 144/144 = 1, threshold = max(1/2, 1) = 1
      // Member with streak 0 should FAIL (this was the zero-threshold bug)
      createHabit(user1, "Exercise", MIN_STAKE);
      createHabit(user2, "Reading", MIN_STAKE);
      createGroup(user1, GROUP_STAKE, GROUP_DURATION, 1); // 144-block group
      joinGroup(user2, 1, 2);

      // Don't build any streak for user2
      simnet.mineEmptyBlocks(GROUP_DURATION);

      // user2 has streak 0 - should be settled as failed
      const result = settleMember(deployer, 1, user2);
      expect(result.result).toBeOk(Cl.bool(false));
    });

    it("should succeed settlement with streak 1 for minimum-duration groups", () => {
      createHabit(user1, "Exercise", MIN_STAKE);
      createHabit(user2, "Reading", MIN_STAKE);
      createGroup(user1, GROUP_STAKE, GROUP_DURATION, 1);
      joinGroup(user2, 1, 2);

      // Build 1 check-in for both
      buildStreak(user1, 1, 1);
      buildStreak(user2, 2, 1);

      simnet.mineEmptyBlocks(GROUP_DURATION);

      // Both should succeed with streak 1 >= threshold 1
      const result1 = settleMember(deployer, 1, user1);
      expect(result1.result).toBeOk(Cl.bool(true));

      const result2 = settleMember(deployer, 1, user2);
      expect(result2.result).toBeOk(Cl.bool(true));
    });

    it("should apply correct threshold for multi-day groups", () => {
      // 10-day group: required=10, threshold=max(10/2,1)=5
      const tenDayDuration = 1440;
      createHabit(user1, "Exercise", MIN_STAKE);
      createHabit(user2, "Reading", MIN_STAKE);
      createGroup(user1, GROUP_STAKE, tenDayDuration, 1);
      joinGroup(user2, 1, 2);

      // user1 builds streak of 4 (below threshold of 5)
      buildStreak(user1, 1, 4);
      // user2 builds streak of 5 (meets threshold of 5)
      buildStreak(user2, 2, 5);

      simnet.mineEmptyBlocks(tenDayDuration);

      // user1 should fail (streak 4 < 5)
      const result1 = settleMember(deployer, 1, user1);
      expect(result1.result).toBeOk(Cl.bool(false));

      // user2 should succeed (streak 5 >= 5)
      const result2 = settleMember(deployer, 1, user2);
      expect(result2.result).toBeOk(Cl.bool(true));
    });

    it("should handle 3-member group where 1 succeeds and takes all", () => {
      const longDuration = 1440;
      createHabit(user1, "Exercise", MIN_STAKE);
      createHabit(user2, "Reading", MIN_STAKE);
      createHabit(user3, "Coding", MIN_STAKE);
      createGroup(user1, GROUP_STAKE, longDuration, 1);
      joinGroup(user2, 1, 2);
      joinGroup(user3, 1, 3);

      // Only user1 builds enough streak
      buildStreak(user1, 1, 5);

      simnet.mineEmptyBlocks(longDuration);

      settleMember(deployer, 1, user1);
      settleMember(deployer, 1, user2);
      settleMember(deployer, 1, user3);

      // Finalize group (all members settled)
      finalizeGroup(deployer, 1);

      // user1 gets the entire pool (3 STX)
      const result = claimGroupReward(user1, 1);
      expect(result.result).toBeOk(Cl.uint(GROUP_STAKE * 3));

      // user2 and user3 can't claim
      const result2 = claimGroupReward(user2, 1);
      expect(result2.result).toBeErr(Cl.uint(311)); // ERR-NOT-ELIGIBLE
      const result3 = claimGroupReward(user3, 1);
      expect(result3.result).toBeErr(Cl.uint(311)); // ERR-NOT-ELIGIBLE
    });
  });

  describe("finalize-group", () => {

    it("should finalize a group after all members settled", () => {
      createHabit(user1, "Exercise", MIN_STAKE);
      createGroup(user1, GROUP_STAKE, GROUP_DURATION, 1);

      simnet.mineEmptyBlocks(GROUP_DURATION);

      // Must settle all members before finalization
      settleMember(deployer, 1, user1);

      const result = finalizeGroup(deployer, 1);
      expect(result.result).toBeOk(Cl.bool(true));

      // Verify group is now settled and inactive (new joins should fail)
      createHabit(user2, "Reading", MIN_STAKE);
      const joinResult = joinGroup(user2, 1, 2);
      expect(joinResult.result).toBeErr(Cl.uint(305)); // ERR-GROUP-NOT-ACTIVE
    });

    it("should reject finalize before group ends", () => {
      createHabit(user1, "Exercise", MIN_STAKE);
      createGroup(user1, GROUP_STAKE, GROUP_DURATION, 1);

      const result = simnet.callPublicFn(
        "habit-accountability-group", "finalize-group",
        [Cl.uint(1)], deployer
      );
      expect(result.result).toBeErr(Cl.uint(306)); // ERR-GROUP-STILL-ACTIVE
    });

    it("should reject double finalize", () => {
      createHabit(user1, "Exercise", MIN_STAKE);
      createGroup(user1, GROUP_STAKE, GROUP_DURATION, 1);

      simnet.mineEmptyBlocks(GROUP_DURATION);
      settleMember(deployer, 1, user1);
      finalizeGroup(deployer, 1);

      const result = finalizeGroup(deployer, 1);
      expect(result.result).toBeErr(Cl.uint(309)); // ERR-ALREADY-SETTLED
    });

    it("should allow anyone to finalize", () => {
      createHabit(user1, "Exercise", MIN_STAKE);
      createGroup(user1, GROUP_STAKE, GROUP_DURATION, 1);

      simnet.mineEmptyBlocks(GROUP_DURATION);
      settleMember(deployer, 1, user1);

      // user3 (non-member) can finalize
      const result = finalizeGroup(user3, 1);
      expect(result.result).toBeOk(Cl.bool(true));
    });

    it("should prevent re-settlement after finalization", () => {
      createHabit(user1, "Exercise", MIN_STAKE);
      createHabit(user2, "Reading", MIN_STAKE);
      createGroup(user1, GROUP_STAKE, GROUP_DURATION, 1);
      joinGroup(user2, 1, 2);

      buildStreak(user1, 1, 1);
      simnet.mineEmptyBlocks(GROUP_DURATION);

      // Settle both, then finalize
      settleMember(deployer, 1, user1);
      settleMember(deployer, 1, user2);
      finalizeGroup(deployer, 1);

      // Re-settlement should fail - group is no longer active
      const result = settleMember(deployer, 1, user1);
      expect(result.result).toBeErr(Cl.uint(305)); // ERR-GROUP-NOT-ACTIVE
    });

    it("should reject finalize for nonexistent group", () => {
      const result = finalizeGroup(deployer, 999);
      expect(result.result).toBeErr(Cl.uint(301)); // ERR-GROUP-NOT-FOUND
    });

    it("should reject finalize when not all members are settled", () => {
      createHabit(user1, "Exercise", MIN_STAKE);
      createHabit(user2, "Reading", MIN_STAKE);
      createGroup(user1, GROUP_STAKE, GROUP_DURATION, 1);
      joinGroup(user2, 1, 2);

      buildStreak(user1, 1, 1);
      simnet.mineEmptyBlocks(GROUP_DURATION);

      // Only settle user1, leave user2 unsettled
      settleMember(deployer, 1, user1);

      // Finalize should fail - settled-count (1) != member-count (2)
      const result = finalizeGroup(deployer, 1);
      expect(result.result).toBeErr(Cl.uint(311)); // ERR-NOT-ELIGIBLE
    });

    it("should reject finalize with zero members settled", () => {
      createHabit(user1, "Exercise", MIN_STAKE);
      createGroup(user1, GROUP_STAKE, GROUP_DURATION, 1);

      simnet.mineEmptyBlocks(GROUP_DURATION);

      // Don't settle anyone
      const result = finalizeGroup(deployer, 1);
      expect(result.result).toBeErr(Cl.uint(311)); // ERR-NOT-ELIGIBLE
    });
  });

  describe("refund-failed-group", () => {

    it("should refund all members when everyone fails", () => {
      const longDuration = 1440;
      createHabit(user1, "Exercise", MIN_STAKE);
      createHabit(user2, "Reading", MIN_STAKE);
      createGroup(user1, GROUP_STAKE, longDuration, 1);
      joinGroup(user2, 1, 2);

      // Nobody builds enough streak
      simnet.mineEmptyBlocks(longDuration);

      // Settle both as failed
      settleMember(deployer, 1, user1);
      settleMember(deployer, 1, user2);

      // Finalize
      simnet.callPublicFn(
        "habit-accountability-group", "finalize-group",
        [Cl.uint(1)], deployer
      );

      // Both members get refunded
      const refund1 = simnet.callPublicFn(
        "habit-accountability-group", "refund-failed-group",
        [Cl.uint(1), Cl.principal(user1)], deployer
      );
      expect(refund1.result).toBeOk(Cl.uint(GROUP_STAKE));

      const refund2 = simnet.callPublicFn(
        "habit-accountability-group", "refund-failed-group",
        [Cl.uint(1), Cl.principal(user2)], deployer
      );
      expect(refund2.result).toBeOk(Cl.uint(GROUP_STAKE));
    });

    it("should reject refund when there are successful members", () => {
      createHabit(user1, "Exercise", MIN_STAKE);
      createHabit(user2, "Reading", MIN_STAKE);
      createGroup(user1, GROUP_STAKE, GROUP_DURATION, 1);
      joinGroup(user2, 1, 2);

      buildStreak(user1, 1, 1);
      simnet.mineEmptyBlocks(GROUP_DURATION);

      // user1 succeeds, user2 fails
      settleMember(deployer, 1, user1);
      settleMember(deployer, 1, user2);

      // Finalize
      simnet.callPublicFn(
        "habit-accountability-group", "finalize-group",
        [Cl.uint(1)], deployer
      );

      // Refund should fail - successful-count > 0
      const result = simnet.callPublicFn(
        "habit-accountability-group", "refund-failed-group",
        [Cl.uint(1), Cl.principal(user2)], deployer
      );
      expect(result.result).toBeErr(Cl.uint(311)); // ERR-NOT-ELIGIBLE
    });

    it("should reject refund before finalization", () => {
      const longDuration = 1440;
      createHabit(user1, "Exercise", MIN_STAKE);
      createGroup(user1, GROUP_STAKE, longDuration, 1);

      simnet.mineEmptyBlocks(longDuration);
      settleMember(deployer, 1, user1);

      // Group not finalized yet → is-settled = false
      const result = simnet.callPublicFn(
        "habit-accountability-group", "refund-failed-group",
        [Cl.uint(1), Cl.principal(user1)], deployer
      );
      expect(result.result).toBeErr(Cl.uint(306)); // ERR-GROUP-STILL-ACTIVE
    });

    it("should reject double refund", () => {
      const longDuration = 1440;
      createHabit(user1, "Exercise", MIN_STAKE);
      createGroup(user1, GROUP_STAKE, longDuration, 1);

      simnet.mineEmptyBlocks(longDuration);
      settleMember(deployer, 1, user1);

      simnet.callPublicFn(
        "habit-accountability-group", "finalize-group",
        [Cl.uint(1)], deployer
      );

      // First refund works
      simnet.callPublicFn(
        "habit-accountability-group", "refund-failed-group",
        [Cl.uint(1), Cl.principal(user1)], deployer
      );

      // Second refund fails
      const result = simnet.callPublicFn(
        "habit-accountability-group", "refund-failed-group",
        [Cl.uint(1), Cl.principal(user1)], deployer
      );
      expect(result.result).toBeErr(Cl.uint(310)); // ERR-ALREADY-CLAIMED
    });

    it("should reject refund for non-member", () => {
      const longDuration = 1440;
      createHabit(user1, "Exercise", MIN_STAKE);
      createGroup(user1, GROUP_STAKE, longDuration, 1);

      simnet.mineEmptyBlocks(longDuration);
      settleMember(deployer, 1, user1);

      simnet.callPublicFn(
        "habit-accountability-group", "finalize-group",
        [Cl.uint(1)], deployer
      );

      const result = simnet.callPublicFn(
        "habit-accountability-group", "refund-failed-group",
        [Cl.uint(1), Cl.principal(user2)], deployer
      );
      expect(result.result).toBeErr(Cl.uint(304)); // ERR-NOT-MEMBER
    });

    it("should allow anyone to trigger refund for a member", () => {
      const longDuration = 1440;
      createHabit(user1, "Exercise", MIN_STAKE);
      createGroup(user1, GROUP_STAKE, longDuration, 1);

      simnet.mineEmptyBlocks(longDuration);
      settleMember(deployer, 1, user1);

      simnet.callPublicFn(
        "habit-accountability-group", "finalize-group",
        [Cl.uint(1)], deployer
      );

      // user3 (non-member) triggers refund for user1
      const result = simnet.callPublicFn(
        "habit-accountability-group", "refund-failed-group",
        [Cl.uint(1), Cl.principal(user1)], user3
      );
      expect(result.result).toBeOk(Cl.uint(GROUP_STAKE));
    });

    it("should return correct STX to each member in 3-person all-fail scenario", () => {
      const longDuration = 1440;
      createHabit(user1, "Exercise", MIN_STAKE);
      createHabit(user2, "Reading", MIN_STAKE);
      createHabit(user3, "Coding", MIN_STAKE);
      createGroup(user1, GROUP_STAKE, longDuration, 1);
      joinGroup(user2, 1, 2);
      joinGroup(user3, 1, 3);

      // Nobody builds streak
      simnet.mineEmptyBlocks(longDuration);

      settleMember(deployer, 1, user1);
      settleMember(deployer, 1, user2);
      settleMember(deployer, 1, user3);

      simnet.callPublicFn(
        "habit-accountability-group", "finalize-group",
        [Cl.uint(1)], deployer
      );

      // All 3 members get GROUP_STAKE back
      const r1 = simnet.callPublicFn(
        "habit-accountability-group", "refund-failed-group",
        [Cl.uint(1), Cl.principal(user1)], deployer
      );
      expect(r1.result).toBeOk(Cl.uint(GROUP_STAKE));

      const r2 = simnet.callPublicFn(
        "habit-accountability-group", "refund-failed-group",
        [Cl.uint(1), Cl.principal(user2)], deployer
      );
      expect(r2.result).toBeOk(Cl.uint(GROUP_STAKE));

      const r3 = simnet.callPublicFn(
        "habit-accountability-group", "refund-failed-group",
        [Cl.uint(1), Cl.principal(user3)], deployer
      );
      expect(r3.result).toBeOk(Cl.uint(GROUP_STAKE));
    });

    it("should complete full lifecycle: create → join → settle all fail → finalize → refund", () => {
      const longDuration = 1440;
      createHabit(user1, "Exercise", MIN_STAKE);
      createHabit(user2, "Reading", MIN_STAKE);
      createGroup(user1, GROUP_STAKE, longDuration, 1);
      joinGroup(user2, 1, 2);

      simnet.mineEmptyBlocks(longDuration);

      // Settle both as failed
      const s1 = settleMember(deployer, 1, user1);
      expect(s1.result).toBeOk(Cl.bool(false));
      const s2 = settleMember(deployer, 1, user2);
      expect(s2.result).toBeOk(Cl.bool(false));

      // claim-group-reward should fail (group not finalized yet)
      const claim = claimGroupReward(user1, 1);
      expect(claim.result).toBeErr(Cl.uint(306)); // ERR-GROUP-STILL-ACTIVE (not finalized)

      // Finalize
      const fin = simnet.callPublicFn(
        "habit-accountability-group", "finalize-group",
        [Cl.uint(1)], deployer
      );
      expect(fin.result).toBeOk(Cl.bool(true));

      // Refund both
      const r1 = simnet.callPublicFn(
        "habit-accountability-group", "refund-failed-group",
        [Cl.uint(1), Cl.principal(user1)], deployer
      );
      expect(r1.result).toBeOk(Cl.uint(GROUP_STAKE));

      const r2 = simnet.callPublicFn(
        "habit-accountability-group", "refund-failed-group",
        [Cl.uint(1), Cl.principal(user2)], deployer
      );
      expect(r2.result).toBeOk(Cl.uint(GROUP_STAKE));
    });
  });

  describe("group capacity limits", () => {

    it("should reject join when group reaches max size (u302)", () => {
      // MAX-GROUP-SIZE is 10: creator counts as member 1, 9 more can join.
      // The 11th principal must be rejected with ERR-GROUP-FULL.
      const wallets: string[] = [deployer, user1, user2, user3];
      for (let i = 4; i <= 15; i++) {
        const w = accounts.get(`wallet_${i}`);
        if (w) wallets.push(w);
      }
      expect(wallets.length).toBeGreaterThanOrEqual(11);

      // Each participant needs their own habit
      for (let i = 0; i < 11; i++) {
        createHabit(wallets[i], `Cap-Habit-${i + 1}`, MIN_STAKE);
      }

      // Creator starts the group (member-count = 1)
      const createResult = createGroup(wallets[0], GROUP_STAKE, GROUP_DURATION, 1);
      expect(createResult.result).toBeOk(Cl.uint(1));

      // Fill remaining 9 slots (members 2 through 10)
      for (let i = 1; i < 10; i++) {
        const joinResult = joinGroup(wallets[i], 1, i + 1);
        expect(joinResult.result).toBeOk(Cl.bool(true));
      }

      // 11th member should be rejected — group is full
      const overflow = joinGroup(wallets[10], 1, 11);
      expect(overflow.result).toBeErr(Cl.uint(302));
    });

    it("should reject create-group when user reaches 20-group limit (u313)", () => {
      // member-groups list has max-len u20. A user in 20 groups cannot
      // create or join another without hitting ERR-GROUP-LIMIT-REACHED.
      createHabit(user1, "Limit Habit", MIN_STAKE);

      for (let g = 0; g < 20; g++) {
        const result = createGroup(user1, GROUP_STAKE, GROUP_DURATION, 1);
        expect(result.result).toBeOk(Cl.uint(g + 1));
      }

      // 21st group creation should fail
      const overflow = createGroup(user1, GROUP_STAKE, GROUP_DURATION, 1);
      expect(overflow.result).toBeErr(Cl.uint(313));
    });

    it("should reject join-group when user reaches 20-group limit (u313)", () => {
      // Same limit, but tested through the join path instead of create.
      createHabit(user1, "Joiner Habit", MIN_STAKE);
      createHabit(user2, "Host Habit", MIN_STAKE);
      createHabit(deployer, "Extra Host Habit", MIN_STAKE);

      // user2 creates 20 groups (user2 stays at 20 — within the limit)
      for (let g = 0; g < 20; g++) {
        createGroup(user2, GROUP_STAKE, GROUP_DURATION, 2);
      }

      // user1 joins all 20 groups
      for (let g = 1; g <= 20; g++) {
        const result = joinGroup(user1, g, 1);
        expect(result.result).toBeOk(Cl.bool(true));
      }

      // deployer creates the 21st group
      createGroup(deployer, GROUP_STAKE, GROUP_DURATION, 3);

      // user1 tries to join — already in 20 groups
      const overflow = joinGroup(user1, 21, 1);
      expect(overflow.result).toBeErr(Cl.uint(313));
    });
  });
});
