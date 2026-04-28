import { Cl } from "@stacks/transactions";

const MIN_CHECK_IN_INTERVAL = 120;

export function createHabit(caller: string, name: string, stake: number) {
  return simnet.callPublicFn(
    "habit-tracker-v2",
    "create-habit",
    [Cl.stringUtf8(name), Cl.uint(stake)],
    caller,
  );
}

export function checkIn(caller: string, habitId: number) {
  return simnet.callPublicFn(
    "habit-tracker-v2",
    "check-in",
    [Cl.uint(habitId)],
    caller,
  );
}

export function withdrawStake(caller: string, habitId: number) {
  return simnet.callPublicFn(
    "habit-tracker-v2",
    "withdraw-stake",
    [Cl.uint(habitId)],
    caller,
  );
}

export function slashHabit(caller: string, habitId: number) {
  return simnet.callPublicFn(
    "habit-tracker-v2",
    "slash-habit",
    [Cl.uint(habitId)],
    caller,
  );
}

export function mineToNextCheckIn(): void {
  simnet.mineEmptyBlocks(MIN_CHECK_IN_INTERVAL);
}

export function mineBlocks(blocks: number): void {
  simnet.mineEmptyBlocks(blocks);
}

export function buildStreak(caller: string, habitId: number, days: number) {
  const results = [] as Array<ReturnType<typeof checkIn>>;
  for (let i = 0; i < days; i += 1) {
    mineToNextCheckIn();
    results.push(checkIn(caller, habitId));
  }
  return results;
}

export function readOkUint(result: any): number {
  const rawValue = result?.result?.value?.value ?? result?.result?.value ?? 0;
  return Number(rawValue);
}
