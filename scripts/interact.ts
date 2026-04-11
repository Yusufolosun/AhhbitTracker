import { getContractPrincipal, getRuntimeConfig } from './shared/runtime-config';

const runtime = getRuntimeConfig();
const CONTRACT_ADDRESS = runtime.contractAddress;
const CONTRACT_NAME = runtime.contractName;
const NETWORK_API = runtime.stacksApiUrl;
const CONTRACT_PRINCIPAL = getContractPrincipal(runtime);

console.log("AhhbitTracker Mainnet Interaction");
console.log("Stage:", runtime.stage);
console.log("Network:", runtime.stacksNetwork);
console.log("API:", NETWORK_API);
console.log("Contract:", CONTRACT_PRINCIPAL);

export async function createHabit(name: string, stakeAmount: number) {
  console.log("\nCreating habit:");
  console.log("  Name:", name);
  console.log("  Stake:", stakeAmount, "microSTX");
  console.log("  Contract:", CONTRACT_PRINCIPAL);
  console.log("\nUse wallet or Clarinet console to execute:");
  console.log(`(contract-call? '${CONTRACT_PRINCIPAL} create-habit u"${name}" u${stakeAmount})`);
}

export async function checkIn(habitId: number) {
  console.log("\nChecking in for habit:", habitId);
  console.log("  Contract:", CONTRACT_PRINCIPAL);
  console.log("\nUse wallet or Clarinet console to execute:");
  console.log(`(contract-call? '${CONTRACT_PRINCIPAL} check-in u${habitId})`);
}

export async function withdrawStake(habitId: number) {
  console.log("\nWithdrawing stake for habit:", habitId);
  console.log("  Contract:", CONTRACT_PRINCIPAL);
  console.log("\nUse wallet or Clarinet console to execute:");
  console.log(`(contract-call? '${CONTRACT_PRINCIPAL} withdraw-stake u${habitId})`);
}

export async function getHabit(habitId: number) {
  console.log("\nFetching habit:", habitId);
  console.log("  Contract:", CONTRACT_PRINCIPAL);
  console.log("\nUse wallet or Clarinet console to execute:");
  console.log(`(contract-call? '${CONTRACT_PRINCIPAL} get-habit u${habitId})`);
}

export async function getPoolBalance() {
  console.log("\nFetching forfeited pool balance");
  console.log("  Contract:", CONTRACT_PRINCIPAL);
  console.log("\nUse wallet or Clarinet console to execute:");
  console.log(`(contract-call? '${CONTRACT_PRINCIPAL} get-pool-balance)`);
}

if (import.meta.url === `file://${process.argv[1]}`) {
  console.log("\nAvailable functions:");
  console.log("  - createHabit(name, stakeAmount)");
  console.log("  - checkIn(habitId)");
  console.log("  - withdrawStake(habitId)");
  console.log("  - getHabit(habitId)");
  console.log("  - getPoolBalance()");
}
