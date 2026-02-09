import { Cl } from "@stacks/transactions";

const CONTRACT_ADDRESS = "SP1M46W6CVGAMH3ZJD3TKMY5KCY48HWAZK0DYG193";
const CONTRACT_NAME = "habit-tracker";
const NETWORK_API = "https://api.mainnet.hiro.so";

console.log("AhhbitTracker Mainnet Interaction");
console.log("Network: Mainnet");
console.log("API:", NETWORK_API);
console.log("Contract:", `${CONTRACT_ADDRESS}.${CONTRACT_NAME}`);

export async function createHabit(name: string, stakeAmount: number) {
  console.log("\nCreating habit:");
  console.log("  Name:", name);
  console.log("  Stake:", stakeAmount, "microSTX");
  console.log("  Contract:", `${CONTRACT_ADDRESS}.${CONTRACT_NAME}`);
  console.log("\nUse wallet or Clarinet console to execute:");
  console.log(`(contract-call? '${CONTRACT_ADDRESS}.${CONTRACT_NAME} create-habit u"${name}" u${stakeAmount})`);
}

export async function checkIn(habitId: number) {
  console.log("\nChecking in for habit:", habitId);
  console.log("  Contract:", `${CONTRACT_ADDRESS}.${CONTRACT_NAME}`);
  console.log("\nUse wallet or Clarinet console to execute:");
  console.log(`(contract-call? '${CONTRACT_ADDRESS}.${CONTRACT_NAME} check-in u${habitId})`);
}

export async function withdrawStake(habitId: number) {
  console.log("\nWithdrawing stake for habit:", habitId);
  console.log("  Contract:", `${CONTRACT_ADDRESS}.${CONTRACT_NAME}`);
  console.log("\nUse wallet or Clarinet console to execute:");
  console.log(`(contract-call? '${CONTRACT_ADDRESS}.${CONTRACT_NAME} withdraw-stake u${habitId})`);
}

export async function getHabit(habitId: number) {
  console.log("\nFetching habit:", habitId);
  console.log("  Contract:", `${CONTRACT_ADDRESS}.${CONTRACT_NAME}`);
  console.log("\nUse wallet or Clarinet console to execute:");
  console.log(`(contract-call? '${CONTRACT_ADDRESS}.${CONTRACT_NAME} get-habit u${habitId})`);
}

export async function getPoolBalance() {
  console.log("\nFetching forfeited pool balance");
  console.log("  Contract:", `${CONTRACT_ADDRESS}.${CONTRACT_NAME}`);
  console.log("\nUse wallet or Clarinet console to execute:");
  console.log(`(contract-call? '${CONTRACT_ADDRESS}.${CONTRACT_NAME} get-pool-balance)`);
}

if (import.meta.url === `file://${process.argv[1]}`) {
  console.log("\nAvailable functions:");
  console.log("  - createHabit(name, stakeAmount)");
  console.log("  - checkIn(habitId)");
  console.log("  - withdrawStake(habitId)");
  console.log("  - getHabit(habitId)");
  console.log("  - getPoolBalance()");
}
