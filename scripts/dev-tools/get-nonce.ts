import { getNonce } from "@stacks/transactions";
import { StacksMainnet } from "@stacks/network";

const NETWORK = new StacksMainnet();

async function checkNonce(address: string) {
  console.log(`Checking nonce for: ${address}`);
  console.log("=".repeat(70));
  
  const nonce = await getNonce(address, NETWORK);
  
  console.log(`Current Nonce: ${nonce}`);
  console.log(`Next Transaction Nonce: ${Number(nonce)}`);
  console.log();
  console.log("Use this nonce for your next transaction");
}

const address = process.argv[2];

if (!address) {
  console.log("Usage: ts-node get-nonce.ts <address>");
  process.exit(1);
}

checkNonce(address).catch(console.error);
