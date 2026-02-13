import { StacksMainnet } from "@stacks/network";

const NETWORK = new StacksMainnet();

async function checkBalance(address: string) {
  console.log(`Checking balance for: ${address}`);
  console.log("=".repeat(70));
  
  const url = `${NETWORK.coreApiUrl}/v2/accounts/${address}`;
  const response = await fetch(url);
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
