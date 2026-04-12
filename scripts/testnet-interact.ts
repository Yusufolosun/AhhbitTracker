import { getContractPrincipal, getRuntimeConfig } from "./shared/runtime-config";

const runtime = getRuntimeConfig();
const NETWORK_API = runtime.stacksApiUrl;
const CONTRACT_PRINCIPAL = getContractPrincipal(runtime);

console.log("AhhbitTracker Contract Interaction");
console.log("Network:", runtime.stacksNetwork);
console.log("API:", NETWORK_API);

export async function createTestHabit(name: string, stakeAmount: number) {
  console.log("\nCreating test habit:");
  console.log("  Name:", name);
  console.log("  Stake:", stakeAmount, "microSTX");
  console.log("  Contract:", CONTRACT_PRINCIPAL);
  console.log("\nUse Clarinet console or wallet to execute:");
  console.log(`(contract-call? '${CONTRACT_PRINCIPAL} create-habit u"${name}" u${stakeAmount})`);
}

export async function testCheckIn(habitId: number) {
  console.log("\nChecking in for habit:", habitId);
  console.log("  Contract:", CONTRACT_PRINCIPAL);
  console.log("\nUse Clarinet console or wallet to execute:");
  console.log(`(contract-call? '${CONTRACT_PRINCIPAL} check-in u${habitId})`);
}

export async function testWithdrawStake(habitId: number) {
  console.log("\nWithdrawing stake for habit:", habitId);
  console.log("  Contract:", CONTRACT_PRINCIPAL);
  console.log("\nUse Clarinet console or wallet to execute:");
  console.log(`(contract-call? '${CONTRACT_PRINCIPAL} withdraw-stake u${habitId})`);
}

export async function testGetHabit(habitId: number) {
  console.log("\nFetching habit:", habitId);
  console.log("  Contract:", CONTRACT_PRINCIPAL);
  console.log("\nUse Clarinet console or wallet to execute:");
  console.log(`(contract-call? '${CONTRACT_PRINCIPAL} get-habit u${habitId})`);
}

export async function testGetPoolBalance() {
  console.log("\nFetching forfeited pool balance");
  console.log("  Contract:", CONTRACT_PRINCIPAL);
  console.log("\nUse Clarinet console or wallet to execute:");
  console.log(`(contract-call? '${CONTRACT_PRINCIPAL} get-pool-balance)`);
}

if (import.meta.url === `file://${process.argv[1]}`) {
  console.log("\nAvailable test functions:");
  console.log("  - createTestHabit(name, stakeAmount)");
  console.log("  - testCheckIn(habitId)");
  console.log("  - testWithdrawStake(habitId)");
  console.log("  - testGetHabit(habitId)");
  console.log("  - testGetPoolBalance()");
  console.log("\nConfiguration is loaded from validated runtime env variables.");
}
