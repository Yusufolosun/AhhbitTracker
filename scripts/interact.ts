import 'dotenv/config';

const CONTRACT_ADDRESS = process.env.CONTRACT_ADDRESS || "SP1N3809W9CBWWX04KN3TCQHP8A9GN520BD4JMP8Z";
const CONTRACT_NAME = process.env.CONTRACT_NAME || "habit-tracker-v2";
const NETWORK_API = process.env.STACKS_API_URL || "https://api.mainnet.hiro.so";

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
