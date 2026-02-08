import { Cl } from "@stacks/transactions";
import { StacksMainnet } from "@stacks/network";

const NETWORK = new StacksMainnet();
const CONTRACT_ADDRESS = "SP..."; // To be filled after deployment
const CONTRACT_NAME = "habit-tracker";

export async function createHabit(name: string, stakeAmount: number) {
  console.log("Creating habit:", name);
  console.log("Stake amount:", stakeAmount, "microSTX");
}

export async function checkIn(habitId: number) {
  console.log("Checking in for habit:", habitId);
}

export async function withdrawStake(habitId: number) {
  console.log("Withdrawing stake for habit:", habitId);
}

export async function getHabit(habitId: number) {
  console.log("Fetching habit:", habitId);
}
