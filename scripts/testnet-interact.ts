import { Cl } from "@stacks/transactions";
import { StacksTestnet } from "@stacks/network";

const NETWORK = new StacksTestnet();
const CONTRACT_ADDRESS = "ST..."; // To be filled after testnet deployment
const CONTRACT_NAME = "habit-tracker";

console.log("AhhbitTracker Testnet Interaction");
console.log("Network:", NETWORK.version);
console.log("API:", NETWORK.coreApiUrl);

export async function createTestHabit(name: string, stakeAmount: number) {
  console.log("\nCreating test habit:");
  console.log("  Name:", name);
  console.log("  Stake:", stakeAmount, "microSTX");
  console.log("  Contract:", `${CONTRACT_ADDRESS}.${CONTRACT_NAME}`);
  console.log("\nUse Clarinet console or wallet to execute:");
  console.log(`(contract-call? '${CONTRACT_ADDRESS}.${CONTRACT_NAME} create-habit u"${name}" u${stakeAmount})`);
}

export async function testCheckIn(habitId: number) {
  console.log("\nChecking in for habit:", habitId);
  console.log("  Contract:", `${CONTRACT_ADDRESS}.${CONTRACT_NAME}`);
  console.log("\nUse Clarinet console or wallet to execute:");
  console.log(`(contract-call? '${CONTRACT_ADDRESS}.${CONTRACT_NAME} check-in u${habitId})`);
}

export async function testWithdrawStake(habitId: number) {
  console.log("\nWithdrawing stake for habit:", habitId);
  console.log("  Contract:", `${CONTRACT_ADDRESS}.${CONTRACT_NAME}`);
  console.log("\nUse Clarinet console or wallet to execute:");
  console.log(`(contract-call? '${CONTRACT_ADDRESS}.${CONTRACT_NAME} withdraw-stake u${habitId})`);
}

export async function testGetHabit(habitId: number) {
  console.log("\nFetching habit:", habitId);
  console.log("  Contract:", `${CONTRACT_ADDRESS}.${CONTRACT_NAME}`);
  console.log("\nUse Clarinet console or wallet to execute:");
  console.log(`(contract-call? '${CONTRACT_ADDRESS}.${CONTRACT_NAME} get-habit u${habitId})`);
}

export async function testGetPoolBalance() {
  console.log("\nFetching forfeited pool balance");
  console.log("  Contract:", `${CONTRACT_ADDRESS}.${CONTRACT_NAME}`);
  console.log("\nUse Clarinet console or wallet to execute:");
  console.log(`(contract-call? '${CONTRACT_ADDRESS}.${CONTRACT_NAME} get-forfeited-pool-balance)`);
}

if (import.meta.url === `file://${process.argv[1]}`) {
  console.log("\nAvailable test functions:");
  console.log("  - createTestHabit(name, stakeAmount)");
  console.log("  - testCheckIn(habitId)");
  console.log("  - testWithdrawStake(habitId)");
  console.log("  - testGetHabit(habitId)");
  console.log("  - testGetPoolBalance()");
  console.log("\nUpdate CONTRACT_ADDRESS after deployment");
}
