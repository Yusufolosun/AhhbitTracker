import { createNetwork } from "@stacks/network";
import { assertStacksAddress, getRuntimeConfig } from "../shared/runtime-config";

const runtime = getRuntimeConfig();
const NETWORK = createNetwork({
  network: runtime.stacksNetwork,
  client: { baseUrl: runtime.stacksApiUrl },
});

async function checkBalance(address: string) {
  const normalizedAddress = assertStacksAddress(address, 'CLI address');

  console.log(`Checking balance for: ${normalizedAddress}`);
  console.log("=".repeat(70));
  
  const url = `${NETWORK.coreApiUrl}/v2/accounts/${normalizedAddress}`;
  const response = await fetch(url);

  if (!response.ok) {
    throw new Error(`Balance lookup failed: ${response.status} ${response.statusText}`);
  }

  const data = await response.json();
  
  const balanceMicroSTX = parseInt(data.balance);
  const balanceSTX = balanceMicroSTX / 1000000;
  
  console.log(`Balance: ${balanceSTX.toFixed(6)} STX`);
  console.log(`Balance: ${balanceMicroSTX} microSTX`);
  console.log();
  console.log("Account Details:");
  console.log(`  Nonce: ${data.nonce}`);
  console.log(`  Balance: ${balanceSTX} STX`);
  console.log(`  Locked: ${(parseInt(data.locked) / 1000000).toFixed(6)} STX`);
}

const address = process.argv[2];

if (!address) {
  console.log("Usage: ts-node check-balance.ts <address>");
  process.exit(1);
}

checkBalance(address).catch(console.error);
